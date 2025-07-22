const { Pool } = require('pg');

let pool;

if (process.env.NODE_ENV === 'production') {
    pool = new Pool({
        connectionString: process.env.DB_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    pool.on('connect', (client) => {
        client.query("SET TIME ZONE 'America/Sao_Paulo'");
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
