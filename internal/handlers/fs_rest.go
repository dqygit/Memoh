package handlers

import (
	"errors"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"
	"time"

	"github.com/labstack/echo/v4"

	"github.com/memohai/memoh/internal/config"
)

type FSListResponse struct {
	Path    string        `json:"path"`
	Entries []FSRestEntry `json:"entries"`
}

type FSRestEntry struct {
	Path    string    `json:"path"`
	IsDir   bool      `json:"is_dir"`
	Size    int64     `json:"size"`
	Mode    uint32    `json:"mode"`
	ModTime time.Time `json:"mod_time"`
}

type FSReadResponse struct {
	Path    string    `json:"path"`
	Content string    `json:"content"`
	Size    int64     `json:"size"`
	Mode    uint32    `json:"mode"`
	ModTime time.Time `json:"mod_time"`
}

type FSStatResponse struct {
	Path    string    `json:"path"`
	IsDir   bool      `json:"is_dir"`
	Size    int64     `json:"size"`
	Mode    uint32    `json:"mode"`
	ModTime time.Time `json:"mod_time"`
}

type FSUsageResponse struct {
	Path       string `json:"path"`
	TotalBytes int64  `json:"total_bytes"`
	FileCount  int64  `json:"file_count"`
	DirCount   int64  `json:"dir_count"`
}

type FSWriteRequest struct {
	Path      string `json:"path"`
	Content   string `json:"content"`
	Overwrite *bool  `json:"overwrite"`
}

type FSWriteResponse struct {
	OK bool `json:"ok"`
}

type FSMkdirRequest struct {
	Path    string `json:"path"`
	Parents *bool  `json:"parents"`
}

type FSDeleteResponse struct {
	OK bool `json:"ok"`
}

