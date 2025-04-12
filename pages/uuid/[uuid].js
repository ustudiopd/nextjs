// pages/uuid/[uuid].js
import { useEffect, useState } from 'react';
import Link from 'next/link';
import pool from '../../lib/db';

export default function AttendancePage({ record }) {
  const [qrDataUrl, setQrDataUrl] = useState('');

  useEffect(() => {
    if (record) {
      // 현재 페이지 주소: window.location.origin + '/uuid/' + record.UUID
      const currentDomain = typeof window !== 'undefined' 
        ? window.location.origin 
        : '';
      const pageUrl = `${currentDomain}/uuid/${record.UUID}`;

      // QR 코드 생성 API에 현재 페이지 주소를 넘겨서 QR 이미지 생성
      fetch(`/api/qr?data=${encodeURIComponent(pageUrl)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.dataUrl) {
            setQrDataUrl(data.dataUrl);
          }
        })
        .catch((error) => console.error('Error fetching QR code:', error));
    }
  }, [record]);

  if (!record) {
    return <div>데이터를 찾을 수 없습니다.</div>;
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>{record.Attendees}님의 정보</h1>
      <p><strong>이벤트:</strong> {record.Event}</p>

      <p style={styles.sectionTitle}>현재 페이지 링크로 생성된 QR 코드:</p>
      {qrDataUrl ? (
        <img
          src={qrDataUrl}
          alt="현재 페이지로 이동하는 QR 코드"
          style={styles.qrImage}
        />
      ) : (
        <p>QR 코드 로딩 중...</p>
      )}

      {/* 기타 정보 표시 */}
      <p><strong>출석 여부:</strong> {record.AttendanceStatus ? '출석' : '미출석'}</p>
      <p><strong>상품 당첨:</strong> {record.Prize ? '당첨' : '미당첨'}</p>
      <p><strong>설문 참여:</strong> {record.Survey ? '참여함' : '미참여'}</p>
      <p><strong>현지 등록:</strong> {record.LocalRegist ? '등록됨' : '미등록'}</p>

      {/* 설문조사 참여 버튼 */}
      <p style={styles.buttonContainer}>
        <Link href={`/survey/${record.UUID}`}>
          <a style={styles.button}>설문조사 참여</a>
        </Link>
      </p>
    </div>
  );
}

const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1rem',
    fontFamily: 'sans-serif',
    textAlign: 'center',
  },
  title: {
    marginBottom: '1rem',
  },
  sectionTitle: {
    fontWeight: 'bold',
    marginTop: '1rem',
  },
  qrImage: {
    width: 200,
    height: 200,
    display: 'block',
    margin: '0 auto',
  },
  buttonContainer: {
    marginTop: '1rem',
  },
  button: {
    display: 'inline-block',
    padding: '0.5rem 1rem',
    backgroundColor: '#0070f3',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '4px',
  },
};

export async function getStaticPaths() {
  try {
    const res = await pool.query('SELECT "UUID" FROM "Attendance" LIMIT 500');
    const records = res.rows;

    const paths = records.map((row) => ({
      params: { uuid: row.UUID },
    }));

    return { paths, fallback: 'blocking' };
  } catch (error) {
    console.error('getStaticPaths 에러:', error);
    return { paths: [], fallback: 'blocking' };
  }
}

export async function getStaticProps({ params }) {
  const { uuid } = params;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM "Attendance" WHERE "UUID" = $1',
      [uuid]
    );
    const record = rows[0] || null;

    return {
      props: { record },
      revalidate: 60,
    };
  } catch (error) {
    console.error('getStaticProps 에러:', error);
    return { props: { record: null }, revalidate: 60 };
  }
}
