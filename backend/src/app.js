const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const hpp = require("hpp");
const { generalApiLimiter } = require("./config/rateLimiter");

const errorHandler = require("./middlewares/errorMiddleware");
const authRoutes = require("./api/auth/authRoutes");
const patientRoutes = require("./api/patients/patientsRoutes");
const userRoutes = require("./api/users/usersRoutes");
const appointmentRoutes = require("./api/appointments/appointmentsRoutes");
const specialtyRoutes = require("./api/specialties/specialtiesRoutes");
const reportsRoutes = require("./api/reports/reportsRoutes");
const unitsRoutes = require("./api/units/unitsRoutes");

const app = express();

app.use(helmet());

app.use("/api", generalApiLimiter);

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use(hpp());

const allowedOrigin = process.env.FRONTEND_URL || "http://localhost:3000";

const corsOptions = {
  origin: allowedOrigin,
};

app.use(cors(corsOptions));

app.get("/api/health", (req, res) => res.status(200).json({ status: "UP" }));

app.use("/api/auth", authRoutes);
app.use("/api/patients", patientRoutes);
app.use("/api/users", userRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/specialties", specialtyRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/units", unitsRoutes);

app.use(errorHandler);

module.exports = app;