// ListFS godoc
// @Summary List files for a bot
// @Description List entries under a relative path
// @Tags fs
// @Param bot_id path string true "Bot ID"
// @Param path query string false "Relative directory path"
// @Param recursive query bool false "Recursive listing"
// @Success 200 {object} FSListResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /bots/{bot_id}/container/fs [get]
func (h *ContainerdHandler) ListFS(c echo.Context) error {
	botID, err := h.requireBotAccess(c)
	if err != nil {
		return err
	}
	root, err := h.ensureBotDataRoot(botID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	recursive, err := parseBoolQuery(c, "recursive")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	target, rel, err := resolveBotPath(root, c.QueryParam("path"), true)
	if err != nil {
		return fsHTTPError(err)
	}
	info, err := os.Stat(target)
	if err != nil {
		return fsHTTPError(err)
	}
	if !info.IsDir() {
		return echo.NewHTTPError(http.StatusBadRequest, "path is not a directory")
	}

	entries := []FSRestEntry{}
	if recursive {
		err = filepath.WalkDir(target, func(p string, d os.DirEntry, walkErr error) error {
			if walkErr != nil {
				return walkErr
			}
			if p == target {
				return nil
			}
			entryInfo, err := d.Info()
			if err != nil {
				return err
			}
			entry, err := entryForBotPath(root, p, entryInfo)
			if err != nil {
				return err
			}
			entries = append(entries, entry)
			return nil
		})
	} else {
		dirEntries, err := os.ReadDir(target)
		if err != nil {
			return fsHTTPError(err)
		}
		for _, entry := range dirEntries {
			entryInfo, err := entry.Info()
			if err != nil {
				return fsHTTPError(err)
			}
			fullPath := filepath.Join(target, entry.Name())
			fileEntry, err := entryForBotPath(root, fullPath, entryInfo)
			if err != nil {
				return fsHTTPError(err)
			}
			entries = append(entries, fileEntry)
		}
	}
	if err != nil {
		return fsHTTPError(err)
	}

	listedPath := strings.TrimSpace(rel)
	if listedPath == "" || listedPath == "." {
		listedPath = "."
	}
	return c.JSON(http.StatusOK, FSListResponse{Path: listedPath, Entries: entries})
}

// ReadFSFile godoc
// @Summary Read file content
// @Tags fs
// @Param bot_id path string true "Bot ID"
// @Param path query string true "Relative file path"
// @Success 200 {object} FSReadResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /bots/{bot_id}/container/fs/file [get]
func (h *ContainerdHandler) ReadFSFile(c echo.Context) error {
	botID, err := h.requireBotAccess(c)
	if err != nil {
		return err
	}
	root, err := h.ensureBotDataRoot(botID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	target, rel, err := resolveBotPath(root, c.QueryParam("path"), false)
	if err != nil {
		return fsHTTPError(err)
	}
	info, err := os.Stat(target)
	if err != nil {
		return fsHTTPError(err)
	}
	if info.IsDir() {
		return echo.NewHTTPError(http.StatusBadRequest, "path is a directory")
	}
	data, err := os.ReadFile(target)
	if err != nil {
		return fsHTTPError(err)
	}
	return c.JSON(http.StatusOK, FSReadResponse{
		Path:    rel,
		Content: string(data),
		Size:    info.Size(),
		Mode:    uint32(info.Mode().Perm()),
		ModTime: info.ModTime(),
	})
}

// StatFS godoc
// @Summary Get file or directory metadata
// @Tags fs
// @Param bot_id path string true "Bot ID"
// @Param path query string true "Relative path"
// @Success 200 {object} FSStatResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /bots/{bot_id}/container/fs/stat [get]
func (h *ContainerdHandler) StatFS(c echo.Context) error {
	botID, err := h.requireBotAccess(c)
	if err != nil {
		return err
	}
	root, err := h.ensureBotDataRoot(botID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	target, rel, err := resolveBotPath(root, c.QueryParam("path"), false)
	if err != nil {
		return fsHTTPError(err)
	}
	info, err := os.Stat(target)
	if err != nil {
		return fsHTTPError(err)
	}
	return c.JSON(http.StatusOK, FSStatResponse{
		Path:    rel,
		IsDir:   info.IsDir(),
		Size:    info.Size(),
		Mode:    uint32(info.Mode().Perm()),
		ModTime: info.ModTime(),
	})
}

// UsageFS godoc
// @Summary Get usage under a path
// @Tags fs
// @Param bot_id path string true "Bot ID"
// @Param path query string false "Relative directory path"
// @Success 200 {object} FSUsageResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /bots/{bot_id}/container/fs/usage [get]
func (h *ContainerdHandler) UsageFS(c echo.Context) error {
	botID, err := h.requireBotAccess(c)
	if err != nil {
		return err
	}
	root, err := h.ensureBotDataRoot(botID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	target, rel, err := resolveBotPath(root, c.QueryParam("path"), true)
	if err != nil {
		return fsHTTPError(err)
	}
	info, err := os.Stat(target)
	if err != nil {
		return fsHTTPError(err)
	}

	var totalBytes int64
	var fileCount int64
	var dirCount int64
	if info.IsDir() {
		err = filepath.WalkDir(target, func(p string, d os.DirEntry, walkErr error) error {
			if walkErr != nil {
				return walkErr
			}
			if p == target {
				return nil
			}
			entryInfo, err := d.Info()
			if err != nil {
				return err
			}
			if entryInfo.IsDir() {
				dirCount++
				return nil
			}
			fileCount++
			totalBytes += entryInfo.Size()
			return nil
		})
		if err != nil {
			return fsHTTPError(err)
		}
	} else {
		fileCount = 1
		totalBytes = info.Size()
	}

	usagePath := strings.TrimSpace(rel)
	if usagePath == "" || usagePath == "." {
		usagePath = "."
	}
	return c.JSON(http.StatusOK, FSUsageResponse{
		Path:       usagePath,
		TotalBytes: totalBytes,
		FileCount:  fileCount,
		DirCount:   dirCount,
	})
}

// WriteFSFile godoc
// @Summary Create or overwrite a file
// @Tags fs
// @Param bot_id path string true "Bot ID"
// @Param payload body FSWriteRequest true "File write payload"
// @Success 200 {object} FSWriteResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 409 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /bots/{bot_id}/container/fs/file [post]
func (h *ContainerdHandler) WriteFSFile(c echo.Context) error {
	botID, err := h.requireBotAccess(c)
	if err != nil {
		return err
	}
	var req FSWriteRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if strings.TrimSpace(req.Path) == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "path is required")
	}
	root, err := h.ensureBotDataRoot(botID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	target, _, err := resolveBotPath(root, req.Path, false)
	if err != nil {
		return fsHTTPError(err)
	}
	overwrite := true
	if req.Overwrite != nil {
		overwrite = *req.Overwrite
	}
	if _, err := os.Stat(target); err == nil && !overwrite {
		return echo.NewHTTPError(http.StatusConflict, "file already exists")
	}
	if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	if err := os.WriteFile(target, []byte(req.Content), 0o644); err != nil {
		return fsHTTPError(err)
	}
	return c.JSON(http.StatusOK, FSWriteResponse{OK: true})
}

// MkdirFS godoc
// @Summary Create a directory
// @Tags fs
// @Param bot_id path string true "Bot ID"
// @Param payload body FSMkdirRequest true "Directory payload"
// @Success 200 {object} FSWriteResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /bots/{bot_id}/container/fs/dir [post]
func (h *ContainerdHandler) MkdirFS(c echo.Context) error {
	botID, err := h.requireBotAccess(c)
	if err != nil {
		return err
	}
	var req FSMkdirRequest
	if err := c.Bind(&req); err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	if strings.TrimSpace(req.Path) == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "path is required")
	}
	root, err := h.ensureBotDataRoot(botID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	target, _, err := resolveBotPath(root, req.Path, false)
	if err != nil {
		return fsHTTPError(err)
	}
	parents := true
	if req.Parents != nil {
		parents = *req.Parents
	}
	if parents {
		if err := os.MkdirAll(target, 0o755); err != nil {
			return fsHTTPError(err)
		}
	} else if err := os.Mkdir(target, 0o755); err != nil {
		return fsHTTPError(err)
	}
	return c.JSON(http.StatusOK, FSWriteResponse{OK: true})
}

// UploadFS godoc
// @Summary Upload a file
// @Tags fs
// @Param bot_id path string true "Bot ID"
// @Param path query string false "Relative file path or directory"
// @Param file formData file true "File to upload"
// @Success 200 {object} FSWriteResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /bots/{bot_id}/container/fs/upload [post]
func (h *ContainerdHandler) UploadFS(c echo.Context) error {
	botID, err := h.requireBotAccess(c)
	if err != nil {
		return err
	}
	file, err := c.FormFile("file")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, "file is required")
	}
	rawPath := strings.TrimSpace(c.FormValue("path"))
	if rawPath == "" {
		rawPath = strings.TrimSpace(c.QueryParam("path"))
	}
	if rawPath == "" {
		rawPath = file.Filename
	}
	root, err := h.ensureBotDataRoot(botID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}

	targetPath := rawPath
	if strings.HasSuffix(rawPath, "/") || strings.HasSuffix(rawPath, string(os.PathSeparator)) {
		targetPath = filepath.ToSlash(filepath.Join(rawPath, file.Filename))
	}
	target, _, err := resolveBotPath(root, targetPath, false)
	if err != nil {
		return fsHTTPError(err)
	}
	if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	src, err := file.Open()
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	defer src.Close()
	dst, err := os.Create(target)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	defer dst.Close()
	if _, err := io.Copy(dst, src); err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	return c.JSON(http.StatusOK, FSWriteResponse{OK: true})
}

