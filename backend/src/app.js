const express = require('express');
const cors = require('cors');

const errorHandler = require('./middlewares/errorMiddleware');
const authRoutes = require('./api/auth/authRoutes');
const patientRoutes = require('./api/patients/patientsRoutes');
const userRoutes = require('./api/users/usersRoutes');
const appointmentRoutes = require('./api/appointments/appointmentsRoutes');
const specialtyRoutes = require('./api/specialties/specialtiesRoutes'); // <-- Importar
const reportsRoutes = require('./api/reports/reportsRoutes');
const unitsRoutes = require('./api/units/unitsRoutes'); // <-- Importar unidades

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.status(200).json({ status: 'UP' }));

app.use('/api/auth', authRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/users', userRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/specialties', specialtyRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/units', unitsRoutes)

app.use(errorHandler);

module.exports = app;