<script setup lang="ts">
import { onMounted, ref, reactive } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import api from '@/api'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Refresh } from '@element-plus/icons-vue'

const store = useSettingsStore()
const syncing = ref(false)
const dialogVisible = ref(false)
const dialogTitle = ref('添加模型配置')
const editingId = ref<number | null>(null)

const providerForm = reactive({
  name: '',
  apiKey: '',
  baseUrl: '',
  modelsInput: '',
})

const form = ref({
  date: new Date().toISOString().slice(0, 10),
  model: '',
  prompt_tokens: 0,
  completion_tokens: 0,
  request_count: 1,
})

onMounted(() => {
  store.fetchSettings()
})

function openAddDialog() {
  dialogTitle.value = '添加模型配置'
  editingId.value = null
  providerForm.name = ''
  providerForm.apiKey = ''
  providerForm.baseUrl = ''
  providerForm.modelsInput = ''
  dialogVisible.value = true
}

function openEditDialog(provider: typeof store.providers[number]) {
  dialogTitle.value = '编辑模型配置'
  editingId.value = provider.id
  providerForm.name = provider.name
  providerForm.apiKey = provider.apiKey
  providerForm.baseUrl = provider.baseUrl
  providerForm.modelsInput = provider.models.join(', ')
  dialogVisible.value = true
}

function handleSaveProvider() {
  if (!providerForm.name || !providerForm.apiKey) {
    ElMessage.warning('名称和 API Key 为必填')
    return
  }
  const data = {
    name: providerForm.name.trim(),
    apiKey: providerForm.apiKey.trim(),
    baseUrl: providerForm.baseUrl.trim(),
    models: providerForm.modelsInput
      .split(/[,，\s]+/)
      .map((s) => s.trim())
      .filter(Boolean),
  }
  if (editingId.value) {
    store.updateProvider(editingId.value, data)
  } else {
    store.addProvider(data)
  }
  dialogVisible.value = false
}

function handleDeleteProvider(id: number, name: string) {
  ElMessageBox.confirm(`确认删除「${name}」的配置？`, '提示', { type: 'warning' })
    .then(() => store.deleteProvider(id))
    .catch(() => {})
}

function handleSync() {
  syncing.value = true
  api.post('/api/usage/sync')
    .then(({ data }) => {
      const msg = data.synced > 0
        ? `同步完成，共写入 ${data.synced} 条记录`
        : '同步完成，无新数据'
      if (data.errors?.length) {
        ElMessage.warning(`${msg}（${data.errors.length} 个提供商失败）`)
      } else {
        ElMessage.success(msg)
      }
      store.fetchSettings()
    })
    .catch((err) => ElMessage.error(err.message))
    .finally(() => { syncing.value = false })
}

function handleAddRecord() {
  const { date, model, prompt_tokens, completion_tokens, request_count } = form.value
  if (!model) { ElMessage.warning('请选择模型'); return }
  if (!prompt_tokens && !completion_tokens) { ElMessage.warning('请输入 Token 数量'); return }
  api.post('/api/usage/record', { date, model, prompt_tokens, completion_tokens, request_count })
    .then(() => {
      ElMessage.success('记录已添加')
      form.value = { ...form.value, prompt_tokens: 0, completion_tokens: 0, request_count: 1 }
      store.fetchSettings()
    })
    .catch((err) => ElMessage.error(err.message))
}
</script>

