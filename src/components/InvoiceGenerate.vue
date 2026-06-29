<template>
  <div class="invoice-generate">
    <h3>生成单证</h3>
    <p class="subtitle">最后一步：确认参数并生成 PI 文件</p>

    <div class="generate-container">
      <div class="config-panel">
        <h4>生成参数</h4>

        <div class="param-group">
          <label>汇率（如需转换）</label>
          <input
            v-model.number="exchangeRate"
            type="number"
            step="0.01"
            placeholder="如 7.25"
            class="input-field"
          />
          <p class="hint">用于计算参考总价（如无需转换可不填）</p>
        </div>

        <div class="param-group">
          <label>客户名称</label>
          <input
            v-model="buyerName"
            type="text"
            placeholder="确认客户名称"
            class="input-field"
          />
        </div>

        <!-- ✅ 显示字段映射状态 -->
        <div v-if="mappingConfig && Object.keys(mappingConfig).length" class="mapping-status">
          ✓ 已加载字段映射（{{ Object.keys(mappingConfig).length }} 个字段）
        </div>
        <div v-else class="mapping-warn">
          ⚠ 未检测到字段映射，请先完成步骤 2
        </div>

        <button
          @click="handleGenerate"
          :disabled="generating"
          class="generate-btn"
        >
          {{ generating ? '生成中...' : '生成 PI 文件' }}
        </button>
      </div>

      <div class="preview-panel">
        <h4>合同数据预览</h4>
        <div v-if="previewData" class="preview-content">
          <div class="preview-item">
            <span class="label">客户名：</span>
            <span>{{ previewData.buyer || '---' }}</span>
          </div>
          <div class="preview-item">
            <span class="label">PO 号：</span>
            <span>{{ previewData.contract_no || '---' }}</span>
          </div>
          <div class="preview-item">
            <span class="label">日期：</span>
            <span>{{ previewData.date || '---' }}</span>
          </div>
          <div class="preview-item">
            <span class="label">产品数：</span>
            <span>{{ previewData.items ? previewData.items.length : 0 }} 项</span>
          </div>
          <div class="preview-item">
            <span class="label">总金额：</span>
            <span>{{ previewData.total_amount || 0 }}</span>
          </div>
        </div>
        <div v-else class="empty-state">
          <p>请先完成步骤 3：上传合同进行 AI 识别</p>
        </div>
      </div>
    </div>

    <div v-if="downloadLink" class="success-section">
      <div class="success-message">✓ 文件生成成功！</div>
      <a :href="downloadLink" :download="`PI_${buyerName}_${Date.now()}.xlsx`" class="download-btn">
        📥 下载 Excel 文件
      </a>
      <button @click="resetGenerate" class="new-btn">生成新的文件</button>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
import { invoiceAPI } from '../api'

export default {
  // ✅ 关键修复：声明 props，接收 App.vue 传来的合同数据和字段映射
  props: {
    extractedData: {
      type: Object,
      default: null,
    },
    mappingConfig: {
      type: Object,
      default: null,
    },
  },

  data() {
    return {
      exchangeRate: 7.25,
      buyerName: '',
      previewData: null,
      generating: false,
      error: '',
      downloadLink: null,
    }
  },

  // ✅ 关键修复：监听 prop 变化，自动同步到本地数据
  watch: {
    extractedData: {
      immediate: true,
      handler(val) {
        if (val) {
          this.previewData = val
          this.buyerName = val.buyer || ''
        }
      },
    },
  },

  methods: {
    async handleGenerate() {
      this.generating = true
      this.error = ''

      try {
        const generatedData = {
          mapping: this.mappingConfig,
          extracted_data: this.previewData || {
            buyer: this.buyerName,
            contract_no: '',
            items: [],
          },
          exchange_rate: this.exchangeRate,
        }

        const response = await invoiceAPI.generate(generatedData)
        const url = window.URL.createObjectURL(new Blob([response.data]))
        this.downloadLink = url
      } catch (err) {
        this.error = '生成失败：' + (err.message || '请稍后重试')
      } finally {
        this.generating = false
      }
    },

    resetGenerate() {
      this.downloadLink = null
      this.buyerName = ''
    },
  },
}
</script>

<style scoped>
.invoice-generate { max-width: 900px; }
h3 { font-size: 20px; margin-bottom: 8px; color: #1A202C; }
.subtitle { color: #666; margin-bottom: 24px; font-size: 14px; }
.generate-container { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; margin-bottom: 24px; }
.config-panel, .preview-panel { background: white; padding: 24px; border-radius: 8px; border: 1px solid #e2e8f0; }
.config-panel h4, .preview-panel h4 { font-size: 16px; margin-bottom: 16px; color: #1A202C; }
.param-group { margin-bottom: 16px; }
.param-group label { display: block; margin-bottom: 8px; font-weight: 500; color: #333; font-size: 14px; }
.input-field { width: 100%; padding: 10px; border: 1px solid #e2e8f0; border-radius: 4px; font-size: 14px; box-sizing: border-box; }
.input-field:focus { outline: none; border-color: #8B5CF6; box-shadow: 0 0 0 3px rgba(139, 92, 246, 0.1); }
.hint { font-size: 12px; color: #999; margin-top: 4px; }
.mapping-status { padding: 8px 12px; background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 4px; font-size: 13px; color: #059669; margin-bottom: 12px; }
.mapping-warn { padding: 8px 12px; background: #fffbeb; border: 1px solid #fde68a; border-radius: 4px; font-size: 13px; color: #92400e; margin-bottom: 12px; }
.generate-btn { width: 100%; padding: 12px; background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%); color: white; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; margin-top: 8px; transition: all 0.3s; }
.generate-btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 8px 16px rgba(139, 92, 246, 0.3); }
.generate-btn:disabled { opacity: 0.6; cursor: not-allowed; }
.preview-content { background: #f8fafc; padding: 16px; border-radius: 4px; }
.preview-item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #e2e8f0; font-size: 14px; }
.preview-item:last-child { border-bottom: none; }
.preview-item .label { font-weight: 500; color: #333; }
.empty-state { text-align: center; padding: 40px 20px; color: #999; }
.success-section { background: #f0fdf4; border: 1px solid #dcfce7; border-radius: 8px; padding: 24px; text-align: center; }
.success-message { font-size: 16px; color: #059669; font-weight: bold; margin-bottom: 16px; }
.download-btn { display: inline-block; padding: 12px 32px; background: #10b981; color: white; text-decoration: none; border-radius: 4px; font-size: 16px; font-weight: bold; transition: all 0.3s; margin-right: 12px; }
.download-btn:hover { background: #059669; }
.new-btn { padding: 12px 32px; background: #e5e7eb; color: #333; border: none; border-radius: 4px; font-size: 16px; font-weight: bold; cursor: pointer; }
.error-message { color: #ef4444; padding: 12px; background: #fee2e2; border-radius: 4px; font-size: 14px; margin-top: 16px; }
</style>
