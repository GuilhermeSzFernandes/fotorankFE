import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import Avatar from '../components/Avatar';

function ThemeCard({ mode, label, current, onSelect }) {
  const selected = current === mode;
  const isDark = mode === 'dark';

  return (
    <button
      onClick={() => onSelect(mode)}
      className={`relative flex-1 rounded-lg border-2 overflow-hidden transition-all duration-200 cursor-pointer text-left ${
        selected ? 'border-ink' : 'border-line hover:border-line-strong'
      }`}
    >
      {/* Mini preview */}
      <div className={`w-full h-24 p-3 ${isDark ? 'bg-[#080808]' : 'bg-[#F7F7F5]'}`}>
        <div className={`h-1.5 w-16 rounded-full mb-2 ${isDark ? 'bg-[#E8E8E8]/20' : 'bg-[#1A1A1A]/15'}`} />
        <div className={`h-1 w-10 rounded-full mb-3 ${isDark ? 'bg-[#E8E8E8]/10' : 'bg-[#1A1A1A]/08'}`} />
        <div className={`inline-block px-2 py-1 rounded text-[8px] font-medium ${
          isDark ? 'bg-[#E8E8E8] text-[#080808]' : 'bg-[#1A1A1A] text-[#F7F7F5]'
        }`}>
          Aa
        </div>
      </div>

      <div className={`px-3 py-2.5 flex items-center justify-between ${isDark ? 'bg-[#111]' : 'bg-white'} border-t ${isDark ? 'border-[#1E1E1E]' : 'border-[#E5E5E2]'}`}>
        <span className={`text-xs font-medium ${isDark ? 'text-[#E8E8E8]' : 'text-[#1A1A1A]'}`}>{label}</span>
        {selected && (
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="6" fill={isDark ? '#E8E8E8' : '#1A1A1A'} />
            <path d="M3.5 6l1.8 1.8L8.5 4.5" stroke={isDark ? '#080808' : '#F7F7F5'} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
    </button>
  );
}

export default function Settings() {
  const { user, updateUser } = useAuth();
  const { theme, setTheme } = useTheme();
  const [tab, setTab] = useState('profile');

  // Profile state
  const [name, setName] = useState(user?.name || '');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileMsg, setProfileMsg] = useState('');
  const [profileError, setProfileError] = useState('');
  const avatarRef = useRef();

  // Security state
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState('');
  const [pwError, setPwError] = useState('');

  useEffect(() => { setName(user?.name || ''); }, [user]);

  async function handleAvatarChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setProfileError('Apenas imagens JPG ou PNG são aceitas.');
      return;
    }
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await axios.post('/api/profile/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      updateUser({ avatar: data.avatar });
    } catch {
      setProfileError('Erro ao enviar avatar.');
    } finally {
      avatarRef.current.value = '';
    }
  }

  async function handleProfileSave(e) {
    e.preventDefault();
    setProfileMsg('');
    setProfileError('');
    setProfileLoading(true);
    try {
      const { data } = await axios.put('/api/profile', { name });
      updateUser({ name: data.name });
      setProfileMsg('Perfil atualizado.');
    } catch (err) {
      setProfileError(err.response?.data?.message || 'Erro ao salvar.');
    } finally {
      setProfileLoading(false);
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault();
    setPwMsg('');
    setPwError('');
    if (pwForm.next !== pwForm.confirm) return setPwError('As senhas não coincidem.');
    setPwLoading(true);
    try {
      await axios.post('/api/profile/change-password', {
        currentPassword: pwForm.current,
        newPassword: pwForm.next,
      });
      setPwMsg('Senha alterada com sucesso.');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) {
      setPwError(err.response?.data?.message || 'Erro ao alterar senha.');
    } finally {
      setPwLoading(false);
    }
  }

  const TABS = [['profile', 'Perfil'], ['appearance', 'Aparência'], ['security', 'Segurança']];

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <div className="mb-12">
        <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4 enter-1">Conta</p>
        <h1 className="font-display text-5xl italic text-ink leading-none enter-2" style={{ letterSpacing: '-0.02em' }}>
          Configurações
        </h1>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-0 border-b border-line mb-10 enter-3">
        {TABS.map(([v, l]) => (
          <button
            key={v}
            onClick={() => setTab(v)}
            className={`px-4 py-3 text-xs border-b-2 -mb-px transition-colors duration-150 ${
              tab === v ? 'border-ink text-ink' : 'border-transparent text-ink-secondary hover:text-ink'
            }`}
          >
            {l}
          </button>
        ))}
      </div>

      {/* ── PROFILE ── */}
      {tab === 'profile' && (
        <div className="enter-1">
          {/* Avatar */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-line">
            <div className="relative group">
              <Avatar name={user?.name} avatar={user?.avatar} size="2xl" />
              <label className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center
                               opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="13" r="4" />
                </svg>
                <input ref={avatarRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleAvatarChange} />
              </label>
            </div>
            <div>
              <p className="text-sm font-medium text-ink">{user?.name}</p>
              <p className="text-xs text-ink-secondary mt-0.5">{user?.email}</p>
              <p className="text-2xs text-ink-muted font-mono mt-2">Clique na foto para alterar · JPG, PNG · máx. 5 MB</p>
            </div>
          </div>

          {/* Name form */}
          {(profileMsg || profileError) && (
            <div className={`text-xs mb-5 px-3 py-2.5 border rounded-sm ${
              profileError
                ? 'text-danger border-danger-border bg-danger-bg'
                : 'text-success border-success-border bg-success-bg'
            }`}>
              {profileMsg || profileError}
            </div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="flabel">Nome</label>
              <input
                type="text"
                className="field"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="flabel">E-mail</label>
              <input type="email" className="field opacity-50 cursor-not-allowed" value={user?.email} readOnly />
              <p className="text-2xs text-ink-muted mt-1.5">O e-mail não pode ser alterado.</p>
            </div>
            <button type="submit" className="btn-primary" disabled={profileLoading}>
              {profileLoading ? 'Salvando…' : 'Salvar alterações'}
            </button>
          </form>
        </div>
      )}

      {/* ── APPEARANCE ── */}
      {tab === 'appearance' && (
        <div className="enter-1">
          <p className="text-xs text-ink-secondary mb-6">
            Escolha o tema da interface. A preferência é salva localmente.
          </p>
          <div className="flex gap-4">
            <ThemeCard mode="dark"  label="Escuro" current={theme} onSelect={setTheme} />
            <ThemeCard mode="light" label="Claro"  current={theme} onSelect={setTheme} />
          </div>
        </div>
      )}

      {/* ── SECURITY ── */}
      {tab === 'security' && (
        <div className="enter-1">
          <p className="text-xs text-ink-secondary mb-6">Altere a senha da sua conta.</p>

          {(pwMsg || pwError) && (
            <div className={`text-xs mb-5 px-3 py-2.5 border rounded-sm ${
              pwError
                ? 'text-danger border-danger-border bg-danger-bg'
                : 'text-success border-success-border bg-success-bg'
            }`}>
              {pwMsg || pwError}
            </div>
          )}

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="flabel">Senha atual</label>
              <input type="password" className="field" placeholder="••••••••"
                value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} required />
            </div>
            <div>
              <label className="flabel">Nova senha</label>
              <input type="password" className="field" placeholder="Mínimo 6 caracteres"
                value={pwForm.next} onChange={(e) => setPwForm({ ...pwForm, next: e.target.value })} required />
            </div>
            <div>
              <label className="flabel">Confirmar nova senha</label>
              <input type="password" className="field" placeholder="Repita a nova senha"
                value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary" disabled={pwLoading}>
              {pwLoading ? 'Alterando…' : 'Alterar senha'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
