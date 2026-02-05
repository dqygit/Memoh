
interface JSONRPCRequest {
  jsonrpc: string
  id: string | number
  method: string
  params?: unknown
}

interface JSONRPCResponse<T = unknown> {
  jsonrpc: string
  id: string | number
  result?: T
  error?: {
    code: number
    message: string
  }
}

interface ToolCallContent {
  type: string
  text?: string
}

interface ToolCallResult {
  content: ToolCallContent[]
  isError?: boolean
}

export interface FSFileEntry {
  path: string
  is_dir: boolean
  size: number
  mode: number
  mod_time: string
}

export interface FSReadResult {
  content: string
}

export interface FSReadBase64Result {
  data: string
  mime_type: string
}

export interface FSWriteResult {
  ok: boolean
}

export interface FSListResult {
  path: string
  entries: FSFileEntry[]
}

export interface FSStatResult {
  entry: FSFileEntry
}

export interface FSDeleteResult {
  ok: boolean
}

export interface FSApplyPatchResult {
  ok: boolean
}

export interface FSMkdirResult {
  ok: boolean
}

export interface FSRenameResult {
  ok: boolean
}

export interface GrepResult {
  stdout: string
  stderr: string
  exit_code: number
}

export interface EchoResult {
  text: string
}

export interface ToolInfo {
  name: string
  description?: string
  inputSchema?: Record<string, unknown>
}

export interface ToolsListResult {
  tools: ToolInfo[]
}

export interface UseContainerOptions {
  url: string
  fetch: (url: string, options?: RequestInit) => Promise<Response>
}

class JSONRPCClient {
  private requestId = 0

  constructor(
    private url: string,
    private fetch: (url: string, options?: RequestInit) => Promise<Response>
  ) {}

  async call<T>(method: string, params?: unknown): Promise<T> {
    const request: JSONRPCRequest = {
      jsonrpc: '2.0',
      id: ++this.requestId,
      method,
      params,
    }

    const response = await this.fetch(this.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }

    const jsonResponse: JSONRPCResponse<T> = await response.json()

    if (jsonResponse.error) {
      throw new Error(
        `JSON-RPC Error ${jsonResponse.error.code}: ${jsonResponse.error.message}`
      )
    }

    return jsonResponse.result as T
  }
}

class MCPToolCaller {
  constructor(private rpcClient: JSONRPCClient) {}

  async callTool<T>(toolName: string, args: Record<string, unknown>): Promise<T> {
    const result = await this.rpcClient.call<ToolCallResult>('tools/call', {
      name: toolName,
      arguments: args,
    })

    if (result.isError) {
      const errorMessage = result.content?.[0]?.text || 'Tool execution failed'
      throw new Error(errorMessage)
    }

    const textContent = result.content?.[0]?.text
    if (textContent) {
      try {
        return JSON.parse(textContent) as T
      } catch {
        return textContent as T
      }
    }

    throw new Error('No result content returned')
  }
}

class FileSystemOperations {
  constructor(private toolCaller: MCPToolCaller) {}

  async read(path: string): Promise<string> {
    const result = await this.toolCaller.callTool<FSReadResult>('fs.read', { path })
    return result.content
  }

  async readBase64(path: string): Promise<FSReadBase64Result> {
    return this.toolCaller.callTool<FSReadBase64Result>('fs.read_base64', { path })
  }

  async write(path: string, content: string): Promise<boolean> {
    const result = await this.toolCaller.callTool<FSWriteResult>('fs.write', {
      path,
      content,
    })
    return result.ok
  }

  async list(path: string = '.', recursive: boolean = false): Promise<FSListResult> {
    return this.toolCaller.callTool<FSListResult>('fs.list', { path, recursive })
  }

  async stat(path: string): Promise<FSFileEntry> {
    const result = await this.toolCaller.callTool<FSStatResult>('fs.stat', { path })
    return result.entry
  }

