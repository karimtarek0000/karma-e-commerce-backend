import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import initialProject from './src/initial/index.js';

// Environment
config();

// Express
const app = express();

// Cors
// TODO: will remove it just development
const corsOptions = {
  origin: 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Middleware for body parsing
app.use(express.json());

initialProject(app);
