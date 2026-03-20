<template>
  <section :class="mountNode.id">
    <Teleport :to="mountNode.rightDefault">
      <SidebarProvider>
        <SidebarInset>
          <Sidebar
            class="relative! **:[[role=navigation]]:relative"
            side="right"
          >
            <SidebarHeader class="h-12 flex flex-rows justify-center">
              <section class="flex items-center gap-2">
                <FontAwesomeIcon :icon="['fas', 'bars']" />
                <h3 class="font-semibold text-sm">
                  Session 源数据
                </h3>
              </section>
            </SidebarHeader>
            <Separator />
            <SidebarContent />
          </Sidebar>
        </SidebarInset>
      </SidebarProvider>
    </Teleport>
    <section class="hidden-clip-section" />
  </section>
</template>

<script setup lang="ts">
import { computed, onActivated, onDeactivated } from 'vue'
import { useI18n } from 'vue-i18n'
import { Avatar, AvatarImage, AvatarFallback } from '@memoh/ui'
import { useQuery } from '@pinia/colada'
import { getBotsQuery } from '@memoh/sdk/colada'
import type { BotsBot } from '@memoh/sdk'
import { useChatStore } from '@/store/chat-list'
import { storeToRefs } from 'pinia'
import {
  Toggle,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarProvider,
  SidebarContent,
  Sidebar,
  SidebarInset,
  Separator
} from '@memoh/ui'
import useControlVisibleStatus from '@/utils/useControlVisibleStatus'

const { t } = useI18n()
const chatStore = useChatStore()
const { currentBotId } = storeToRefs(chatStore)

const { data: botData, isLoading } = useQuery(getBotsQuery())
const bots = computed<BotsBot[]>(() => botData.value?.items ?? [])

const isActive = (id: string) => computed(() => {
  return currentBotId.value === id
})

function handleSelect(bot: BotsBot) {
  chatStore.selectBot(bot.id)
}

const mountNode = useControlVisibleStatus()
</script>