<template>
  <div class="settings-page">
    <el-row :gutter="16">
      <el-col :span="16">
        <!-- Provider list -->
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <span>模型 & API Key 配置</span>
              <el-button type="primary" size="small" :icon="Plus" @click="openAddDialog">
                添加配置
              </el-button>
            </div>
          </template>

          <el-empty v-if="store.providers.length === 0" description="暂无配置，点击上方按钮添加" />

          <el-table v-else :data="store.providers" stripe>
            <el-table-column prop="name" label="名称" width="140" />
            <el-table-column prop="apiKey" label="API Key" min-width="200">
              <template #default="{ row }">
                <code>{{ row.apiKey.slice(0, 12) }}{{ row.apiKey.length > 12 ? '...' : '' }}</code>
              </template>
            </el-table-column>
            <el-table-column prop="baseUrl" label="Base URL" min-width="200">
              <template #default="{ row }">
                <span v-if="row.baseUrl">{{ row.baseUrl }}</span>
                <el-tag v-else type="info" size="small">未设置</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="models" label="模型列表" min-width="200">
              <template #default="{ row }">
                <el-tag
                  v-for="m in row.models"
                  :key="m"
                  size="small"
                  style="margin-right:4px;margin-bottom:2px"
                >{{ m }}</el-tag>
                <span v-if="row.models.length === 0" style="color:#909399">-</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="140" fixed="right">
              <template #default="{ row }">
                <el-button size="small" :icon="Edit" @click="openEditDialog(row)">编辑</el-button>
                <el-button size="small" type="danger" :icon="Delete" @click="handleDeleteProvider(row.id, row.name)" />
              </template>
            </el-table-column>
          </el-table>

          <div v-if="store.providers.length > 0" style="margin-top:12px">
            <el-button
              :loading="syncing"
              :icon="Refresh"
              type="success"
              @click="handleSync"
            >
              从所有提供商同步数据
            </el-button>
          </div>
        </el-card>

        <!-- Add record form -->
        <el-card shadow="hover" style="margin-top:16px">
          <template #header>手动添加用量记录</template>
          <el-form :model="form" label-width="120px">
            <el-form-item label="日期">
              <el-date-picker
                v-model="form.date"
                type="date"
                placeholder="选择日期"
                value-format="YYYY-MM-DD"
              />
            </el-form-item>
            <el-form-item label="模型">
              <el-select v-model="form.model" placeholder="选择模型" clearable style="width:260px">
                <el-option
                  v-for="m in store.allModels"
                  :key="m"
                  :label="m"
                  :value="m"
                />
              </el-select>
            </el-form-item>
            <el-form-item label="Prompt Token">
              <el-input-number v-model="form.prompt_tokens" :min="0" style="width:200px" />
            </el-form-item>
            <el-form-item label="Completion Token">
              <el-input-number v-model="form.completion_tokens" :min="0" style="width:200px" />
            </el-form-item>
            <el-form-item label="请求数">
              <el-input-number v-model="form.request_count" :min="1" style="width:200px" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" @click="handleAddRecord">添加记录</el-button>
            </el-form-item>
          </el-form>
        </el-card>
      </el-col>

      <el-col :span="8">
        <el-card shadow="hover">
          <template #header>数据库信息</template>
          <el-descriptions :column="1" border>
            <el-descriptions-item label="记录总数">
              {{ store.dbStats.recordCount }}
            </el-descriptions-item>
            <el-descriptions-item label="提供商数">
              {{ store.dbStats.providerCount }}
            </el-descriptions-item>
            <el-descriptions-item label="数据范围">
              {{ store.dbStats.dateRange }}
            </el-descriptions-item>
          </el-descriptions>
        </el-card>
      </el-col>
    </el-row>

    <!-- Add/Edit Provider Dialog -->
    <el-dialog v-model="dialogVisible" :title="dialogTitle" width="520px">
      <el-form :model="providerForm" label-width="100px">
        <el-form-item label="名称" required>
          <el-input v-model="providerForm.name" placeholder="如 DeepSeek、OpenAI" />
        </el-form-item>
        <el-form-item label="API Key" required>
          <el-input v-model="providerForm.apiKey" type="password" show-password placeholder="sk-xxx" />
        </el-form-item>
        <el-form-item label="Base URL">
          <el-input v-model="providerForm.baseUrl" placeholder="如 https://api.deepseek.com" />
        </el-form-item>
        <el-form-item label="模型列表">
          <el-input
            v-model="providerForm.modelsInput"
            type="textarea"
            :rows="2"
            placeholder="多个模型用逗号分隔，如：deepseek-chat, deepseek-coder"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSaveProvider" :loading="store.saving">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<style scoped>
.settings-page { }
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
code {
  background: #f5f7fa;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: 13px;
}
</style>