// DeleteFS godoc
// @Summary Delete a file or directory
// @Tags fs
// @Param bot_id path string true "Bot ID"
// @Param path query string true "Relative path"
// @Param recursive query bool false "Recursive delete for directories"
// @Success 200 {object} FSDeleteResponse
// @Failure 400 {object} ErrorResponse
// @Failure 404 {object} ErrorResponse
// @Failure 500 {object} ErrorResponse
// @Router /bots/{bot_id}/container/fs [delete]
func (h *ContainerdHandler) DeleteFS(c echo.Context) error {
	botID, err := h.requireBotAccess(c)
	if err != nil {
		return err
	}
	recursive, err := parseBoolQuery(c, "recursive")
	if err != nil {
		return echo.NewHTTPError(http.StatusBadRequest, err.Error())
	}
	root, err := h.ensureBotDataRoot(botID)
	if err != nil {
		return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
	}
	target, rel, err := resolveBotPath(root, c.QueryParam("path"), false)
	if err != nil {
		return fsHTTPError(err)
	}
	if rel == "." || rel == "" {
		return echo.NewHTTPError(http.StatusBadRequest, "refuse to delete root")
	}
	info, err := os.Stat(target)
	if err != nil {
		return fsHTTPError(err)
	}
	if info.IsDir() && recursive {
		if err := os.RemoveAll(target); err != nil {
			return fsHTTPError(err)
		}
	} else if err := os.Remove(target); err != nil {
		return fsHTTPError(err)
	}
	return c.JSON(http.StatusOK, FSDeleteResponse{OK: true})
}

