// pages/uuid/[uuid].js
import { useEffect, useState } from 'react';
import pool from '../../lib/db';

export default function AttendancePage({ record, surveyUrl }) {
  // surveyUrl: 설문조사 URL (예: QRSurveyLink 값을 그대로 사용하거나, uuid를 쿼리스트링으로 추가한 값)
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (surveyUrl) {
      // record.QRSurveyLink 혹은 재구성된 surveyUrl을 이용하여 QR 코드를 생성합니다.
      fetch(`/api/qr?data=${encodeURIComponent(surveyUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.dataUrl) {
            setQrDataUrl(data.dataUrl);
          }
        })
        .catch((error) => console.error("Error fetching QR code:", error));
    }
  }, [surveyUrl]);

  if (!record) {
    return <div>데이터를 찾을 수 없습니다.</div>;
  }

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '1rem',
        fontFamily: 'sans-serif',
        textAlign: 'center',
      }}
    >
      <h1 style={{ marginBottom: '1rem' }}>{record.Attendees}님의 정보</h1>
      <p><strong>이벤트:</strong> {record.Event}</p>
      
      <p style={{ fontWeight: 'bold', marginTop: '1rem' }}>설문조사로 이동하는 QR 코드:</p>
      {qrDataUrl ? (
        <img
          src={qrDataUrl}
          alt="Survey QR 코드"
          style={{ width: 200, height: 200, display: 'block', margin: '0 auto' }}
        />
      ) : (
        <p>QR 코드 로딩 중...</p>
      )}
      
      <p style={{ margin: '0.5rem 0' }}>
        <strong>출석 여부:</strong> {record.AttendanceStatus ? '출석' : '미출석'}
      </p>
      <p style={{ margin: '0.5rem 0' }}>
        <strong>상품 당첨:</strong> {record.Prize ? '당첨' : '미당첨'}
      </p>
      <p style={{ margin: '0.5rem 0' }}>
        <strong>설문 참여:</strong> {record.Survey ? '참여함' : '미참여'}
      </p>
      <p style={{ margin: '0.5rem 0' }}>
        <strong>현지 등록:</strong> {record.LocalRegist ? '등록됨' : '미등록'}
      </p>
      <p style={{ margin: '0.5rem 0' }}>
        <strong>설문 링크:</strong>{' '}
        <a href={surveyUrl} target="_blank" rel="noopener noreferrer">
          설문조사 바로가기
        </a>
      </p>
    </div>
  );
}

export async function getStaticPaths() {
  try {
    const res = await pool.query('SELECT "UUID" FROM "Attendance" LIMIT 500');
    const records = res.rows;

    const paths = records.map((row) => ({
      params: { uuid: row.UUID },
    }));

    return { paths, fallback: 'blocking' };
  } catch (error) {
    console.error("getStaticPaths 에러:", error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  const { uuid } = params;
  try {
    // DB에서 해당 UUID 레코드 조회
    const { rows } = await pool.query(
      'SELECT * FROM "Attendance" WHERE "UUID" = $1',
      [uuid]
    );
    const record = rows[0] || null;

    if (!record) {
      return { props: { record: null, surveyUrl: '' }, revalidate: 60 };
    }

    // QRSurveyLink 필드가 설문조사 기본 URL이라면, 필요에 따라 uuid 토큰을 붙입니다.
    // 예를 들어, record.QRSurveyLink가 "https://survey.example.com"이면:
    const surveyUrl = record.QRSurveyLink.includes('?')
      ? `${record.QRSurveyLink}&uuid=${encodeURIComponent(record.UUID)}`
      : `${record.QRSurveyLink}?uuid=${encodeURIComponent(record.UUID)}`;

    return {
      props: { record, surveyUrl },
      revalidate: 60,
    };
  } catch (error) {
    console.error("getStaticProps 에러:", error);
    return { props: { record: null, surveyUrl: '' }, revalidate: 60 };
  }
}
