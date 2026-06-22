export default function handler(req, res) {
  res.status(200).json({
    code: 0,
    message: "Backend is running",
    timestamp: new Date().toISOString()
  });
}
