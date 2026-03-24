import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Check, Clipboard, Clock } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';

const Editor = () => {
  const { user } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [content, setContent] = useState('');
  const [noteId, setNoteId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Behavioral Metadata State
  const [keystrokes, setKeystrokes] = useState<any[]>([]);
  const [pastes, setPastes] = useState<any[]>([]);
  const keyMap = React.useRef<Map<string, number>>(new Map());
  const [lastKeyUpTime, setLastKeyUpTime] = useState<number | null>(null);

  useEffect(() => {
    const fetchNote = async () => {
      try {
        if (id) {
          const resp = await axios.get(`http://localhost:5000/api/notes/${id}`, {
            headers: { Authorization: `Bearer ${user.token}` }
          });
          const note = resp.data;
          setContent(note.content);
          setNoteId(note._id);
          setKeystrokes(note.keystrokeMetadata || []);
          setPastes(note.pasteEvents || []);
        } else {
            // New note - clear everything
            setContent('');
            setNoteId(null);
            setKeystrokes([]);
            setPastes([]);
            setLastSaved(null);
            keyMap.current.clear();
        }
      } catch (err) {
        console.error('Fetch error:', err);
      }
    };
    if (user) fetchNote();
  }, [user, id]);

  const saveNote = async () => {
    setSaving(true);
    try {
      const resp = await axios.post('http://localhost:5000/api/notes', 
        { 
          content, 
          id: noteId,
          keystrokeMetadata: keystrokes,
          pasteEvents: pastes
        },
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (!noteId) {
          const newId = resp.data._id;
          setNoteId(newId);
          navigate(`/edit/${newId}`, { replace: true });
      }
      setLastSaved(new Date());
    } catch (err) {
      console.error('Save error:', err);
    } finally {
      setSaving(false);
    }
  };

  // Auto-save debounced
  useEffect(() => {
    const timer = setTimeout(() => {
        if (user && (content || keystrokes.length > 0)) saveNote();
    }, 3000);
    return () => clearTimeout(timer);
  }, [content, keystrokes, pastes]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.repeat) return;
    // We use e.code for the internal map to track keys, but don't save the character
    keyMap.current.set(e.code, Date.now());
  };

  const handleKeyUp = (e: React.KeyboardEvent) => {
    const now = Date.now();
    const startTime = keyMap.current.get(e.code);
    
    if (startTime) {
      const duration = now - startTime;
      const pause = lastKeyUpTime ? startTime - lastKeyUpTime : 0;
      
      // Basic timing information without recording characters
      setKeystrokes(prev => [...prev, { duration, pause, timestamp: new Date(now) }]);
      setLastKeyUpTime(now);
      keyMap.current.delete(e.code);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text');
    // Record paste event and amount of text pasted
    setPastes(prev => [...prev, { length: text.length, timestamp: new Date() }]);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="editor-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
        <h3 style={{ fontWeight: 400, color: '#888' }}>Capture your thoughts...</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.8rem', color: '#555' }}>
            {saving ? <span>Saving...</span> : lastSaved && <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Check size={14} color="var(--accent)" /> Saved {lastSaved.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>}
        </div>
      </div>
      <textarea
        className="text-editor glass-card"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onPaste={handlePaste}
        placeholder="Start typing..."
        spellCheck="false"
      />
      <div style={{ fontSize: '0.7rem', color: '#666', marginTop: '10px', display: 'flex', gap: '20px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clock size={12} /> {keystrokes.length} Keystroke timing signals</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}><Clipboard size={12} /> {pastes.length} Pasted events</span>
      </div>
    </motion.div>
  );
};

export default Editor;
