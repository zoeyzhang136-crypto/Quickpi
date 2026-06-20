<template>
  <div class="template-mapping">
    <h3>字段映射配置</h3>
    <p class="subtitle">点击表格行/列，标记表头、页脚和产品字段</p>

    <div v-if="template" class="mapping-container">
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
              <tr v-for="(row, rowIdx) in template.preview_data" :key="rowIdx" :class="getRowClass(rowIdx)">
                <td class="row-header" @click="markRow(rowIdx + 1)">
                  {{ rowIdx + 1 }}
                </td>
                <td 
                  v-for="(cell, colIdx) in row" 
                  :key="colIdx"
                  @click="markCell(rowIdx + 1, colIdx)"
                  :class="getCellClass(rowIdx + 1, colIdx)"
                  class="cell"
                >
                  {{ cell || '' }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="column-headers">
          <span 
            v-for="(col, idx) in getColumnLetters(template.preview_data[0]?.length || 1)"
            :key="idx"
            class="col-letter"
          >
            {{ col }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="error" class="error-message">{{ error }}</div>
  </div>
</template>

<script>
import { templateAPI } from '../api'

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
      detailColumns: {
        code: null,
        name: null,
        qty: null,
        price: null,
      },
      error: '',
      loading: false,
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
      const colLetter = this.getColumnLetter(col)
      const coord = `${colLetter}${row}`

      if (this.currentField) {
        this.mapping[this.currentField] = coord
        this.currentField = null
      }
    },
    getRowClass(rowIdx) {
      const rowNum = rowIdx + 1
      return {
        'header-row': rowNum <= this.headerEndRow,
        'footer-row': rowNum >= this.footerStartRow,
        'detail-row': rowNum > this.headerEndRow && rowNum < this.footerStartRow,
      }
    },
    getCellClass(row, col) {
      const coord = `${this.getColumnLetter(col)}${row}`
      const isMarked = Object.values(this.mapping).includes(coord)
      return {
        marked: isMarked,
        hoverable: this.markingMode || this.currentField,
      }
    },
    getColumnLetter(index) {
      return String.fromCharCode(65 + index)
    },
    getColumnLetters(count) {
      const letters = []
      for (let i = 0; i < count; i++) {
        letters.push(String.fromCharCode(65 + i))
      }
      return letters
    },
    async saveMapping() {
      if (!this.headerEndRow || !this.footerStartRow) {
        this.error = '请先标记表头结束行和页脚起始行'
        return
      }

      this.loading = true
      this.error = ''

      try {
        const config = {
          header_end_row: this.headerEndRow,
          footer_start_row: this.footerStartRow,
          fields: this.mapping,
          detail_columns: this.detailColumns,
        }

        const response = await templateAPI.saveConfig({
          template_id: this.template.file_id,
          template_name: '默认模板',
          config,
        })

        if (response.data.code === 0) {
          alert('配置保存成功！')
        }
      } catch (err) {
        this.error = '保存失败，请重试'
      } finally {
        this.loading = false
      }
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

.mapping-container {
  display: flex;
  gap: 32px;
  margin-bottom: 20px;
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
  color: #333;
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
  text-align: left;
}

.mark-btn:hover {
  border-color: #8B5CF6;
  background: #faf5ff;
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
  border-radius: 2px;
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
  transition: all 0.3s;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.field-item:hover {
  border-color: #8B5CF6;
}

.field-item.active {
  background: #ede9fe;
  border-color: #8B5CF6;
}

.field-name {
  font-weight: 500;
  font-size: 13px;
  color: #333;
}

.field-coord {
  font-family: monospace;
  background: #10b981;
  color: white;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 11px;
}

.field-empty {
  font-size: 11px;
  color: #999;
  font-style: italic;
}

.save-btn {
  width: 100%;
  padding: 10px;
  background: #8B5CF6;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
}

.save-btn:hover {
  background: #7C3AED;
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
  min-width: 100%;
}

.excel-grid td {
  border: 1px solid #e2e8f0;
  padding: 8px;
  max-width: 100px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.row-header {
  background: #f1f5f9;
  font-weight: 600;
  text-align: center;
  width: 40px;
  cursor: pointer;
  user-select: none;
}

.row-header:hover {
  background: #e2e8f0;
}

.cell {
  cursor: pointer;
  background: white;
  transition: all 0.2s;
}

.cell:hover {
  background: #f0f9ff;
}

.cell.marked {
  background: #dbeafe;
  font-weight: 600;
  color: #0369a1;
}

.header-row .cell {
  background: #f8fafc;
  font-weight: 500;
}

.footer-row .cell {
  background: #fef3c7;
}

.column-headers {
  display: flex;
  gap: 1px;
  padding: 8px;
  background: #f1f5f9;
  overflow-x: auto;
}

.col-letter {
  width: 100px;
  text-align: center;
  font-weight: 600;
  font-size: 12px;
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
