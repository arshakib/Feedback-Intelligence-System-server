import mongoose, { Schema, Document } from 'mongoose';

export interface IFeedback extends Document {
  userName: string;
  userEmail: string;
  feedbackText: string;
  category: string;
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  team: string;
  createdAt: Date;
}

const feedbackSchema = new Schema<IFeedback>({
  userName: { type: String, required: true },
  userEmail: { type: String, required: true },
  feedbackText: { type: String, required: true },
  category: { type: String, required: true },
  priority: { type: String, required: true, enum: ['Low', 'Medium', 'High', 'Critical'] },
  sentiment: { type: String, required: true, enum: ['Positive', 'Neutral', 'Negative'] },
  team: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model<IFeedback>('Feedback', feedbackSchema);