import app from './src/app.js';
import sequelize from './src/config/db.js';

const PORT = process.env.PORT || 5006;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync();
    console.log('✅ Database connected for Vehicle Service.');

    app.listen(PORT, () => console.log(`🚀 Vehicle Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start Vehicle Service:', error);
    process.exit(1);
  }
};

startServer();
