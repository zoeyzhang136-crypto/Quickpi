export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'POST') {
    return res.status(200).json({
      code: 0,
      data: {
        message: '文件已生成',
        filename: 'PI_SALASAR_IMPEX.xlsx'
      }
    });
  }
  
  res.status(405).json({ code: 1, message: 'Method not allowed' });
}
