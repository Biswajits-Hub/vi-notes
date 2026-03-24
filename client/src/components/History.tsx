import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Calendar, Trash2, ChevronRight, Hash, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';

const History = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSessions = async () => {
    try {
      const resp = await axios.get('http://localhost:5000/api/notes', {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      setSessions(resp.data);
    } catch (err) {
      console.error('Fetch sessions error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);

  const deleteSession = async (id: string) => {
    if (!window.confirm('Delete this session? Behavioral signals will be lost.')) return;
    try {
      console.log('Attempting to delete session:', id);
      const resp = await axios.delete(`http://localhost:5000/api/notes/${id}`, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
      console.log('Delete response:', resp.data);
      setSessions(prev => prev.filter(s => s._id !== id));
    } catch (err: any) {
      console.error('Delete error details:', err.response?.data || err.message);
      alert('Failed to delete session: ' + (err.response?.data?.message || err.message));
    }
  };

  if (loading) return <div className="editor-container">Loading your writing history...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="editor-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h2 style={{ fontWeight: 500, color: '#e0e0e0' }}>Writing Sessions</h2>
        <Link to="/" className="btn btn-primary" onClick={() => localStorage.removeItem('currentNoteId')}>Start New Session</Link>
      </div>

      <div style={{ display: 'grid', gap: '15px' }}>
        {sessions.length === 0 ? (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
            No sessions found. Start writing to capture behavioral signals.
          </div>
        ) : (
          sessions.map(session => (
            <div key={session._id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '1.1rem', marginBottom: '8px', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Calendar size={16} color="var(--primary)" />
                  {new Date(session.createdAt).toLocaleDateString()} at {new Date(session.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div style={{ display: 'flex', gap: '15px', fontSize: '0.85rem', color: '#999' }}>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Hash size={14} color="#6d5dfc" /> {session.content ? session.content.slice(0, 30) + '...' : 'Empty session'}
                   </span>
                   <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} color="#4ade80" /> {session.keystrokeMetadata?.length || 0} signals
                   </span>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '10px' }}>
                <Link to={`/edit/${session._id}`} className="btn" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff' }}>
                  <ChevronRight size={18} /> View
                </Link>
                <button onClick={() => deleteSession(session._id)} className="btn" style={{ color: 'var(--danger)' }}>
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </motion.div>
  );
};

export default History;
