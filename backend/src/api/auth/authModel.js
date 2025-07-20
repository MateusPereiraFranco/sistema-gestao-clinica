const db = require('../../config/db');

exports.createPasswordResetToken = async (email, hashedToken, expiresAt) => {
    const query = `
        INSERT INTO password_resets (email, token, expires_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (email) DO UPDATE SET token = $2, expires_at = $3;
    `;
    await db.query(query, [email, hashedToken, expiresAt]);
};

exports.findResetTokenByEmail = async (email) => {
    const query = 'SELECT * FROM password_resets WHERE email = $1;';
    const { rows } = await db.query(query, [email]);
    return rows[0];
};

exports.deleteResetToken = async (email) => {
    const query = 'DELETE FROM password_resets WHERE email = $1;';
    await db.query(query, [email]);
};