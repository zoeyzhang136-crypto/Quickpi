export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'POST') {
    const { phone, password } = req.body;
    
    return res.status(200).json({
      code: 0,
      data: {
        token: `token_${phone}`,
        phone: phone
      }
    });
  }
  
  res.status(405).json({ code: 1, message: 'Method not allowed' });
}
