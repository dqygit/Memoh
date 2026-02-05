<template>
  <section>
    <Tabs default-value="account">
      <TabsList>
        <TabsTrigger value="account">
          Account
        </TabsTrigger>
        <TabsTrigger value="password">
          Password
        </TabsTrigger>
      </TabsList>
      <TabsContent value="account">
        Make changes to your account here.
      </TabsContent>
      <TabsContent value="password">
        Change your password here.
      </TabsContent>
    </Tabs>
  </section>
</template>

<script setup lang="ts">
import {
  Tabs, TabsContent, TabsList, TabsTrigger
} from '@memoh/ui'
</script>