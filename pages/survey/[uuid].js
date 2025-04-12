// pages/survey/[uuid].js
import { useState } from 'react';
import pool from '../../lib/db';

export default function SurveyPage({ record }) {
  const [rating, setRating] = useState(null);
  const [submitted, setSubmitted] = useState(false);

  // 설문 제출 처리 함수 (실제 저장 로직은 API 라우트를 따로 구현하면 됩니다)
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/submitSurvey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          uuid: record.UUID,
          rating: rating,
        }),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('설문 제출에 실패했습니다.');
      }
    } catch (error) {
      console.error('설문 제출 에러:', error);
      alert('설문 제출 중 에러가 발생했습니다.');
    }
  };

  if (!record) {
    return <div>데이터를 찾을 수 없습니다.</div>;
  }

  if (submitted) {
    return (
      <div style={styles.container}>
        <h1>감사합니다!</h1>
        <p>설문이 성공적으로 제출되었습니다.</p>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h1>{record.Attendees} 님</h1>
      <p>이번 세션 만족하십니까?</p>
      <form onSubmit={handleSubmit}>
        <div style={styles.radioGroup}>
          {[1, 2, 3, 4, 5].map((num) => (
            <label key={num} style={styles.radioLabel}>
              <input
                type="radio"
                name="rating"
                value={num}
                onChange={(e) => setRating(e.target.value)}
                required
              />
              {num}점
            </label>
          ))}
        </div>
        <button type="submit" style={styles.submitButton}>
          설문 제출
        </button>
      </form>
    </div>
  );
}

// 간단한 인라인 스타일 객체
const styles = {
  container: {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '1rem',
    fontFamily: 'sans-serif',
    textAlign: 'center',
  },
  radioGroup: {
    margin: '1rem 0',
  },
  radioLabel: {
    marginRight: '1rem',
  },
  submitButton: {
    padding: '0.5rem 1rem',
    fontSize: '1rem',
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
      revalidate: 60, // 1분마다 재검증
    };
  } catch (error) {
    console.error('getStaticProps 에러:', error);
    return {
      props: { record: null },
      revalidate: 60,
    };
  }
}
