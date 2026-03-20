<template>
  <section :class="mountNode.id">
    <Teleport :to="mountNode.leftDefault">
      <SidebarProvider>
        <SidebarInset>
          <Sidebar class="relative! **:[[role=navigation]]:relative">
            <SidebarHeader class="h-12 flex flex-rows justify-center">
              <section class="flex items-center gap-2">
                <FontAwesomeIcon :icon="['fas', 'bars']" />
                <h3 class="font-semibold text-sm">
                  {{ $t('sidebar.session') }}
                </h3>
              </section>
            </SidebarHeader>
            <Separator />
            <SidebarContent class="px-2">
              <SidebarMenu class="mt-4">
                <InputGroup>
                  <InputGroupInput placeholder="Search..." />
                  <InputGroupAddon>                 
                    <FontAwesomeIcon :icon="['fas','magnifying-glass']" />
                  </InputGroupAddon>
                </InputGroup>
              </SidebarMenu>
              <SidebarMenu
                v-for="bot in bots"
                :key="bot.id"
              >
                <SidebarMenuItem>
                  <SidebarMenuButton
                    as-child
                    class="justify-start py-5! px-4"
                  >
                    <Toggle
                      :class="`p-2! border border-transparent h-[initial]! ${currentBotId === bot.id ? 'border-inherit' : ''}`"
                      :model-value="isActive(bot.id as string).value"
                      @click="handleSelect(bot)"
                    >
                      <Avatar class="size-8 shrink-0">
                        <AvatarImage
                          v-if="bot.avatar_url"
                          :src="bot.avatar_url"
                          :alt="bot.display_name"
                        />
                        <AvatarFallback class="text-xs">
                          {{ (bot.display_name || bot.id).slice(0, 2).toUpperCase() }}
                        </AvatarFallback>
                      </Avatar>
                      <div class="flex-1 text-left min-w-0">
                        <div class="font-medium truncate">
                          {{ bot.display_name || bot.id }}
                        </div>
                      </div>
                    </Toggle>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
              <SidebarMenu>
                <div
                  v-if="isLoading"
                  class="flex justify-center py-4"
                >
                  <FontAwesomeIcon
                    :icon="['fas', 'spinner']"
                    class="size-4 animate-spin text-muted-foreground"
                  />
                </div>

                <div
                  v-if="!isLoading && bots.length === 0"
                  class="px-3 py-6 text-center text-sm text-muted-foreground"
                >
                  {{ $t('bots.emptyTitle') }}
                </div>
              </SidebarMenu>
            </SidebarContent>
            <SidebarFooter>
              <Button class="mb-4">
                + Session
              </Button>
            </SidebarFooter>
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
  Separator,
  SidebarFooter,
  Button,
  InputGroup,
  InputGroupInput,
  InputGroupAddon
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

const mountNode=useControlVisibleStatus()
</script>
