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

const PHOTOS_PER_PAGE = 15;

export default function Admin() {
  const [tab, setTab] = useState('metrics');
  const [metrics, setMetrics] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [usersPage, setUsersPage] = useState(0);
  const [photosPage, setPhotosPage] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  async function load() {
    const [m, t, u, p] = await Promise.all([
      axios.get('/api/admin/metrics').then((r) => r.data),
      axios.get('/api/admin/teachers').then((r) => r.data),
      axios.get('/api/admin/users').then((r) => r.data),
      axios.get('/api/admin/photos').then((r) => r.data),
    ]);
    setMetrics(m);
    setTeachers(t);
    setUsers(u);
    setPhotos(p);
  }

  function copyId(id) {
    navigator.clipboard.writeText(id).catch(() => {});
    setCopiedId(id);
    setTimeout(() => setCopiedId((prev) => (prev === id ? null : prev)), 2000);
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

  const photosTotalPages = Math.ceil(photos.length / PHOTOS_PER_PAGE);
  const photosPage_      = Math.min(photosPage, Math.max(0, photosTotalPages - 1));
  const photosVisible    = photos.slice(photosPage_ * PHOTOS_PER_PAGE, (photosPage_ + 1) * PHOTOS_PER_PAGE);

  const TABS = [['metrics', 'Métricas'], ['teachers', 'Professores'], ['users', 'Usuários'], ['photos', 'Fotos']];

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

      {tab === 'photos' && (
        <div className="panel enter-1">
          <h2 className="text-xs font-medium text-ink mb-1 uppercase tracking-wider">
            Fotos <span className="font-mono text-ink-muted font-normal">({photos.length})</span>
          </h2>
          <p className="text-2xs text-ink-muted font-mono mb-6">Clique no UUID para copiar</p>

          {photos.length === 0 ? (
            <p className="text-xs text-ink-muted font-mono">— nenhuma foto cadastrada —</p>
          ) : (
            <div>
              <div className="hidden md:grid grid-cols-[1fr_1fr_auto_auto_auto] gap-x-4 px-2 pb-2 border-b border-line text-2xs text-ink-muted uppercase tracking-wider">
                <span>UUID</span>
                <span>Participante</span>
                <span>Data</span>
                <span className="text-center">Notas</span>
                <span className="text-center">Média</span>
              </div>

              {photosVisible.map((photo, i) => (
                <div key={photo.id} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto_auto_auto] gap-x-4 items-center py-4 border-b border-line last:border-0 gap-y-1.5"
                  style={{ animation: `fadeUp 0.3s ease ${i * 25}ms both` }}>

                  <button
                    onClick={() => copyId(photo.id)}
                    className="group flex items-center gap-1.5 text-left"
                    title="Copiar UUID"
                  >
                    <span className={`font-mono text-2xs break-all transition-colors ${copiedId === photo.id ? 'text-green-400' : 'text-ink-secondary group-hover:text-ink'}`}>
                      {photo.id}
                    </span>
                    {copiedId === photo.id ? (
                      <svg className="shrink-0 text-green-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    ) : (
                      <svg className="shrink-0 text-ink-muted opacity-0 group-hover:opacity-100 transition-opacity" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                    )}
                  </button>

                  <p className="text-xs text-ink truncate">{photo.ownerName}</p>
                  <p className="text-2xs text-ink-muted font-mono whitespace-nowrap">
                    {new Date(photo.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                  <p className="text-2xs font-mono text-center text-ink-secondary">{photo.gradeCount}</p>
                  <p className="text-2xs font-mono text-center text-ink-secondary">
                    {photo.avgScore !== null ? photo.avgScore.toFixed(1) : '—'}
                  </p>
                </div>
              ))}
            </div>
          )}

          {photosTotalPages > 1 && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-line">
              <button
                onClick={() => setPhotosPage((p) => Math.max(0, p - 1))}
                disabled={photosPage_ === 0}
                className="btn-ghost disabled:opacity-30"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
                Anterior
              </button>
              <span className="text-2xs text-ink-muted font-mono">
                {photosPage_ + 1} / {photosTotalPages}
              </span>
              <button
                onClick={() => setPhotosPage((p) => Math.min(photosTotalPages - 1, p + 1))}
                disabled={photosPage_ >= photosTotalPages - 1}
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
