<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  NCard,
  NSpace,
  NButton,
  NCheckbox,
  NFormItem,
  NSelect,
  NInputNumber,
  NSwitch,
  NDivider,
  NGrid,
  NGi,
  NAlert,
  useMessage,
} from 'naive-ui'
import { configApi } from '@/api/config'
import type { DownloadConfig } from '@/api/types'

const message = useMessage()
const loading = ref(false)
const saving = ref(false)

const config = reactive<DownloadConfig>({
  // 剧集级别
  series_poster: true,
  series_backdrop: true,
  series_logo: false,
  series_banner: false,
  // 季级别
  season_poster: true,
  // 集级别
  episode_thumb: true,
  // 额外图片
  extra_backdrops: false,
  extra_backdrops_count: 5,
  // 图片质量
  poster_quality: 'w1280',
  backdrop_quality: 'original',
  thumb_quality: 'w780',
  // 下载行为
  overwrite_existing: false,
})

const qualityOptions = [
  { label: '原始尺寸', value: 'original' },
  { label: '高清 (1280px)', value: 'w1280' },
  { label: '中等 (780px)', value: 'w780' },
  { label: '低质量 (500px)', value: 'w500' },
  { label: '缩略图 (300px)', value: 'w300' },
]

const loadConfig = async () => {
  loading.value = true
  try {
    const data = await configApi.getDownloadConfig()
    Object.assign(config, data)
  } catch (error) {
    console.error(error)
  } finally {
    loading.value = false
  }
}

const saveConfig = async () => {
  saving.value = true
  try {
    await configApi.saveDownloadConfig(config)
    message.success('下载配置已保存')
  } catch (error) {
    message.error('保存失败')
    console.error(error)
  } finally {
    saving.value = false
  }
}

onMounted(loadConfig)
</script>

<template>
  <NCard title="下载配置" size="small">
    <NSpace vertical size="large">
      <NAlert type="info" :bordered="false">
        配置从 TMDB 下载的图片类型，图片将保存到对应的剧集/季/集目录中
      </NAlert>

      <!-- 剧集级别图片 -->
      <NDivider title-placement="left">剧集图片 (TV Show)</NDivider>
      <NGrid :cols="2" :x-gap="16" :y-gap="12">
        <NGi>
          <NCheckbox v-model:checked="config.series_poster">
            <span>剧集海报</span>
            <span style="color: #999; margin-left: 8px; font-size: 12px">poster.jpg</span>
          </NCheckbox>
        </NGi>
        <NGi>
          <NCheckbox v-model:checked="config.series_backdrop">
            <span>剧集背景图</span>
            <span style="color: #999; margin-left: 8px; font-size: 12px">fanart.jpg</span>
          </NCheckbox>
        </NGi>
        <NGi>
          <NCheckbox v-model:checked="config.series_logo">
            <span>剧集 Logo</span>
            <span style="color: #999; margin-left: 8px; font-size: 12px">logo.png</span>
          </NCheckbox>
        </NGi>
        <NGi>
          <NCheckbox v-model:checked="config.series_banner">
            <span>剧集横幅</span>
            <span style="color: #999; margin-left: 8px; font-size: 12px">banner.jpg</span>
          </NCheckbox>
        </NGi>
      </NGrid>

      <!-- 季级别图片 -->
      <NDivider title-placement="left">季图片 (Season)</NDivider>
      <NGrid :cols="2" :x-gap="16" :y-gap="12">
        <NGi>
          <NCheckbox v-model:checked="config.season_poster">
            <span>季海报</span>
            <span style="color: #999; margin-left: 8px; font-size: 12px">season01-poster.jpg</span>
          </NCheckbox>
        </NGi>
      </NGrid>

      <!-- 集级别图片 -->
      <NDivider title-placement="left">剧集截图 (Episode)</NDivider>
      <NGrid :cols="2" :x-gap="16" :y-gap="12">
        <NGi>
          <NCheckbox v-model:checked="config.episode_thumb">
            <span>剧集截图</span>
            <span style="color: #999; margin-left: 8px; font-size: 12px">S01E01-thumb.jpg</span>
          </NCheckbox>
        </NGi>
      </NGrid>

      <!-- 额外图片 -->
      <NDivider title-placement="left">额外图片</NDivider>
      <NSpace vertical>
        <NCheckbox v-model:checked="config.extra_backdrops">
          <span>额外背景图</span>
          <span style="color: #999; margin-left: 8px; font-size: 12px">保存到 extrafanart/ 目录</span>
        </NCheckbox>
        <NFormItem v-if="config.extra_backdrops" label="下载数量上限" label-placement="left">
          <NInputNumber
            v-model:value="config.extra_backdrops_count"
            :min="1"
            :max="20"
            style="width: 100px"
          />
        </NFormItem>
      </NSpace>

      <!-- 图片质量 -->
      <NDivider title-placement="left">图片质量</NDivider>
      <NGrid :cols="3" :x-gap="16" :y-gap="12">
        <NGi>
          <NFormItem label="海报质量">
            <NSelect
              v-model:value="config.poster_quality"
              :options="qualityOptions"
              style="width: 140px"
            />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="背景图质量">
            <NSelect
              v-model:value="config.backdrop_quality"
              :options="qualityOptions"
              style="width: 140px"
            />
          </NFormItem>
        </NGi>
        <NGi>
          <NFormItem label="截图质量">
            <NSelect
              v-model:value="config.thumb_quality"
              :options="qualityOptions"
              style="width: 140px"
            />
          </NFormItem>
        </NGi>
      </NGrid>

      <!-- 下载行为 -->
      <NDivider title-placement="left">下载行为</NDivider>
      <NFormItem label="覆盖已存在的图片" label-placement="left">
        <NSwitch v-model:value="config.overwrite_existing" />
        <span style="margin-left: 8px; color: #999">关闭时跳过已存在的图片文件</span>
      </NFormItem>

      <NSpace style="margin-top: 8px">
        <NButton type="primary" :loading="saving" @click="saveConfig">
          保存配置
        </NButton>
      </NSpace>
    </NSpace>
  </NCard>
</template>
