// pages/uuid/[uuid].js
import { useState } from 'react';
import pool from '../../lib/db';

export default function AttendancePage({ record }) {
  // DB에서 받아온 기존 값을 초기값으로 설정합니다.
  const [q1, setQ1] = useState(record?.q1 ? record.q1.toString() : "");
  const [q2, setQ2] = useState(record?.q2 ? record.q2.toString() : "");
  const [q3, setQ3] = useState(record?.q3 ? record.q3.toString() : "");
  const [q4, setQ4] = useState(record?.q4 ? record.q4.toString() : "");
  const [q5, setQ5] = useState(record?.q5 ? record.q5.toString() : "");
  const [q6, setQ6] = useState(record?.q6 || "");

  // 설문 참여 여부 및 제출 결과 메시지 관리
  const [isSubmitted, setIsSubmitted] = useState(record?.Survey || false);
  const [submitMessage, setSubmitMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/submitSurvey', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uuid: record.UUID, q1, q2, q3, q4, q5, q6 }),
      });
      const data = await res.json();
      if (res.ok) {
        setSubmitMessage(data.message);
        setIsSubmitted(true);
      } else {
        alert('설문 제출 중 오류: ' + data.error);
      }
    } catch (error) {
      console.error('Submit error:', error);
      alert('설문 제출 중 오류가 발생했습니다.');
    }
  };

  return (
    <div style={styles.container}>
      <h1>설문 조사</h1>
      {isSubmitted && (
        <div style={styles.infoMessage}>이미 설문에 참여하셨습니다.</div>
      )}
      {submitMessage && (
        <div style={styles.submitMessage}>{submitMessage}</div>
      )}
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label>질문1: 강의 내용 만족도 (1~5점)</label>
          <div style={styles.radioGroup}>
            {[1, 2, 3, 4, 5].map(num => (
              <label key={`q1-${num}`} style={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="q1" 
                  value={num} 
                  checked={q1 === num.toString()} 
                  onChange={(e) => setQ1(e.target.value)} 
                  required 
                />
                {num}
              </label>
            ))}
          </div>
        </div>
        <div style={styles.formGroup}>
          <label>질문2: 강의 진행 만족도 (1~5점)</label>
          <div style={styles.radioGroup}>
            {[1, 2, 3, 4, 5].map(num => (
              <label key={`q2-${num}`} style={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="q2" 
                  value={num} 
                  checked={q2 === num.toString()} 
                  onChange={(e) => setQ2(e.target.value)} 
                  required 
                />
                {num}
              </label>
            ))}
          </div>
        </div>
        <div style={styles.formGroup}>
          <label>질문3: 강사의 전문성 (1~5점)</label>
          <div style={styles.radioGroup}>
            {[1, 2, 3, 4, 5].map(num => (
              <label key={`q3-${num}`} style={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="q3" 
                  value={num} 
                  checked={q3 === num.toString()} 
                  onChange={(e) => setQ3(e.target.value)} 
                  required 
                />
                {num}
              </label>
            ))}
          </div>
        </div>
        <div style={styles.formGroup}>
          <label>질문4: 시설 및 환경 만족도 (1~5점)</label>
          <div style={styles.radioGroup}>
            {[1, 2, 3, 4, 5].map(num => (
              <label key={`q4-${num}`} style={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="q4" 
                  value={num} 
                  checked={q4 === num.toString()} 
                  onChange={(e) => setQ4(e.target.value)} 
                  required 
                />
                {num}
              </label>
            ))}
          </div>
        </div>
        <div style={styles.formGroup}>
          <label>질문5: 종합 만족도 (1~5점)</label>
          <div style={styles.radioGroup}>
            {[1, 2, 3, 4, 5].map(num => (
              <label key={`q5-${num}`} style={styles.radioLabel}>
                <input 
                  type="radio" 
                  name="q5" 
                  value={num} 
                  checked={q5 === num.toString()} 
                  onChange={(e) => setQ5(e.target.value)} 
                  required 
                />
                {num}
              </label>
            ))}
          </div>
        </div>
        <div style={styles.formGroup}>
          <label>질문6: 추가 의견</label>
          <textarea 
            value={q6} 
            onChange={(e) => setQ6(e.target.value)} 
          />
        </div>
        <button type="submit" style={styles.button}>제출하기</button>
      </form>
    </div>
  );
}

const styles = {
  container: { maxWidth: '600px', margin: '0 auto', padding: '1rem', fontFamily: 'sans-serif' },
  infoMessage: {
    backgroundColor: '#f0f0f0', padding: '0.5rem', marginBottom: '1rem',
    borderRadius: '4px', textAlign: 'center'
  },
  submitMessage: {
    backgroundColor: '#d1ffd1', padding: '0.5rem', marginBottom: '1rem',
    borderRadius: '4px', textAlign: 'center'
  },
  form: { display: 'flex', flexDirection: 'column', gap: '1rem' },
  formGroup: { display: 'flex', flexDirection: 'column' },
  radioGroup: { display: 'flex', gap: '1rem', marginTop: '0.5rem' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '0.3rem' },
  button: {
    padding: '0.5rem 1rem', backgroundColor: '#0070f3', color: '#fff',
    border: 'none', borderRadius: '4px', cursor: 'pointer'
  }
};

export async function getServerSideProps({ params }) {
  const { uuid } = params;
  try {
    const { rows } = await pool.query('SELECT * FROM "Attendance" WHERE "UUID" = $1', [uuid]);
    const record = rows[0] || null;
    return { props: { record } };
  } catch (error) {
    console.error('getServerSideProps 에러:', error);
    return { props: { record: null } };
  }
}
