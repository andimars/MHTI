<script setup lang="ts">
import { NCard, NGrid, NGi } from 'naive-ui'
import Skeleton from './Skeleton.vue'
</script>

<template>
  <div class="home-skeleton">
    <!-- 统计卡片骨架 -->
    <NGrid :x-gap="16" :y-gap="16" cols="1 s:2 m:3" responsive="screen">
      <NGi v-for="i in 3" :key="i">
        <NCard class="stat-skeleton">
          <div class="stat-content">
            <Skeleton type="circle" width="56px" height="56px" />
            <div class="stat-info">
              <Skeleton width="80px" height="32px" />
              <Skeleton width="60px" height="14px" />
            </div>
          </div>
        </NCard>
      </NGi>
    </NGrid>

    <!-- 快捷入口骨架 -->
    <Skeleton width="80px" height="20px" style="margin: 24px 0 16px;" />
    <NGrid :x-gap="16" :y-gap="16" cols="1 s:2 m:3" responsive="screen">
      <NGi v-for="i in 3" :key="i">
        <NCard class="link-skeleton">
          <div class="link-content">
            <Skeleton type="rect" width="56px" height="56px" />
            <div class="link-info">
              <Skeleton width="80px" height="18px" />
              <Skeleton width="120px" height="14px" />
            </div>
          </div>
        </NCard>
      </NGi>
    </NGrid>

    <!-- 最近任务骨架 -->
    <NCard style="margin-top: 24px;">
      <template #header>
        <div class="card-header">
          <Skeleton width="80px" height="20px" />
          <Skeleton width="60px" height="16px" />
        </div>
      </template>
      <div class="table-skeleton">
        <div v-for="i in 5" :key="i" class="table-row">
          <Skeleton width="30%" />
          <Skeleton width="60px" />
          <Skeleton width="80px" />
          <Skeleton width="120px" />
        </div>
      </div>
    </NCard>
  </div>
</template>

<style scoped>
.home-skeleton {
  max-width: 1200px;
  margin: 0 auto;
}

.stat-skeleton,
.link-skeleton {
  border: none;
}

.stat-content,
.link-content {
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-info,
.link-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-skeleton {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.table-row {
  display: flex;
  align-items: center;
  gap: 16px;
}
</style>
