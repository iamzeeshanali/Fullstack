// app.js
import dotenv from 'dotenv';
import express from 'express';
import sequelize from './config/database.mjs';

import authRoutes from './routes/authRoutes.mjs';

dotenv.config();

const app = express();

app.use(express.json()); // for parsing application/json

// Routes
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;
sequelize.sync({ force: false }).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch((error) => {
  console.error('Failed to connect to the database:', error.message);
});