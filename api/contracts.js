export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'POST') {
    return res.status(200).json({
      code: 0,
      data: {
        buyer: 'SALASAR IMPEX',
        contract_no: 'SC260269-SIM',
        date: '2026-03-02',
        currency: 'USD',
        items: [
          { code: '702984', name: 'Track Link Assy', qty: 4, unit_price: 630.00 },
          { code: '702507', name: 'Track Link Assy', qty: 6, unit_price: 630.00 },
          { code: '702605', name: 'Track Link Assy', qty: 2, unit_price: 1075.00 }
        ],
        total_amount: 5400.00
      }
    });
  }
  
  res.status(405).json({ code: 1, message: 'Method not allowed' });
}
