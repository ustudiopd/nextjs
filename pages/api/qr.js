import QRCode from 'qrcode';

export default async function handler(req, res) {
  const { data } = req.query;
  if (!data) {
    return res.status(400).json({ error: 'data query parameter is required.' });
  }

  try {
    // data(예: UUID 문자열) -> QR 코드 (data:image/png;base64,...) 생성
    const dataUrl = await QRCode.toDataURL(data);
    // JSON 형태로 반환
    res.status(200).json({ dataUrl });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code' });
  }
}
