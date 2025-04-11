import { useEffect, useState } from 'react';

export default function QrTestPage() {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    // 표시하고 싶은 문자열 (예: UUID)
    const myUuid = '4aa5dbc1-d6fb-4a0c-bcdc-c9412b437bc6';

    // API 엔드포인트 호출 (동일 호스트 기준)
    fetch(`/api/qr?data=${encodeURIComponent(myUuid)}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.dataUrl) {
          // dataUrl이 "data:image/png;base64,..." 형태로 들어옴
          setQrDataUrl(json.dataUrl);
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }, []);

  return (
    <div>
      <h1>QR Test</h1>
      {/* qrDataUrl이 존재하면 <img>로 렌더링, 없으면 로딩 표시 */}
      {qrDataUrl ? (
        <img src={qrDataUrl} alt="QR Code" style={{ width: 200, height: 200 }} />
      ) : (
        <p>Loading QR...</p>
      )}
    </div>
  );
}
