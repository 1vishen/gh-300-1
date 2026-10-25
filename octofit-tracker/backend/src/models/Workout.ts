import { Schema, model } from 'mongoose';

const workoutSchema = new Schema({
<<<<<<< HEAD
  title: { type: String, required: true, trim: true },
  focus: { type: String, required: true, trim: true },
  minutes: { type: Number, required: true, min: 1 },
  difficulty: { type: String, required: true, trim: true },
=======
  title: String,
  focus: String,
  minutes: Number,
  difficulty: String,
>>>>>>> origin/main
});

export const Workout = model('Workout', workoutSchema);
