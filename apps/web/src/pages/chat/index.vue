<template>
  <div class="flex h-full">
    <!-- <Teleport to=".main-left-section">
      <SidebarProvider>
        <SidebarContent>
          <BotSidebar />
        </SidebarContent>
      </SidebarProvider>
    </Teleport>
   -->
    <!-- <MasterDetailSidebarLayout>
      <template #sidebar-header>
        <div class="p-4 border-b">
          <p class="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            {{ $t('sidebar.bots') }}
          </p>
        </div>
      </template>
<template #sidebar-content>
        <BotSidebar />
      </template>
<template #detail>
        <ChatArea />
      </template>
</MasterDetailSidebarLayout> -->
    <ChatHeader />
    <BotSidebar />
    <SessionSidebar />
    <ChatArea />
  </div>
</template>

<script setup lang="ts">
// import BotSidebar from './components/bot-sidebar.vue'
import ChatArea from './components/chat-area.vue'
import { defineAsyncComponent } from 'vue'

const BotSidebar = defineAsyncComponent(async () => import('./components/bot-sidebar.vue'))

const SessionSidebar = defineAsyncComponent(() => import('./components/session_sidebar.vue'))

const ChatHeader = defineAsyncComponent(() => import('./components/chat-header.vue'))

</script>
