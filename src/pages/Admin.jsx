import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import Avatar from '../components/Avatar';

const USERS_PER_PAGE = 10;

function KPI({ label, value, note, delay = 0 }) {
  return (
    <div className="panel-sm" style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${delay}ms both` }}>
      <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4">{label}</p>
      <p className="font-display text-5xl italic text-ink leading-none" style={{ letterSpacing: '-0.03em' }}>
        {value ?? '—'}
      </p>
      {note && <p className="text-2xs text-ink-muted font-mono mt-3">{note}</p>}
    </div>
  );
}

const ROLE_LABEL = { admin: 'Admin', teacher: 'Professor', participant: 'Participante' };
const ROLE_CHIP  = { admin: 'chip-red', teacher: 'chip-green', participant: 'chip-default' };

// ── Dropdown de 3 pontos ───────────────────────────────────────────────────────
function UserMenu({ user, onRoleChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef();

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (!ref.current?.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  if (user.role === 'admin') return null;

  const toTeacher     = user.role === 'participant';
  const toParticipant = user.role === 'teacher';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 flex items-center justify-center rounded-sm text-ink-muted hover:text-ink hover:bg-surface-raised transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5"  r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-8 z-20 min-w-[180px] bg-surface border border-line rounded-sm shadow-lg py-1">
          {toTeacher && (
            <button
              onClick={() => { setOpen(false); onRoleChange(user.id, 'teacher'); }}
              className="w-full text-left px-4 py-2.5 text-xs text-ink hover:bg-surface-raised transition-colors"
            >
              Tornar Professor
            </button>
          )}
          {toParticipant && (
            <button
              onClick={() => { setOpen(false); onRoleChange(user.id, 'participant'); }}
              className="w-full text-left px-4 py-2.5 text-xs text-ink hover:bg-surface-raised transition-colors"
            >
              Tornar Participante
            </button>
          )}
        </div>
      )}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState('metrics');
  const [metrics, setMetrics] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [usersPage, setUsersPage] = useState(0);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const [m, t, u] = await Promise.all([
      axios.get('/api/admin/metrics').then((r) => r.data),
      axios.get('/api/admin/teachers').then((r) => r.data),
      axios.get('/api/admin/users').then((r) => r.data),
    ]);
    setMetrics(m);
    setTeachers(t);
    setUsers(u);
  }

  useEffect(() => { load(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      await axios.post('/api/admin/teachers', form);
      setSuccess('Professor criado com sucesso.');
      setForm({ name: '', email: '', password: '' });
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao criar professor.');
    }
  }

  async function handleDelete(id) {
    if (!confirm('Remover este professor?')) return;
    await axios.delete(`/api/admin/teachers/${id}`);
    load();
  }

  async function handleRoleChange(userId, role) {
    setError('');
    setSuccess('');
    try {
      await axios.patch(`/api/admin/users/${userId}/role`, { role });
      setSuccess(`Papel atualizado para ${ROLE_LABEL[role]}.`);
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar papel.');
    }
  }

  const usersTotalPages = Math.ceil(users.length / USERS_PER_PAGE);
  const usersPage_      = Math.min(usersPage, Math.max(0, usersTotalPages - 1));
  const usersVisible    = users.slice(usersPage_ * USERS_PER_PAGE, (usersPage_ + 1) * USERS_PER_PAGE);

  const TABS = [['metrics', 'Métricas'], ['teachers', 'Professores'], ['users', 'Usuários']];

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="mb-12">
        <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4 enter-1">Sistema</p>
        <h1 className="font-display text-5xl italic text-ink leading-none enter-2" style={{ letterSpacing: '-0.02em' }}>
          Administração
        </h1>
      </div>

      <div className="flex items-center gap-0 border-b border-line mb-10 enter-3">
        {TABS.map(([v, l]) => (
          <button key={v} onClick={() => { setTab(v); setError(''); setSuccess(''); }}
            className={`px-4 py-3 text-xs border-b-2 -mb-px transition-colors duration-150 ${
              tab === v ? 'border-ink text-ink' : 'border-transparent text-ink-secondary hover:text-ink'
            }`}>
            {l}
          </button>
        ))}
      </div>

      {(error || success) && (
        <div className={`text-xs mb-8 px-3 py-2.5 border rounded-sm enter-1 ${
          error ? 'text-red-400/80 border-red-900/30 bg-red-900/5'
                : 'text-green-500/80 border-green-900/30 bg-green-900/5'
        }`}>
          {error || success}
        </div>
      )}

      {tab === 'metrics' && metrics && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <KPI label="Participantes" value={metrics.totalParticipants} delay={0} />
            <KPI label="Professores"   value={metrics.totalTeachers}     delay={60} />
            <KPI label="Fotos"         value={metrics.totalPhotos}       delay={120} />
            <KPI label="Nota média"    value={metrics.avgGrade !== null ? metrics.avgGrade.toFixed(1) : '—'} note="média geral / 10" delay={180} />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <KPI label="Total de notas"  value={metrics.totalGrades}   delay={240} />
            <KPI label="Fotos avaliadas" value={metrics.gradedPhotos}  delay={300} />
            <KPI label="Sem avaliação"   value={metrics.ungradedPhotos} delay={360} />
          </div>
        </div>
      )}

      {tab === 'teachers' && (
        <div className="space-y-6 enter-1">
          <div className="panel">
            <h2 className="text-xs font-medium text-ink mb-6 uppercase tracking-wider">Adicionar professor</h2>
            <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="flabel">Nome</label>
                <input className="field" placeholder="Nome completo" value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })} required />
              </div>
              <div>
                <label className="flabel">E-mail</label>
                <input type="email" className="field" placeholder="email@escola.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>
              <div>
                <label className="flabel">Senha</label>
                <input type="password" className="field" placeholder="Senha de acesso" value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })} required />
              </div>
              <div className="md:col-span-3 mt-1">
                <button type="submit" className="btn-primary">Criar professor</button>
              </div>
            </form>
          </div>

          <div className="panel">
            <h2 className="text-xs font-medium text-ink mb-6 uppercase tracking-wider">
              Professores <span className="font-mono text-ink-muted font-normal">({teachers.length})</span>
            </h2>
            {teachers.length === 0 ? (
              <p className="text-xs text-ink-muted font-mono">— nenhum professor cadastrado —</p>
            ) : (
              <div>
                {teachers.map((t, i) => (
                  <div key={t.id} className="flex items-center justify-between py-4 border-b border-line last:border-0"
                    style={{ animation: `fadeUp 0.35s ease ${i * 40}ms both` }}>
                    <div className="flex items-center gap-3">
                      <Avatar name={t.name} avatar={t.avatar} size="md" />
                      <div>
                        <p className="text-sm text-ink">{t.name}</p>
                        <p className="text-2xs text-ink-muted font-mono mt-0.5">{t.email}</p>
                      </div>
                    </div>
                    <button onClick={() => handleDelete(t.id)} className="btn-danger">Remover</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === 'users' && (
        <div className="panel enter-1">
          <h2 className="text-xs font-medium text-ink mb-6 uppercase tracking-wider">
            Todos os usuários <span className="font-mono text-ink-muted font-normal">({users.length})</span>
          </h2>

          <div>
            {usersVisible.map((u, i) => (
              <div key={u.id} className="flex items-center justify-between py-4 border-b border-line last:border-0"
                style={{ animation: `fadeUp 0.35s ease ${i * 30}ms both` }}>
                <div className="flex items-center gap-3 min-w-0 mr-4">
                  <Avatar name={u.name} avatar={u.avatar} size="md" />
                  <div className="min-w-0">
                    <p className="text-sm text-ink truncate">{u.name}</p>
                    <p className="text-2xs text-ink-muted font-mono mt-0.5 truncate">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className={`chip ${ROLE_CHIP[u.role]}`}>{ROLE_LABEL[u.role]}</span>
                  <span className="text-2xs text-ink-muted font-mono hidden sm:block">
                    {new Date(u.createdAt).toLocaleDateString('pt-BR')}
                  </span>
                  <UserMenu user={u} onRoleChange={handleRoleChange} />
                </div>
              </div>
            ))}
          </div>

          {usersTotalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
              <button
                onClick={() => setUsersPage((p) => Math.max(0, p - 1))}
                disabled={usersPage_ === 0}
                className="btn-ghost disabled:opacity-30"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Anterior
              </button>

              <span className="text-2xs text-ink-muted font-mono">
                {usersPage_ + 1} / {usersTotalPages}
              </span>

              <button
                onClick={() => setUsersPage((p) => Math.min(usersTotalPages - 1, p + 1))}
                disabled={usersPage_ >= usersTotalPages - 1}
                className="btn-ghost disabled:opacity-30"
              >
                Próxima
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
