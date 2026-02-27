import type { Request, Response } from 'express';
import Feedback from '../models/Feedback.js';
import { analyzeFeedbackText } from '../services/llm.service.js';
import nodemailer from 'nodemailer';
const TARGET_EMAIL = "atking2240@gmail.com";
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});
export const createFeedback = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userName, userEmail, feedbackText } = req.body;
    const aiAnalysis = await analyzeFeedbackText(feedbackText);
    const feedback = new Feedback({
      userName,
      userEmail,
      feedbackText,
      category: aiAnalysis.category,
      priority: aiAnalysis.priority,
      sentiment: aiAnalysis.sentiment,
      team: aiAnalysis.team
    });
    await feedback.save();
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: TARGET_EMAIL,
      subject: `🚨 New Feedback from ${userName} [${aiAnalysis.priority}]`,
      html: `
        <h2>New Feedback Received</h2>
        <p><strong>User Name:</strong> ${userName}</p>
        <p><strong>User Email:</strong> ${userEmail}</p>
        <hr/>
        <p><strong>Feedback:</strong></p>
        <p>"${feedbackText}"</p>
        <hr/>
        <h3>AI Analysis</h3>
        <ul>
          <li><strong>Category:</strong> ${aiAnalysis.category}</li>
          <li><strong>Priority:</strong> ${aiAnalysis.priority}</li>
          <li><strong>Sentiment:</strong> ${aiAnalysis.sentiment}</li>
          <li><strong>Team:</strong> ${aiAnalysis.team}</li>
        </ul>
        <hr/>
        <small>Feedback ID: ${feedback._id}</small>
      `
    });

    res.status(201).json({
      success: true,
      data: feedback
    });

  } catch (error) {
    console.error("Create feedback error:", error);

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};

export const getFeedbacks = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, category, priority } = req.query;

    const query: any = {};

    if (search)
      query.userName = { $regex: search as string, $options: 'i' };

    if (category)
      query.category = { $regex: category as string, $options: 'i' };

    if (priority)
      query.priority = priority;

    const feedbacks = await Feedback
      .find(query)
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: feedbacks
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: 'Server Error'
    });
  }
};