const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });


const app = require('./app');

// Agora, process.env.API_PORT estará disponível aqui.
const PORT = process.env.API_PORT || 3000;

app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando na porta http://localhost:${PORT}`);
});