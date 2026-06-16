import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import Avatar from './Avatar';

const roleLabel = { participant: 'participante', teacher: 'professor', admin: 'admin' };

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [rankingVisible, setRankingVisible] = useState(false);

  useEffect(() => {
    axios.get('/api/contest/config')
      .then(({ data }) => {
        setRankingVisible(data.config?.ranking_public || data.phase === 'closed');
      })
      .catch(() => setRankingVisible(false));
  }, []);

  function handleLogout() { logout(); navigate('/login'); }

  const canSeeRanking = ['admin', 'teacher'].includes(user?.role) || rankingVisible;

  const links = !user
    ? (canSeeRanking ? [{ to: '/ranking', label: 'Ranking' }] : [])
    : user.role === 'participant'
    ? [{ to: '/upload', label: 'Envios' }, ...(canSeeRanking ? [{ to: '/ranking', label: 'Ranking' }] : [])]
    : user.role === 'teacher'
    ? [{ to: '/teacher', label: 'Avaliação' }, { to: '/ranking', label: 'Ranking' }]
    : [{ to: '/admin', label: 'Admin' }, { to: '/ranking', label: 'Ranking' }];

  return (
    <header className="border-b border-line bg-base/90 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-6 h-12 flex items-center justify-between gap-6">

        <Link to="/login" className="font-display text-xl italic text-ink leading-none shrink-0" style={{ letterSpacing: '-0.02em' }}>
          FotoRank
        </Link>

        <nav className="flex items-center gap-0.5 flex-1">
          {links.map(({ to, label }) => (
            <Link
              key={to}
              to={to}
              className={`px-3 py-1.5 rounded-sm text-xs transition-colors duration-150 ${
                pathname === to ? 'text-ink bg-surface-raised' : 'text-ink-secondary hover:text-ink'
              }`}
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <>
              <Link
                to="/settings"
                className="flex items-center gap-2.5 px-2 py-1 rounded-sm transition-colors hover:bg-surface-raised group"
              >
                <Avatar name={user.name} avatar={user.avatar} size="sm" />
                <span className="hidden sm:block text-xs text-ink-secondary group-hover:text-ink transition-colors">
                  {user.name.split(' ')[0]}
                </span>
                <span className="chip-default hidden md:inline-flex">{roleLabel[user.role]}</span>
              </Link>
              <button onClick={handleLogout} className="btn-ghost text-2xs opacity-60 hover:opacity-100">
                sair
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="btn-ghost">entrar</Link>
              <Link to="/register" className="btn-primary">cadastrar</Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
