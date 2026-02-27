import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createFeedback, getFeedbacks } from './controllers/feedback.controller.js';


dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

app.post('/api/feedbacks', createFeedback);
app.get('/api/feedbacks', getFeedbacks);

mongoose.connect(process.env.MONGODB_URI as string)
  .then(() => {
    console.log('✅ MongoDB Connected');
    app.listen(process.env.PORT || 5000, () => console.log(`🚀 Server running on port ${process.env.PORT || 5000}`));
  })
  .catch(err => console.error('MongoDB error:', err));