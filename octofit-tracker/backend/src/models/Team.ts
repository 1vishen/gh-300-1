import { Schema, model } from 'mongoose';

const teamSchema = new Schema({
<<<<<<< HEAD
  name: { type: String, required: true, trim: true },
  mascot: { type: String, required: true, trim: true },
  members: { type: [{ type: Schema.Types.ObjectId, ref: 'User' }], default: [] },
=======
  name: String,
  mascot: String,
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
>>>>>>> origin/main
});

export const Team = model('Team', teamSchema);
