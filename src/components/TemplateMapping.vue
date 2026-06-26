<template>
  <div class="template-mapping">
    <h3>字段映射配置</h3>
    <p class="subtitle">点击表格行/列，标记表头、页脚和产品字段</p>

    <div v-if="template && template.data" class="mapping-container">
      <div class="mapping-panel">
        <div class="config-section">
          <h4>表格标记</h4>
          <div class="button-group">
            <button 
              @click="markingMode = 'headerEnd'"
              :class="['mark-btn', { active: markingMode === 'headerEnd' }]"
            >
              📍 标记表头结束行
            </button>
            <button 
              @click="markingMode = 'footerStart'"
              :class="['mark-btn', { active: markingMode === 'footerStart' }]"
            >
              📍 标记页脚起始行
            </button>
          </div>
          <div v-if="headerEndRow" class="marked-info">
            ✓ 表头结束行: {{ headerEndRow }}
          </div>
          <div v-if="footerStartRow" class="marked-info">
            ✓ 页脚起始行: {{ footerStartRow }}
          </div>
        </div>

        <div class="config-section">
          <h4>字段映射</h4>
          <div class="field-list">
            <div 
              v-for="field in fields" 
              :key="field.key"
              class="field-item"
              @click="currentField = field.key"
              :class="{ active: currentField === field.key }"
            >
              <span class="field-name">{{ field.label }}</span>
              <span v-if="mapping[field.key]" class="field-coord">
                {{ mapping[field.key] }}
              </span>
              <span v-else class="field-empty">未配置</span>
            </div>
          </div>
        </div>

        <button @click="saveMapping" class="save-btn">保存配置</button>
      </div>

      <div class="grid-panel">
        <div class="grid-container">
          <table class="excel-grid">
            <tbody>
              <tr v-for="(row, rowIdx) in template.data.preview_data" :key="rowIdx">
                <td class="row-header" @click="markRow(rowIdx + 1)">
                  {{ rowIdx + 1 }}
                </td>
                <td 
                  v-for="(cell, colIdx) in row" 
                  :key="colIdx"
                  @click="markCell(rowIdx + 1, colIdx)"
                  class="cell"
                >
                  {{ cell || '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div v-else class="empty-state">
      <p>请先上传模板</p>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
export default {
  props: {
    template: Object,
  },
  data() {
    return {
      markingMode: null,
      headerEndRow: null,
      footerStartRow: null,
      currentField: null,
      mapping: {},
      fields: [
        { key: 'buyer', label: '客户名' },
        { key: 'invoice_no', label: '发票号' },
        { key: 'date', label: '日期' },
        { key: 'currency', label: '币种' },
      ],
      error: '',
    }
  },
  methods: {
    markRow(rowNum) {
      if (this.markingMode === 'headerEnd') {
        this.headerEndRow = rowNum
        this.markingMode = null
      } else if (this.markingMode === 'footerStart') {
        this.footerStartRow = rowNum
        this.markingMode = null
      }
    },
    markCell(row, col) {
      const colLetter = String.fromCharCode(65 + col)
      const coord = `${colLetter}${row}`

      if (this.currentField) {
        this.mapping[this.currentField] = coord
        this.currentField = null
      }
    },
    saveMapping() {
      if (!this.headerEndRow || !this.footerStartRow) {
        this.error = '请先标记表头结束行和页脚起始行'
        return
      }     
  const config = {
    headerEndRow: this.headerEndRow,
    footerStartRow: this.footerStartRow,
    mapping: this.mapping,
  }
  
  this.$emit('saved', config)
      alert('配置已保存！')
    },
  },
}
</script>

<style scoped>
.template-mapping {
  max-width: 1400px;
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

.empty-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.mapping-container {
  display: flex;
  gap: 32px;
}

.mapping-panel {
  width: 280px;
  background: #f8fafc;
  padding: 20px;
  border-radius: 8px;
  height: fit-content;
}

.config-section {
  margin-bottom: 24px;
}

.config-section h4 {
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 12px;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.mark-btn {
  padding: 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s;
}

.mark-btn.active {
  background: #8B5CF6;
  color: white;
  border-color: #8B5CF6;
}

.marked-info {
  padding: 8px;
  background: white;
  border-left: 3px solid #10b981;
  margin-top: 8px;
  font-size: 12px;
  color: #059669;
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-item {
  padding: 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
}

.field-item.active {
  background: #ede9fe;
  border-color: #8B5CF6;
}

.field-coord {
  background: #10b981;
  color: white;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 11px;
}

.field-empty {
  color: #999;
  font-size: 11px;
}

.save-btn {
  width: 100%;
  padding: 10px;
  background: #8B5CF6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.grid-panel {
  flex: 1;
  overflow-x: auto;
}

.grid-container {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: auto;
  background: white;
}

.excel-grid {
  border-collapse: collapse;
  font-size: 12px;
  width: 100%;
}

.excel-grid td {
  border: 1px solid #e2e8f0;
  padding: 8px;
  cursor: pointer;
}

.row-header {
  background: #f1f5f9;
  font-weight: 600;
  width: 40px;
}

.cell:hover {
  background: #f0f9ff;
}

.error-message {
  color: #ef4444;
  padding: 12px;
  background: #fee2e2;
  border-radius: 4px;
  margin-top: 16px;
}
</style>
