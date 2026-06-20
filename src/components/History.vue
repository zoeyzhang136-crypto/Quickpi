<template>
  <div class="history">
    <h3>历史记录</h3>
    <p class="subtitle">查看和重新下载已生成的单证</p>

    <div class="history-container">
      <div v-if="records.length === 0" class="empty-state">
        <p>暂无生成记录</p>
      </div>

      <div v-else class="records-table">
        <table>
          <thead>
            <tr>
              <th>生成时间</th>
              <th>客户名</th>
              <th>产品数</th>
              <th>汇率</th>
              <th>操作</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="record in records" :key="record.id">
              <td>{{ formatDate(record.created_at) }}</td>
              <td>{{ record.buyer_name }}</td>
              <td>{{ record.product_count }}</td>
              <td>{{ record.exchange_rate }}</td>
              <td>
                <a :href="record.download_url" :download="`PI_${record.buyer_name}.xlsx`" class="download-link">
                  下载
                </a>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="pagination">
        <button 
          @click="prevPage" 
          :disabled="page === 1"
          class="page-btn"
        >
          ← 上一页
        </button>
        <span class="page-info">第 {{ page }} 页</span>
        <button 
          @click="nextPage"
          :disabled="records.length < pageSize"
          class="page-btn"
        >
          下一页 →
        </button>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
import { historyAPI } from '../api'

export default {
  data() {
    return {
      records: [],
      page: 1,
      pageSize: 20,
      loading: false,
      error: '',
    }
  },
  methods: {
    async loadRecords() {
      this.loading = true
      this.error = ''

      try {
        const response = await historyAPI.getList(this.page, this.pageSize)
        if (response.data.code === 0) {
          this.records = response.data.data
        }
      } catch (err) {
        this.error = '加载记录失败'
      } finally {
        this.loading = false
      }
    },
    prevPage() {
      if (this.page > 1) {
        this.page--
        this.loadRecords()
      }
    },
    nextPage() {
      this.page++
      this.loadRecords()
    },
    formatDate(dateStr) {
      return new Date(dateStr).toLocaleString('zh-CN')
    },
  },
  mounted() {
    this.loadRecords()
  },
}
</script>

<style scoped>
.history {
  max-width: 900px;
}

h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #1A202C;
}

.subtitle {
  color: #666;
  margin-bottom: 24px;
  font-size: 14px;
}

.history-container {
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

.empty-state {
  padding: 60px 20px;
  text-align: center;
  color: #999;
}

.records-table {
  overflow-x: auto;
}

.records-table table {
  width: 100%;
  border-collapse: collapse;
}

.records-table th {
  background: #f8fafc;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
}

.records-table td {
  padding: 12px;
  border-bottom: 1px solid #e2e8f0;
  font-size: 14px;
}

.records-table tr:hover {
  background: #f8fafc;
}

.download-link {
  color: #8B5CF6;
  text-decoration: none;
  font-weight: 500;
  cursor: pointer;
  transition: color 0.3s;
}

.download-link:hover {
  color: #7C3AED;
  text-decoration: underline;
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-top: 1px solid #e2e8f0;
  background: #f8fafc;
}

.page-btn {
  padding: 8px 16px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.page-btn:hover:not(:disabled) {
  background: #8B5CF6;
  color: white;
  border-color: #8B5CF6;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-info {
  font-size: 14px;
  color: #666;
}

.error-message {
  color: #ef4444;
  padding: 12px;
  background: #fee2e2;
  border-radius: 4px;
  font-size: 14px;
  margin-top: 16px;
}
</style>
