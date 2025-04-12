// pages/api/submitSurvey.js
import pool from '../../lib/db';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end(); // Method Not Allowed
  }

  const { uuid, q1, q2, q3, q4, q5, q6 } = req.body;
  if (!uuid) {
    return res.status(400).json({ error: 'UUID is required' });
  }

  try {
    const checkResult = await pool.query(
      'SELECT "Survey" FROM "Attendance" WHERE "UUID" = $1',
      [uuid]
    );
    let message = '설문이 제출되었습니다.';
    if (checkResult.rows.length > 0 && checkResult.rows[0].Survey === true) {
      message = '설문이 업데이트 되었습니다.';
    }

    await pool.query(
      `UPDATE "Attendance"
       SET "q1" = $1,
           "q2" = $2,
           "q3" = $3,
           "q4" = $4,
           "q5" = $5,
           "q6" = $6,
           "Survey" = true
       WHERE "UUID" = $7`,
      [q1, q2, q3, q4, q5, q6, uuid]
    );

    return res.status(200).json({ message });
  } catch (error) {
    console.error('Error updating survey:', error);
    return res.status(500).json({ error: 'Failed to update survey' });
  }
}
