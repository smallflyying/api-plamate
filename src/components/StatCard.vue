<script setup lang="ts">
defineProps<{
  title: string
  value: string | number
  color?: string
}>()
</script>

<template>
  <el-card shadow="hover" class="stat-card">
    <div class="stat-title">{{ title }}</div>
    <div class="stat-value" :style="{ color: color || '#303133' }">
      {{ typeof value === 'number' ? value.toLocaleString() : value }}
    </div>
  </el-card>
</template>

<style scoped>
.stat-card {
  text-align: center;
}
.stat-title {
  font-size: 14px;
  color: #909399;
  margin-bottom: 8px;
}
.stat-value {
  font-size: 28px;
  font-weight: bold;
}
</style>
