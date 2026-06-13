import app from './src/app.js';
import sequelize from './src/config/db.js';
import ServiceCenter from './src/models/serviceCenter.js';

const PORT = process.env.PORT || 5002;

const seedDefaultServiceCenter = async () => {
  await ServiceCenter.findOrCreate({
    where: { id: 1 },
    defaults: {
      name: 'TEST',
      address: 'HCM',
      phone: '0123456789',
      managerId: 1
    }
  });
};

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    await seedDefaultServiceCenter();
    app.listen(PORT, () => console.log(`🚀 Booking Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start Booking Service:', error);
    process.exit(1);
  }
};

startServer();
