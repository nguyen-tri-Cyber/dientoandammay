import express from 'express';
import workOrderRoutes from './routes/workOrderRoutes.js';

const app = express();
app.use(express.json());

app.use('/api/workorder', workOrderRoutes);

app.get('/', (req, res) => res.send('🧾 WorkOrder Service is running'));
app.get('/health', (req, res) => res.json({ status: 'ok' }));

export default app;
