import { Schema, model } from 'mongoose';

const userSchema = new Schema({
<<<<<<< HEAD
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true, lowercase: true, unique: true },
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  fitnessGoal: { type: String, required: true, trim: true },
=======
  name: String,
  email: String,
  team: { type: Schema.Types.ObjectId, ref: 'Team' },
  fitnessGoal: String,
>>>>>>> origin/main
});

export const User = model('User', userSchema);
