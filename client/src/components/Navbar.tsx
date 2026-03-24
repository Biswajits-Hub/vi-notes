import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, PenLine } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar glass-card">
      <div className="title-gradient">Vi-Notes</div>
      <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
        {user ? (
          <>
            <span style={{ fontSize: '0.9rem', color: '#999' }}>{user.email}</span>
            <Link to="/history" className="btn" style={{ color: '#aaa', gap: '8px' }}>
                History
            </Link>
            <Link to="/" className="btn btn-primary" style={{ gap: '8px' }} onClick={() => {
              // Ensure we start a fresh note
              window.location.href = '/'; 
            }}>
                <PenLine size={18} /> New Note
            </Link>
            <button onClick={handleLogout} className="btn" style={{ color: '#ef4444', gap: '8px' }}>
                <LogOut size={18} /> Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="btn" style={{ color: 'white' }}>Login</Link>
            <Link to="/register" className="btn btn-primary">Sign Up</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
