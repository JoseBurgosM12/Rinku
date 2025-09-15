require('dotenv').config();
const app = require('./app.js');
const { sequelize } = require('./models');

const PORT = process.env.BACKEND_PORT || 4000;

(async () => {
  try {
    await sequelize.authenticate();
    console.log('✅ Conexión a Postgres OK');
    app.listen(PORT, () => console.log(`API escuchando en http://localhost:${PORT}`));
  } catch (err) {
    console.error('❌ Error de conexión a DB:', err);
    process.exit(1);
  }
})();
