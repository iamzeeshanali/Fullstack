// config/db.js
import { config } from 'dotenv';
import { Sequelize } from 'sequelize';

config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false, // Disable SQL query logging (optional)
  }
);

export default sequelize;