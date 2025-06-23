const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_DATABASE,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT,
});

pool.on('connect', () => {
    console.log('🐘 Conectado ao PostgreSQL com sucesso!');
});

// Exportamos um método 'query' para centralizar a comunicação com o banco.
module.exports = {
    query: (text, params) => pool.query(text, params),
};