export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'POST' && req.url.includes('/upload')) {
    return res.status(200).json({
      code: 0,
      data: {
        file_id: 'file_demo',
        sheet_name: 'Sheet1',
        max_row: 50,
        max_col: 10,
        merged_cells: ['A1:C1'],
preview_data: Array.from({ length: 25 }, (_, i) => 
  Array.from({ length: 8 }, (_, j) => {
    if (i === 0) return ['销售单据', 'Proforma Invoice', null, null, null, null, null, null][j]
    if (i === 1) return ['序号', '品名', '数量', '单价', '金额', null, null, null][j]
    return `数据${i}-${j}`
  })
)
      }
    });
  }
  
  if (req.method === 'POST' && req.url.includes('/config')) {
    return res.status(200).json({
      code: 0,
      data: { config_id: 1001 }
    });
  }
  
  if (req.method === 'GET') {
    return res.status(200).json({
      code: 0,
      data: []
    });
  }
  
  res.status(405).json({ code: 1, message: 'Method not allowed' });
}
