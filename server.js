import cors from "cors";
import { config } from "dotenv";
import express from "express";
import { initialProject } from "./src/initial/index.js";

// Environment
config();

// Express
const app = express();

// Cors
app.use(cors());

// Middleware for body parsing
app.use(express.json());

initialProject(app);
