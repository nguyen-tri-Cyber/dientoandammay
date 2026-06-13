import express from 'express';
import vehicleRoutes from './routes/vehicleRoutes.js';

const app = express();
app.use(express.json());
app.use('/api/vehicle', vehicleRoutes);

app.get('/', (req, res) => res.send('🚗 Vehicle Service is running'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

export default app;
