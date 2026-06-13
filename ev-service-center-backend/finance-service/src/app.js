import express from "express";
import bodyParser from "body-parser";
import invoiceRoutes from "./routes/invoiceRoutes.js";

const app = express();
app.use(bodyParser.json());

app.use("/api/finance", invoiceRoutes);
app.use("/api/invoice", invoiceRoutes);

export default app;
