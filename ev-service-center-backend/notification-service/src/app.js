import express from 'express';
import sequelize from './config/db.js';
import notificationRoutes from './routes/notificationRoutes.js';

const app = express();
app.use(express.json());

// Prefix /api/notification khớp với BASE_URL = 'http://localhost:8080/api' trong codecept.conf.js
app.use('/api/notification', notificationRoutes);

app.get('/', (req, res) => res.send('🔔 Notification Service is running'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

(async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('✅ Database connected for Notification Service.');
  } catch (err) {
    console.error('❌ Database connection failed:', err);
  }
})();

export default app;
