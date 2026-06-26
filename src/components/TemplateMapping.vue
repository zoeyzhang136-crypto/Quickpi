<template>
  <div class="mapping">
    <h3>字段映射配置</h3>
    <p class="subtitle">点击表格指定各字段所在位置</p>

    <div v-if="templateData" class="mapping-container">
      <div class="sidebar">
        <h4>需要映射的字段</h4>
        <div class="field-list">
          <button 
            v-for="field in fields" 
            :key="field"
            :class="['field-btn', { active: selectedField === field }]"
            @click="selectedField = field"
          >
            {{ field }}
            <span v-if="mapping[field]" class="coord">{{ mapping[field] }}</span>
          </button>
        </div>

        <button @click="saveMappingConfig" class="save-btn">保存配置</button>
      </div>

      <div class="table-container">
        <div class="hint" v-if="selectedField">
          👉 点击表格来标记 "<strong>{{ selectedField }}</strong>" 的位置
        </div>

        <div class="table-scroll">
          <table>
            <tbody>
              <tr v-for="(row, i) in templateData" :key="i">
                <td class="row-num">{{ i + 1 }}</td>
                <td 
                  v-for="(cell, j) in row" 
                  :key="j"
                  @click="markCell(i + 1, j)"
                  :class="getCellClass(i + 1, j)"
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

    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script>
export default {
  props: {
    templateData: Array,
  },
  data() {
    return {
      selectedField: null,
      fields: ['客户名', '发票号', '日期', '币种'],
      mapping: {},
      error: '',
    }
  },
  methods: {
    markCell(row, col) {
      if (!this.selectedField) {
        this.error = '请先选择要映射的字段'
        return
      }

      const colLetter = String.fromCharCode(65 + col)
      const coord = `${colLetter}${row}`

      this.mapping[this.selectedField] = coord
      this.selectedField = null
    },
    getCellClass(row, col) {
      const colLetter = String.fromCharCode(65 + col)
      const coord = `${colLetter}${row}`
      
      for (let field in this.mapping) {
        if (this.mapping[field] === coord) {
          return 'marked'
        }
      }

      if (this.selectedField) {
        return 'hoverable'
      }

      return ''
    },
    saveMappingConfig() {
      this.$emit('saved', this.mapping)
      alert('配置已保存！')
    },
  },
}
</script>

<style scoped>
.mapping {
  max-width: 1200px;
}

h3 {
  font-size: 20px;
  margin-bottom: 8px;
  color: #1A202C;
}

.subtitle {
  color: #666;
  margin-bottom: 20px;
  font-size: 14px;
}

.mapping-container {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 200px;
  background: #f8fafc;
  border-radius: 8px;
  padding: 16px;
  height: fit-content;
}

.sidebar h4 {
  font-size: 14px;
  margin-bottom: 12px;
  color: #333;
}

.field-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.field-btn {
  padding: 10px;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  text-align: left;
  font-size: 13px;
  transition: all 0.2s;
}

.field-btn:hover {
  border-color: #8B5CF6;
}

.field-btn.active {
  background: #8B5CF6;
  color: white;
  border-color: #8B5CF6;
}

.coord {
  float: right;
  background: #10b981;
  color: white;
  padding: 2px 6px;
  border-radius: 2px;
  font-size: 11px;
  margin-left: 4px;
}

.field-btn.active .coord {
  background: rgba(255, 255, 255, 0.3);
}

.save-btn {
  width: 100%;
  padding: 10px;
  background: #8B5CF6;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.table-container {
  flex: 1;
}

.hint {
  padding: 10px;
  background: #fef3c7;
  border-radius: 4px;
  margin-bottom: 12px;
  font-size: 13px;
  color: #92400e;
}

.table-scroll {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  overflow: auto;
  max-height: 500px;
}

table {
  width: 100%;
  border-collapse: collapse;
  font-size: 12px;
}

.row-num {
  background: #f1f5f9;
  font-weight: 600;
  width: 40px;
  padding: 6px;
  text-align: center;
  position: sticky;
  left: 0;
}

.cell {
  border: 1px solid #e2e8f0;
  padding: 6px;
  min-width: 80px;
  cursor: pointer;
}

.cell:hover {
  background: #f0f9ff;
}

.cell.hoverable:hover {
  background: #fef3c7;
}

.cell.marked {
  background: #dbeafe;
  font-weight: 600;
  color: #0369a1;
}

.error {
  color: #ef4444;
  padding: 12px;
  background: #fee2e2;
  border-radius: 4px;
  margin-top: 12px;
}
</style>
