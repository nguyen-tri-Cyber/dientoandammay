import app from "./src/app.js";
import sequelize from "./src/config/db.js";

const PORT = process.env.PORT || 5003;

const startServer = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ alter: true });
    console.log("✅ Finance DB synced");

    app.listen(PORT, () => console.log(`🚀 Finance Service running on port ${PORT}`));
  } catch (error) {
    console.error("Unable to start Finance Service:", error);
    process.exit(1);
  }
};

startServer();
