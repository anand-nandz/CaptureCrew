import dotenv from 'dotenv';
dotenv.config(); 

export const corsOption = {
  origin: process.env.FRONTEND_URL ? 
    [process.env.FRONTEND_URL, 'http://localhost:5173'] : 
    ['http://localhost:5173'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  credentials: true,
  maxAge: 86400 // Cache preflight requests for 24 hours
};