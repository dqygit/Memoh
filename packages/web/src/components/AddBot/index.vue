<template>
  <section>
    <Dialog v-model:open="open">
      <DialogTrigger as-child>
        <Button class="w-full shadow-none!  mb-4">
          <svg-icon
            type="mdi"
            :path="mdiPlus"
            class="mr-1"
          /> 添加
        </Button>
      </DialogTrigger>
      <DialogContent class="sm:max-w-106.25">
        <form @submit="createProvider">
          <DialogHeader>
            <DialogTitle>创建Bot</DialogTitle>
            <DialogDescription>
              <Separator class="my-4" />
            </DialogDescription>
          </DialogHeader>


          <div class="flex-col gap-3 flex">
            <FormField
              v-slot="{ componentField }"
              name="avatar_url"
            >
              <FormItem>
                <Label class="mb-2">
                  Avatar Url
                </Label>
                <FormControl>
                  <Input
                    type="text"
                    v-bind="componentField"
                  />
                </FormControl>
              </FormItem>
            </FormField>
            <FormField
              v-slot="{ componentField }"
              name="display_name"
            >
              <FormItem>
                <Label class="mb-2">
                  Display Name
                </Label>
                <FormControl>
                  <Input
                    type="text"
                    v-bind="componentField"
                  />
                </FormControl>
              </FormItem>
            </FormField>
            <FormField
              v-slot="{ componentField }"
              name="type"
            >
              <FormItem>
                <Label class="mb-2">
                  Type
                </Label>
                <FormControl>
                  <Select v-bind="componentField">
                    <SelectTrigger class="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem
                          v-for="type in types"
                          :key="type.value"
                          :value="type.value"
                        >
                          {{ type.label }}
                        </SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            </FormField>
            <FormField
              v-slot="{ componentField }"
              name="is_active"
            >
              <FormItem>
                <Label class="mb-2">
                  Active
                </Label>
                <FormControl>
                  <Switch
                    v-model="componentField.modelValue"
                    @update:model-value="componentField['onUpdate:modelValue']"
                  />
                </FormControl>
              </FormItem>
            </FormField>
          </div>
          <DialogFooter class="mt-8">
            <DialogClose as-child>
              <Button variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              :disabled="(form.meta.value.valid === false) || isLoading"
            >
              <Spinner
                v-if="isLoading"
                class="mr-1"
              />
              创建Bot
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  </section>
</template>
<script setup lang="ts">
import { mdiPlus } from '@mdi/js'
import SvgIcon from '@jamescoyle/vue-icon'
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  Input,
  FormField,
  FormControl,
  FormItem,
  DialogDescription,
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectItem,
  Separator,
  Label,
  Spinner,
  Switch
} from '@memoh/ui'
import { toTypedSchema } from '@vee-validate/zod'
import z from 'zod'
import { useForm } from 'vee-validate'
import { useMutation, useQueryCache } from '@pinia/colada'
import request from '@/utils/request'
import type { bots } from '@memoh/shared'

const open = defineModel<boolean>('open')

const cacheQuery = useQueryCache()
const { mutate: botsFetch, isLoading } = useMutation({
  mutation: (data: bots) => request({
    url: '/bots',
    data,
    method: 'post'
  }),
  onSettled: () => cacheQuery.invalidateQueries({
    key: ['bot']
  })
})
const providerSchema = toTypedSchema(z.object({
  avatar_url: z.string().min(1),
  display_name: z.string().min(1),
  is_active: z.coerce.boolean(),
  metadata: z.object({
    additionalProp1: z.object()
  }),
  type: z.string().min(1)
}))

const types = [{ value: 'personal', label: '私有的' }, { value: 'public', label: '公共的' }]

const form = useForm({
  validationSchema: providerSchema,
})

const createProvider = form.handleSubmit(async (value) => {
  try {
    await botsFetch(value)
    open.value = false
  } catch {
    return
  }
})

</script>