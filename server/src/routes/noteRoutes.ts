import express, { Response } from 'express';
import mongoose from 'mongoose';
import Note from '../models/Note';
import { AuthRequest, authenticateToken } from '../middleware/authMiddleware';

const router = express.Router();

const isValidObjectId = (id: string) => mongoose.Types.ObjectId.isValid(id);

// Get the user's notes
router.get('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const notes = await Note.find({ userId: req.userId }).sort({ updatedAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes' });
  }
});

// Create/Update a note
router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { content, id, keystrokeMetadata, pasteEvents } = req.body;
  try {
    if (id) {
        const updated = await Note.findOneAndUpdate(
            { _id: id, userId: req.userId },
            { 
              content, 
              keystrokeMetadata, 
              pasteEvents, 
              updatedAt: Date.now() 
            },
            { returnDocument: 'after' }
        );
        res.json(updated);
    } else {
        const newNote = new Note({ 
          userId: req.userId, 
          content, 
          keystrokeMetadata, 
          pasteEvents 
        });
        await newNote.save();
        res.status(201).json(newNote);
    }
  } catch (error) {
    res.status(500).json({ message: 'Error saving note' });
  }
});

router.get('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id as string)) return res.status(400).json({ message: 'Invalid ID format' });
  try {
    const note = await Note.findOne({ _id: id as string, userId: req.userId });
    if (!note) return res.status(404).json({ message: 'Note not found' });
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching note' });
  }
});

// Delete a note
router.delete('/:id', authenticateToken, async (req: AuthRequest, res: Response) => {
  const { id } = req.params;
  if (!isValidObjectId(id as string)) return res.status(400).json({ message: 'Invalid ID format' });
  console.log('Delete request for ID:', id, 'User:', req.userId);
  try {
    const deleted = await Note.findOneAndDelete({ _id: id as string, userId: req.userId });
    if (!deleted) return res.status(404).json({ message: 'Note not found' });
    res.json({ message: 'Note deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note' });
  }
});

export default router;