func (h *ContainerdHandler) ensureBotDataRoot(botID string) (string, error) {
	dataRoot := strings.TrimSpace(h.cfg.DataRoot)
	if dataRoot == "" {
		dataRoot = config.DefaultDataRoot
	}
	dataRoot, err := filepath.Abs(dataRoot)
	if err != nil {
		return "", err
	}
	root := filepath.Join(dataRoot, "bots", botID)
	if err := os.MkdirAll(root, 0o755); err != nil {
		return "", err
	}
	return root, nil
}

func resolveBotPath(root, requestPath string, allowRoot bool) (string, string, error) {
	raw := strings.TrimSpace(requestPath)
	if raw == "" {
		if allowRoot {
			return root, ".", nil
		}
		return "", "", os.ErrInvalid
	}
	clean := filepath.Clean(filepath.FromSlash(raw))
	if clean == "." || clean == "" {
		if allowRoot {
			return root, ".", nil
		}
		return "", "", os.ErrInvalid
	}
	if filepath.IsAbs(clean) || strings.HasPrefix(clean, "..") {
		return "", "", os.ErrInvalid
	}
	target := filepath.Join(root, clean)
	rel, err := filepath.Rel(root, target)
	if err != nil || strings.HasPrefix(rel, "..") {
		return "", "", os.ErrInvalid
	}
	return target, filepath.ToSlash(rel), nil
}

func entryForBotPath(root, target string, info os.FileInfo) (FSRestEntry, error) {
	rel, err := filepath.Rel(root, target)
	if err != nil {
		return FSRestEntry{}, err
	}
	if strings.HasPrefix(rel, "..") {
		return FSRestEntry{}, os.ErrInvalid
	}
	if rel == "." {
		rel = ""
	}
	return FSRestEntry{
		Path:    filepath.ToSlash(rel),
		IsDir:   info.IsDir(),
		Size:    info.Size(),
		Mode:    uint32(info.Mode().Perm()),
		ModTime: info.ModTime(),
	}, nil
}

func parseBoolQuery(c echo.Context, key string) (bool, error) {
	raw := strings.TrimSpace(c.QueryParam(key))
	if raw == "" {
		return false, nil
	}
	return strconv.ParseBool(raw)
}

func fsHTTPError(err error) error {
	if err == nil {
		return nil
	}
	if errors.Is(err, os.ErrInvalid) {
		return echo.NewHTTPError(http.StatusBadRequest, "invalid path")
	}
	if os.IsNotExist(err) {
		return echo.NewHTTPError(http.StatusNotFound, "path not found")
	}
	return echo.NewHTTPError(http.StatusInternalServerError, err.Error())
}
