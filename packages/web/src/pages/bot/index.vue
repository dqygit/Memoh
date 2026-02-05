<template>
  <section>
    <InnerSlider :list="robotListFormat">
      <template #slider-footer>
        <AddBot />
      </template>
      <template #main-section>
        <botInfo />
      </template>
    </InnerSlider>
  </section>
</template>

<script setup lang="ts">
import InnerSlider from '@/components/InnerSlider/index.vue'
import request from '@/utils/request'
import { useQuery } from '@pinia/colada'
import { useUserStore } from '../../store/User'
import { computed } from 'vue'
import AddBot from '@/components/AddBot/index.vue'
import { bots } from '@memoh/shared'
import botInfo from './botInfo.vue'

const {userInfo}=useUserStore()

const {data:robotList}=useQuery({
  key: ['bot'],
  query: () => request({
    url:`/bots?owner_id=${userInfo.id}`
  }).then(fetchData=>fetchData.data)
})

const robotListFormat=computed(() => {
  return robotList.value?.items.map((robotItem: bots) => ({
    value: robotItem.display_name,
    label: robotItem.display_name
  }))??[]
})

</script>