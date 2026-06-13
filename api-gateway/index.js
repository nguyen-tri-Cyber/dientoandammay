import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import { createProxyMiddleware } from "http-proxy-middleware";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 8080;
const CHAT_SERVICE_ENABLED = process.env.CHAT_SERVICE_ENABLED === "true";

app.use(cors());
app.use(morgan("combined"));

const proxyTo = (serviceName, target, pathRewrite) =>
  createProxyMiddleware({
    target,
    changeOrigin: true,
    proxyTimeout: 30000,
    timeout: 30000,
    pathRewrite,
    logLevel: "warn",
    onError(err, req, res) {
      console.error(`[api-gateway] ${serviceName} proxy error: ${err.message}`);

      if (res.headersSent || res.writableEnded) {
        return;
      }

      res.writeHead(503, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          message: `${serviceName} service is unavailable`,
          service: serviceName,
          path: req.originalUrl,
        })
      );
    },
  });

// Mapping các service
app.use("/api/auth", proxyTo("auth", "http://auth-service:5001"));
app.use("/api/booking", proxyTo("booking", "http://booking-service:5002", { "^/api/booking": "/booking" }));
app.use(
  "/api/service-center",
  proxyTo("booking", "http://booking-service:5002", { "^/api/service-center": "/service-center" })
);

app.use("/api/finance", proxyTo("finance", "http://finance-service:5003"));
app.use("/api/invoice", proxyTo("finance", "http://finance-service:5003"));

app.use("/api/inventory", proxyTo("inventory", "http://inventory-service:5004"));

app.use("/api/notification", proxyTo("notification", "http://notification-service:5005"));
app.use("/api/vehicle", proxyTo("vehicle", "http://vehicle-service:5006"));

app.use("/api/workorder", proxyTo("workorder", "http://workorder-service:5007"));

if (CHAT_SERVICE_ENABLED) {
  app.use("/api/chat", proxyTo("chat", "http://chat-service:5008"));
} else {
  app.use("/api/chat", (req, res) => {
    res.status(503).json({
      message: "Chat service is disabled in this deployment",
      service: "chat",
      path: req.originalUrl,
    });
  });
}

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api", (req, res) => {
  res.status(404).json({
    message: "API route not found",
    path: req.originalUrl,
  });
});

app.listen(PORT, () => console.log(`🚀 API Gateway running on port ${PORT}`));
