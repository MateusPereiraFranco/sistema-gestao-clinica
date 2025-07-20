const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

const app = require('./app');

const PORT = process.env.API_PORT || 3000;

app.listen(PORT, () => {
});