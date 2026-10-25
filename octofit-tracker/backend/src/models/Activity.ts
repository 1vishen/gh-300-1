import { Schema, model } from 'mongoose';

const activitySchema = new Schema({
<<<<<<< HEAD
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team', required: true },
  type: { type: String, required: true, trim: true },
  minutes: { type: Number, required: true, min: 1 },
  points: { type: Number, required: true, min: 0 },
  occurredAt: { type: Date, required: true },
=======
  user: { type: Schema.Types.ObjectId, ref: 'User' },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  type: String,
  minutes: Number,
  points: Number,
  occurredAt: Date,
>>>>>>> origin/main
});

export const Activity = model('Activity', activitySchema);
