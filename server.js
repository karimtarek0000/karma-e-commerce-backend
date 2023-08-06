import express from "express";
import { config } from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import { dbConnection } from "./DB/connection.js";

// Routes
import usersRoutes from "./src/modules/users/users.routes.js";

// Environment
config();

// Initialize Express
const app = express();

app.use(cors());

// Middleware for body parsing
app.use(express.json());

// Middleware for cookies
app.use(cookieParser());

// Database connection
dbConnection();

// API's
app.use("/users", usersRoutes);

// 404 ( Not Found )
app.use("*", (_, res) => res.status(404).json({ message: "This route not found" }));

// Apply Error
app.use((err, req, res, next) => {
  if (err) return res.status(err["cause"] || 400).json({ message: err.message });
});

// Server connection
app.listen(3000, () => {
  console.log("Server listening on port 3000");
});
