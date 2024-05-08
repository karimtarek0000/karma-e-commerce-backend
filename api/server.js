import cors from 'cors';
import { config } from 'dotenv';
import express from 'express';
import initialProject from '../src/initial/index.js';

// Environment
config();

// Express
const app = express();

// Cors
// const corsOptions = {
//   origin: process.env.CLIENT_URL,
//   credentials: true,
//   optionsSuccessStatus: 200,
// };

const corsOptions = {
  origin: "https://karma-e-commerce-mla4az8ux-karimtarek0000s-projects.vercel.app/",
  credentials: true,
  optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Middleware for body parsing
app.use(express.json());

initialProject(app);
