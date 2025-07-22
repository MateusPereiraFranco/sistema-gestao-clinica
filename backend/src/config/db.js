const { Pool } = require('pg');

let pool;
if (process.env.NODE_ENV === 'production') {
    // Em produção, usa a URL de conexão única (DB_URL)
    console.log('A conectar à base de dados de produção...');
    pool = new Pool({
        connectionString: process.env.DB_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });
} else {
    console.log('A conectar à base de dados de desenvolvimento local...');
    pool = new Pool({
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        database: process.env.DB_DATABASE,
    });
}

module.exports = {
    query: (text, params) => pool.query(text, params),
};
