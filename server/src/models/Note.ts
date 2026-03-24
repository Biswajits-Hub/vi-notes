import mongoose, { Schema } from 'mongoose';

const NoteSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, default: "" },
  keystrokeMetadata: [{
    duration: Number,        // Time key held down
    pause: Number,           // Time between key release and next key press
    timestamp: Date
  }],
  pasteEvents: [{
    length: Number,          // Amount of text pasted
    timestamp: { type: Date, default: Date.now }
  }],
  updatedAt: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Note', NoteSchema);
