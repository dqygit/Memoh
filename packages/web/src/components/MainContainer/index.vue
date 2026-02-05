<template>
  <SidebarInset class="grid grid-rows-[auto_auto_1fr]">
    <header
      class="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12"
    >
      <div class="flex items-center gap-2 px-4">     
<<<<<<< HEAD
        <SidebarTrigger class="-ml-1" />
=======
        <svg-icon
          type="mdi"
          class="cursor-pointer"
          :path="mdiTuneVariant"
        />
>>>>>>> fe80257 (feat: layout update)
        <Separator
          orientation="vertical"
          class="mr-2 data-[orientation=vertical]:h-4"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <template
              v-for="(breadcrumbItem, index) in curBreadcrumb"
              :key="breadcrumbItem"
            >
              <template v-if="(index + 1) !== curBreadcrumb.length">
                <BreadcrumbItem class="hidden md:block">
                  <BreadcrumbLink :href="breadcrumbItem.path">
                    {{ breadcrumbItem.breadcrumb }}
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
              </template>

              <BreadcrumbItem v-else>
                <BreadcrumbPage>
                  {{ breadcrumbItem.breadcrumb }}
                </BreadcrumbPage>
              </BreadcrumbItem>
            </template>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
    <Separator />
    <section class="w-full relative">
      <ScrollArea class="absolute! inset-0">
<<<<<<< HEAD
        <router-view
          v-slot="{ Component }"
          class="p-4"
        >
=======
        <router-view v-slot="{ Component }">
>>>>>>> fe80257 (feat: layout update)
          <KeepAlive>
            <component :is="Component" />
          </KeepAlive>
        </router-view>
      </ScrollArea>
    </section>
  </SidebarInset>
</template>

<script setup lang="ts">
import {
  SidebarTrigger, SidebarInset, Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  Separator,
  ScrollArea
  // DropdownMenu,
  // DropdownMenuContent,
  // DropdownMenuItem,
  // DropdownMenuTrigger,
} from '@memoh/ui'
import { useRoute } from 'vue-router'
import { computed } from 'vue'
<<<<<<< HEAD
=======
import SvgIcon from '@jamescoyle/vue-icon'
import { mdiTuneVariant } from '@mdi/js'

>>>>>>> fe80257 (feat: layout update)

const route = useRoute()

const curBreadcrumb = computed(() => {
  return route.matched.map(routeItem => ({
    path: routeItem.path,
    breadcrumb: routeItem.meta['breadcrumb']
  }))
})

</script>