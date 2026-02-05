<template>
  <section>
    <SidebarProvider
      :open="true"
      class="min-h-[initial]! flex **:data-[sidebar=sidebar]:bg-transparent absolute inset-0"
    >
      <Sidebar class="h-full relative top-0 ">
        <SidebarHeader>
          <slot name="slider-header" />
        </SidebarHeader>
        <SidebarContent class="px-2 scrollbar-none">
          <SidebarMenu
            v-for="listItem in list"
            :key="listItem.value"
          >
            <SidebarMenuItem>
              <SidebarMenuButton
                as-child
                class="justify-start py-5! px-4"
              >
                <Toggle
                  :class="`py-4 border border-transparent ${current === listItem.value ? 'border-inherit' : ''}`"
                  :model-value="isFocus(listItem.value).value"
                  @update:model-value="(isSelect) => {
                    if (isSelect) {
                      current = listItem.value
                    }
                  }"
                >
                  {{ listItem.label }}
                </Toggle>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
          <slot name="slider-footer" />
        </SidebarFooter>
      </Sidebar>
      <section class="flex-1 h-full ">
        <ScrollArea>
          <section class="p-4">
            <slot name="main-section" />
          </section>
        </ScrollArea>
      </section>
    </SidebarProvider>
  </section>
</template>

<script setup lang="ts">
import {
  ScrollArea,
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarFooter,
  Toggle
} from '@memoh/ui'
import { computed, watch } from 'vue'

const { list } = defineProps<{ list: { label: string, value: string | number }[] }>()
type currentPropType= (typeof list)[number]['value']
const current = defineModel<currentPropType>()

const isFocus = (property:currentPropType) => computed(() => {
  return current.value===property
})

watch(() => list, () => {

  if (!current.value && list?.length > 0) {
    current.value=list[0]?.value
  }
}, {
  immediate:true
})
</script>
