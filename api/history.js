export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'GET') {
    return res.status(200).json({
      code: 0,
      data: [
        {
          id: 1,
          buyer_name: 'SALASAR IMPEX',
          product_count: 3,
          exchange_rate: 7.25,
          created_at: '2026-06-22 10:30:00'
        }
      ]
    });
  }
  
  res.status(405).json({ code: 1, message: 'Method not allowed' });
}
