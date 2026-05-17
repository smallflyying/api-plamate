<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'
import {
  DataAnalysis,
  List,
  Setting,
} from '@element-plus/icons-vue'

const route = useRoute()
const activeMenu = computed(() => route.path)
</script>

<template>
  <el-container class="layout">
    <el-aside width="200px">
      <div class="logo">DeepSeek Usage</div>
      <el-menu
        :default-active="activeMenu"
        router
        background-color="#304156"
        text-color="#bfcbd9"
        active-text-color="#409EFF"
      >
        <el-menu-item index="/">
          <el-icon><DataAnalysis /></el-icon>
          <span>仪表盘</span>
        </el-menu-item>
        <el-menu-item index="/usage">
          <el-icon><List /></el-icon>
          <span>用量明细</span>
        </el-menu-item>
        <el-menu-item index="/settings">
          <el-icon><Setting /></el-icon>
          <span>设置</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}
html, body, #app {
  height: 100%;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', Arial, sans-serif;
}
.layout {
  height: 100%;
}
.el-aside {
  background-color: #304156;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  border-bottom: 1px solid rgba(255,255,255,0.1);
}
.el-menu {
  border-right: none;
}
.el-main {
  background-color: #f0f2f5;
  min-height: 100%;
}
</style>
