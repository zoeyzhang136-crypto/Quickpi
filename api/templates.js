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
        preview_data: [
          ['标题', null, null],
          ['序号', '品名', '数量']
        ]
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
