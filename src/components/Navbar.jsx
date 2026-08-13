import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Avatar from './Avatar';

const roleLabel = { participant: 'participante', teacher: 'professor', admin: 'admin' };

function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      title={isDark ? 'Ativar tema claro' : 'Ativar tema escuro'}
      className="w-8 h-8 flex items-center justify-center rounded-sm text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors shrink-0"
    >
      {isDark ? (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <line x1="12" y1="2" x2="12" y2="4" />
          <line x1="12" y1="20" x2="12" y2="22" />
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
          <line x1="2" y1="12" x2="4" y2="12" />
          <line x1="20" y1="12" x2="22" y2="12" />
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      ) : (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      )}
    </button>
  );
}

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
      <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between gap-6">

        {user ? (
          <span className="font-display text-3xl italic text-ink leading-none shrink-0 select-none" style={{ letterSpacing: '-0.02em' }}>
            Fotec
          </span>
        ) : (
          <Link to="/login" className="font-display text-3xl italic text-ink leading-none shrink-0" style={{ letterSpacing: '-0.02em' }}>
            Fotec
          </Link>
        )}

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
          <ThemeToggle />

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
