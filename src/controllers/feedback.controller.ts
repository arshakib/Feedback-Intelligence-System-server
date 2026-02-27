import type { Request, Response } from 'express';
import Feedback from '../models/Feedback.js';
import { analyzeFeedbackText } from '../services/llm.service.js';
import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

export const createFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName, userEmail, feedbackText, targetTeamEmail } = req.body;
    const aiAnalysis = await analyzeFeedbackText(feedbackText);
    const feedback = new Feedback({
      userName, userEmail, feedbackText, ...aiAnalysis
    });
    await feedback.save();
    if (targetTeamEmail) {
      transporter.sendMail({
        from: process.env.SMTP_USER,
        to: targetTeamEmail,
        subject: `🚨 [${aiAnalysis.priority}] New Feedback routed to ${aiAnalysis.team}`,
        html: `
          <h3>New Feedback from ${userName}</h3>
          <p><strong>Message:</strong> "${feedbackText}"</p>
          <ul>
            <li><strong>Category:</strong> ${aiAnalysis.category}</li>
            <li><strong>Sentiment:</strong> ${aiAnalysis.sentiment}</li>
            <li><strong>Team:</strong> ${aiAnalysis.team}</li>
          </ul>
        `
      }).catch(console.error);
    }

    res.status(201).json({ success: true, data: feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

export const getFeedbacks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, priority } = req.query;
    const query: any = {};

    if (search) query.userName = { $regex: search as string, $options: 'i' };
    if (category) query.category = { $regex: category as string, $options: 'i' };
    if (priority) query.priority = priority;

    const feedbacks = await Feedback.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: feedbacks });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};