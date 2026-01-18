<script setup lang="ts">
import { computed } from 'vue'
import {
  NModal,
  NButton,
  NSpace,
  NDescriptions,
  NDescriptionsItem,
} from 'naive-ui'

const props = defineProps<{
  show: boolean
  selectedCount: number
  totalCount: number
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
  confirm: []
  cancel: []
}>()

const visible = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value),
})

const handleConfirm = () => {
  emit('confirm')
  visible.value = false
}

const handleCancel = () => {
  emit('cancel')
  visible.value = false
}
</script>

<template>
  <NModal v-model:show="visible" preset="card" style="width: 450px" title="确认刮削">
    <NDescriptions :column="1" label-placement="left">
      <NDescriptionsItem label="选中文件">
        {{ selectedCount }} 个
      </NDescriptionsItem>
      <NDescriptionsItem label="总文件数">
        {{ totalCount }} 个
      </NDescriptionsItem>
    </NDescriptions>

    <p style="margin-top: 16px; color: var(--n-text-color-3)">
      确认开始刮削选中的 {{ selectedCount }} 个文件？
    </p>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="handleCancel">取消</NButton>
        <NButton type="primary" @click="handleConfirm">开始刮削</NButton>
      </NSpace>
    </template>
  </NModal>
</template>
