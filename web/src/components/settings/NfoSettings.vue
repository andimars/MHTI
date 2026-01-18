<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import {
  NCard,
  NSpace,
  NButton,
  NSwitch,
  NCheckbox,
  NFormItem,
  NGrid,
  NGi,
  NCollapse,
  NCollapseItem,
  NAlert,
  useMessage,
} from 'naive-ui'
import { configApi } from '@/api/config'
import type { NfoConfig } from '@/api/types'

const message = useMessage()
const loading = ref(false)
const saving = ref(false)

const config = reactive<NfoConfig>({
  enabled: true,
  tvshow: {
    enabled: true,
    title: true,
    originaltitle: true,
    sorttitle: true,
    plot: true,
    outline: true,
    year: true,
    premiered: true,
    rating: true,
    genre: true,
    status: true,
    tmdbid: true,
  },
  season: {
    enabled: true,
    title: true,
    plot: true,
    year: true,
    premiered: true,
    seasonnumber: true,
  },
  episode: {
    enabled: true,
    title: true,
    plot: true,
    season: true,
    episode: true,
    aired: true,
    rating: true,
  },
})

const loadConfig = async () => {
  loading.value = true
  try {
    const data = await configApi.getNfoConfig()
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
    await configApi.saveNfoConfig(config)
    message.success('NFO 配置已保存')
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
  <NCard title="NFO 配置" size="small">
    <NSpace vertical size="large">
      <NAlert type="info" :bordered="false">
        NFO 文件用于 Jellyfin/Emby/Kodi 等媒体服务器识别剧集元数据
      </NAlert>

      <!-- 总开关 -->
      <NFormItem label="启用 NFO 生成" label-placement="left">
        <NSwitch v-model:value="config.enabled" />
        <span style="margin-left: 8px; color: #999">关闭后不生成任何 NFO 文件</span>
      </NFormItem>

      <template v-if="config.enabled">
        <NCollapse default-expanded-names="['tvshow', 'season', 'episode']">
          <!-- 剧集 NFO -->
          <NCollapseItem title="剧集 NFO (tvshow.nfo)" name="tvshow">
            <template #header-extra>
              <NSwitch
                v-model:value="config.tvshow.enabled"
                size="small"
                @click.stop
              />
            </template>
            <template v-if="config.tvshow.enabled">
              <NGrid :cols="4" :x-gap="16" :y-gap="8">
                <NGi><NCheckbox v-model:checked="config.tvshow.title">标题 (title)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.tvshow.originaltitle">原标题 (originaltitle)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.tvshow.sorttitle">排序标题 (sorttitle)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.tvshow.plot">简介 (plot)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.tvshow.outline">摘要 (outline)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.tvshow.year">年份 (year)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.tvshow.premiered">首播日期 (premiered)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.tvshow.rating">评分 (rating)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.tvshow.genre">类型 (genre)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.tvshow.status">状态 (status)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.tvshow.tmdbid">TMDB ID (tmdbid)</NCheckbox></NGi>
              </NGrid>
            </template>
            <div v-else style="color: #999; padding: 8px 0">已禁用，不生成 tvshow.nfo</div>
          </NCollapseItem>

          <!-- 季 NFO -->
          <NCollapseItem title="季 NFO (season.nfo)" name="season">
            <template #header-extra>
              <NSwitch
                v-model:value="config.season.enabled"
                size="small"
                @click.stop
              />
            </template>
            <template v-if="config.season.enabled">
              <NGrid :cols="4" :x-gap="16" :y-gap="8">
                <NGi><NCheckbox v-model:checked="config.season.title">标题 (title)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.season.plot">简介 (plot)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.season.year">年份 (year)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.season.premiered">首播日期 (premiered)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.season.seasonnumber">季号 (seasonnumber)</NCheckbox></NGi>
              </NGrid>
            </template>
            <div v-else style="color: #999; padding: 8px 0">已禁用，不生成 season.nfo</div>
          </NCollapseItem>

          <!-- 集 NFO -->
          <NCollapseItem title="集 NFO (episode.nfo)" name="episode">
            <template #header-extra>
              <NSwitch
                v-model:value="config.episode.enabled"
                size="small"
                @click.stop
              />
            </template>
            <template v-if="config.episode.enabled">
              <NGrid :cols="4" :x-gap="16" :y-gap="8">
                <NGi><NCheckbox v-model:checked="config.episode.title">标题 (title)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.episode.plot">简介 (plot)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.episode.season">季号 (season)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.episode.episode">集号 (episode)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.episode.aired">播出日期 (aired)</NCheckbox></NGi>
                <NGi><NCheckbox v-model:checked="config.episode.rating">评分 (rating)</NCheckbox></NGi>
              </NGrid>
            </template>
            <div v-else style="color: #999; padding: 8px 0">已禁用，不生成 episode.nfo</div>
          </NCollapseItem>
        </NCollapse>
      </template>

      <NSpace style="margin-top: 8px">
        <NButton type="primary" :loading="saving" @click="saveConfig">
          保存配置
        </NButton>
      </NSpace>
    </NSpace>
  </NCard>
</template>

<style scoped>
:deep(.n-collapse-item__header-main) {
  font-weight: 500;
}

:deep(.n-collapse-item__content-inner) {
  padding-top: 12px;
}
</style>