  async delete(path: string): Promise<boolean> {
    const result = await this.toolCaller.callTool<FSDeleteResult>('fs.delete', { path })
    return result.ok
  }

  async mkdir(path: string): Promise<boolean> {
    const result = await this.toolCaller.callTool<FSMkdirResult>('fs.mkdir', { path })
    return result.ok
  }

  async rename(source: string, destination: string): Promise<boolean> {
    const result = await this.toolCaller.callTool<FSRenameResult>('fs.rename', {
      source,
      destination,
    })
    return result.ok
  }

  async applyPatch(path: string, patch: string): Promise<boolean> {
    const result = await this.toolCaller.callTool<FSApplyPatchResult>('fs.apply_patch', {
      path,
      patch,
    })
    return result.ok
  }

  async exists(path: string): Promise<boolean> {
    try {
      await this.stat(path)
      return true
    } catch {
      return false
    }
  }

  async readJSON<T = unknown>(path: string): Promise<T> {
    const content = await this.read(path)
    return JSON.parse(content)
  }

  async writeJSON(path: string, data: unknown, pretty: boolean = true): Promise<boolean> {
    const content = pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data)
    return this.write(path, content)
  }

  async append(path: string, content: string): Promise<boolean> {
    const exists = await this.exists(path)
    if (exists) {
      const existing = await this.read(path)
      return this.write(path, existing + content)
    }
    return this.write(path, content)
  }

  async copy(source: string, destination: string): Promise<boolean> {
    const stat = await this.stat(source)
    if (stat.is_dir) {
      throw new Error('Directory copy not implemented. Use list + copy for each file.')
    }
    const content = await this.read(source)
    return this.write(destination, content)
  }
}

class SearchOperations {
  constructor(private toolCaller: MCPToolCaller) {}

  async grep(pattern: string, args: string[] = []): Promise<GrepResult> {
    return this.toolCaller.callTool<GrepResult>('grep', { pattern, args })
  }

  async search(
    pattern: string,
    options: {
      caseSensitive?: boolean
      lineNumbers?: boolean
      filesOnly?: boolean
    } = {}
  ): Promise<string> {
    const args: string[] = ['-r']
    if (!options.caseSensitive) args.push('-i')
    if (options.lineNumbers) args.push('-n')
    if (options.filesOnly) args.push('-l')

    const result = await this.grep(pattern, args)
    return result.stdout
  }

  async findFiles(pattern: string): Promise<string[]> {
    const result = await this.grep(pattern, ['-r', '-l'])
    return result.stdout
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
  }
}

class UtilityOperations {
  constructor(private toolCaller: MCPToolCaller) {}

  async echo(text: string): Promise<string> {
    const result = await this.toolCaller.callTool<EchoResult>('echo', { text })
    return result.text
  }

  async ping(): Promise<boolean> {
    try {
      const result = await this.echo('ping')
      return result === 'ping'
    } catch {
      return false
    }
  }
}

export class ContainerClient {
  private rpcClient: JSONRPCClient
  private toolCaller: MCPToolCaller

  public readonly fs: FileSystemOperations
  public readonly search: SearchOperations
  public readonly utils: UtilityOperations

  constructor(options: UseContainerOptions) {
    this.rpcClient = new JSONRPCClient(options.url, options.fetch)
    this.toolCaller = new MCPToolCaller(this.rpcClient)
    
    this.fs = new FileSystemOperations(this.toolCaller)
    this.search = new SearchOperations(this.toolCaller)
    this.utils = new UtilityOperations(this.toolCaller)
  }

  async listTools(): Promise<ToolsListResult> {
    return this.rpcClient.call<ToolsListResult>('tools/list')
  }

  async callTool<T = unknown>(toolName: string, args: Record<string, unknown> = {}): Promise<T> {
    return this.toolCaller.callTool<T>(toolName, args)
  }
}

export const useContainer = (options: UseContainerOptions): ContainerClient => {
  return new ContainerClient(options)
}