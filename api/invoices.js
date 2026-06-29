import * as XLSX from 'xlsx'

export default function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ code: 1, message: 'Method not allowed' })
  }

  try {
    const body = req.body || {}
    const extracted = body.extracted_data || {}
    const buyer      = extracted.buyer        || 'Customer'
    const contractNo = extracted.contract_no  || ''
    const date       = extracted.date         || new Date().toISOString().split('T')[0]
    const currency   = extracted.currency     || 'USD'
    const items      = Array.isArray(extracted.items) ? extracted.items : []
    const rate       = Number(body.exchange_rate) || 1

    // ── 构建二维数组（Sheet 内容）──────────────────────────────
    const rows = [
      ['PROFORMA INVOICE'],
      [],
      ['To (买方):', buyer,       '', 'Invoice No (发票号):', contractNo],
      ['Date (日期):', date,      '', 'Currency (币种):', currency],
      [],
      ['No.', 'Item Code', 'Description', 'Qty', `Unit Price (${currency})`, `Amount (${currency})`],
    ]

    let total = 0
    items.forEach((item, idx) => {
      const amount = (Number(item.qty) || 0) * (Number(item.unit_price) || 0)
      total += amount
      rows.push([
        idx + 1,
        item.code       || '',
        item.name       || '',
        Number(item.qty)        || 0,
        Number(item.unit_price) || 0,
        amount,
      ])
    })

    rows.push([])
    rows.push(['', '', '', '', `Total ${currency}:`, total])
    if (rate !== 1) {
      rows.push(['', '', '', '', `Total CNY (@${rate}):`, parseFloat((total * rate).toFixed(2))])
    }
    rows.push([])
    rows.push(['Remarks:', extracted.remark || ''])

    // ── 生成 Excel ─────────────────────────────────────────────
    const ws = XLSX.utils.aoa_to_sheet(rows)

    // 设置列宽
    ws['!cols'] = [
      { wch: 4 }, { wch: 12 }, { wch: 28 },
      { wch: 8 }, { wch: 18 }, { wch: 18 },
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, 'PI')

    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })

    const safeName = buyer.replace(/[^a-zA-Z0-9_\-\u4e00-\u9fa5]/g, '_')
    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    )
    res.setHeader('Content-Disposition', `attachment; filename="PI_${safeName}.xlsx"`)
    res.status(200).send(Buffer.from(buffer))
  } catch (err) {
    console.error('Invoice generate error:', err)
    res.status(500).json({ code: 1, message: err.message || '生成失败' })
  }
}
