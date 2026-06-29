<template>
  <div class="container">
    <h3>字段映射</h3>
    <div v-if="templateData" class="mapping">
      <div class="sidebar">
        <h4>字段列表</h4>
        <button
          v-for="f in fields"
          :key="f"
          @click="selected = f"
          :class="['field-btn', { active: selected === f }]"
        >
          {{ f }}
          <span v-if="map[f]" class="coord">{{ map[f] }}</span>
        </button>
        <button @click="save" class="btn-save">保存</button>
      </div>

      <div class="table-box">
        <p v-if="selected" class="hint">👉 点击标记 <strong>{{ selected }}</strong> 位置</p>
        <div class="table-wrapper">
          <table>
            <tr v-for="(row, i) in templateData" :key="i">
              <td class="row-idx">{{ i + 1 }}</td>
              <td
                v-for="(cell, j) in row"
                :key="j"
                @click="mark(i + 1, j)"
                :class="getClass(i + 1, j)"
                class="cell"
              >
                {{ cell || '-' }}
              </td>
            </tr>
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
    selected: null,
    fields: [
      '客户名', '发票号', '日期', '币种',
      'PO号', '付款方式', '装运港', '目的港',
      '交货期', '总金额', '备注',
    ],
    newField: '',   // 用于用户自定义新增字段
    map: {},
    error: '',
  }
},
methods: {
  addField() {
    const f = this.newField.trim()
    if (!f || this.fields.includes(f)) return
    this.fields.push(f)
    this.newField = ''
  },
    getClass(row, col) {
      const col_letter = String.fromCharCode(65 + col)
      const coord = `${col_letter}${row}`
      if (Object.values(this.map).includes(coord)) return 'marked'
      if (this.selected) return 'hoverable'
      return ''
    },
    save() {
      this.$emit('saved', this.map)
      alert('已保存！')
    },
  },
}
</script>

<style scoped>
.container { max-width: 1200px; }
h3 { font-size: 20px; margin-bottom: 16px; color: #1A202C; }
.mapping { display: flex; gap: 20px; }
.sidebar { width: 180px; background: #f8fafc; border-radius: 8px; padding: 16px; height: fit-content; }
.sidebar h4 { font-size: 14px; margin-bottom: 12px; }
.field-btn { width: 100%; padding: 10px; background: white; border: 1px solid #e2e8f0; border-radius: 4px; margin-bottom: 8px; cursor: pointer; text-align: left; font-size: 13px; }
.field-btn:hover { border-color: #8B5CF6; }
.field-btn.active { background: #8B5CF6; color: white; border-color: #8B5CF6; }
.coord { float: right; background: #10b981; color: white; padding: 2px 6px; border-radius: 2px; font-size: 11px; }
.field-btn.active .coord { background: rgba(255,255,255,0.3); }
.btn-save { width: 100%; padding: 10px; background: #8B5CF6; color: white; border: none; border-radius: 4px; cursor: pointer; font-weight: bold; }
.table-box { flex: 1; }
.hint { padding: 10px; background: #fef3c7; border-radius: 4px; margin-bottom: 12px; font-size: 13px; }
.table-wrapper { border: 1px solid #e2e8f0; border-radius: 8px; overflow: auto; max-height: 500px; }
table { width: 100%; border-collapse: collapse; font-size: 12px; }
.row-idx { background: #f1f5f9; font-weight: 600; width: 40px; text-align: center; }
.cell { border: 1px solid #e2e8f0; padding: 6px; min-width: 80px; cursor: pointer; }
.cell:hover { background: #f0f9ff; }
.cell.hoverable:hover { background: #fef3c7; }
.cell.marked { background: #dbeafe; font-weight: 600; color: #0369a1; }
.error { color: #ef4444; background: #fee2e2; padding: 12px; border-radius: 4px; margin-top: 16px; }
</style>
