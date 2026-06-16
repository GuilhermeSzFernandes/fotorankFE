import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import Avatar from '../components/Avatar';

function PhotoModal({ photo, onClose }) {
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/admin/photos/${photo.id}/grades`)
      .then(({ data }) => setGrades(data))
      .catch(() => setGrades([]))
      .finally(() => setLoading(false));
  }, [photo.id]);

  const handleBackdrop = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <div className="relative flex flex-col md:flex-row w-full max-w-5xl max-h-[95vh] bg-surface rounded-sm overflow-hidden shadow-2xl mx-4">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-sm bg-black/40 text-white hover:bg-black/60 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        <div className="md:w-3/5 bg-black flex items-center justify-center min-h-64">
          {photo.url
            ? <img src={photo.url} alt="" className="max-w-full max-h-[70vh] object-contain" />
            : <div className="text-ink-ghost/30 text-xs font-mono">sem imagem</div>
          }
        </div>

        <div className="md:w-2/5 flex flex-col overflow-y-auto">
          <div className="px-6 pt-6 pb-4 border-b border-line">
            <p className="text-sm font-medium text-ink">{photo.ownerName}</p>
            <p className="text-2xs text-ink-muted font-mono mt-1">{photo.originalName}</p>
            {photo.avgScore !== null && (
              <div className="flex items-baseline gap-1 mt-4">
                <span className="font-display italic text-5xl text-ink leading-none" style={{ letterSpacing: '-0.03em' }}>
                  {photo.avgScore !== null ? photo.avgScore.toFixed(1) : '—'}
                </span>
                <span className="text-xs text-ink-muted font-mono">/10</span>
                <span className="text-2xs text-ink-muted font-mono ml-2">
                  {photo.gradeCount} avaliação{photo.gradeCount !== 1 ? 'ões' : ''}
                </span>
              </div>
            )}
          </div>

          <div className="flex-1 px-6 py-4">
            {loading ? (
              <p className="text-xs text-ink-muted font-mono">carregando…</p>
            ) : grades.length === 0 ? (
              <p className="text-xs text-ink-muted font-mono">Nenhuma avaliação ainda.</p>
            ) : (
              <div className="flex flex-col gap-0">
                {grades.map((g, i) => (
                  <div key={i} className="flex items-start gap-3 py-3 border-b border-line last:border-0">
                    <span className="font-mono text-sm font-bold text-ink-secondary shrink-0 w-10 text-right">{g.score.toFixed(1)}</span>
                    <div className="flex-1 min-w-0">
                      {g.comment
                        ? <p className="text-xs text-ink-muted leading-relaxed">{g.comment}</p>
                        : <p className="text-xs text-ink-ghost/40 italic font-mono">sem observação</p>
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

const PHASE_META = {
  waiting:      { label: 'Aguardando início',       color: 'text-ink-muted',    border: 'border-line',            bg: 'bg-surface' },
  registration: { label: 'Inscrições abertas',      color: 'text-blue-400',     border: 'border-blue-900/40',     bg: 'bg-blue-900/5' },
  evaluation:   { label: 'Avaliação em andamento',  color: 'text-amber-400',    border: 'border-amber-900/40',    bg: 'bg-amber-900/5' },
  closed:       { label: 'Concurso encerrado',      color: 'text-green-500',    border: 'border-green-900/40',    bg: 'bg-green-900/5' },
};

function PhaseSwitch({ current, override, onSet, loading }) {
  const phases = [
    { key: 'waiting',      icon: '○', label: 'Aguardando' },
    { key: 'registration', icon: '◑', label: 'Inscrições' },
    { key: 'evaluation',   icon: '◕', label: 'Avaliação' },
    { key: 'closed',       icon: '●', label: 'Encerrado' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-ink uppercase tracking-wider">Fase atual</p>
        {override && (
          <button
            onClick={() => onSet(null)}
            disabled={loading}
            className="text-2xs text-ink-muted hover:text-ink-secondary font-mono transition-colors"
          >
            usar datas automáticas
          </button>
        )}
      </div>

      {override && (
        <div className="text-2xs font-mono text-amber-400/70 px-3 py-1.5 border border-amber-900/30 rounded-sm bg-amber-900/5">
          Fase definida manualmente — datas ignoradas
        </div>
      )}

      <div className="grid grid-cols-4 gap-2">
        {phases.map(({ key, icon, label }) => {
          const active = current === key;
          const meta = PHASE_META[key];
          return (
            <button
              key={key}
              onClick={() => onSet(key)}
              disabled={loading || active}
              className={`flex flex-col items-center gap-2 py-4 px-2 rounded-sm border transition-all duration-150 disabled:cursor-default ${
                active
                  ? `${meta.border} ${meta.bg} ${meta.color}`
                  : 'border-line text-ink-muted hover:border-ink-secondary hover:text-ink-secondary'
              }`}
            >
              <span className="text-xl leading-none">{icon}</span>
              <span className="text-2xs font-mono text-center leading-tight">{label}</span>
              {active && <span className="text-2xs font-mono opacity-60">ativa</span>}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function DateField({ label, value, onChange }) {
  return (
    <div>
      <label className="flabel">{label}</label>
      <input
        type="datetime-local"
        className="field"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

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

function toLocalInput(isoStr) {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d)) return '';
  // datetime-local expects "YYYY-MM-DDTHH:mm"
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default function Admin() {
  const [tab, setTab] = useState('metrics');
  const [metrics, setMetrics] = useState(null);
  const [teachers, setTeachers] = useState([]);
  const [users, setUsers] = useState([]);
  const [photos, setPhotos] = useState([]);
  const [usersPage, setUsersPage] = useState(0);
  const [photosPage, setPhotosPage] = useState(0);
  const [copiedId, setCopiedId] = useState(null);
  const [modalPhoto, setModalPhoto] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Contest state
  const [contest, setContest] = useState(null);
  const [contestDates, setContestDates] = useState({ registration_start: '', registration_end: '', evaluation_start: '', evaluation_end: '' });
  const [contestLoading, setContestLoading] = useState(false);

  async function load() {
    const [m, t, u, p, c] = await Promise.all([
      axios.get('/api/admin/metrics').then((r) => r.data),
      axios.get('/api/admin/teachers').then((r) => r.data),
      axios.get('/api/admin/users').then((r) => r.data),
      axios.get('/api/admin/photos').then((r) => r.data),
      axios.get('/api/contest/config').then((r) => r.data),
    ]);
    setMetrics(m);
    setTeachers(t);
    setUsers(u);
    setPhotos(p);
    setContest(c);
    setContestDates({
      registration_start: toLocalInput(c.config?.registration_start),
      registration_end:   toLocalInput(c.config?.registration_end),
      evaluation_start:   toLocalInput(c.config?.evaluation_start),
      evaluation_end:     toLocalInput(c.config?.evaluation_end),
    });
  }

  async function handleSaveDates(e) {
    e.preventDefault();
    setError(''); setSuccess(''); setContestLoading(true);
    try {
      const { data } = await axios.put('/api/contest/config', {
        ...contestDates,
        ranking_public: contest.config?.ranking_public ?? false,
      });
      setContest(data);
      setSuccess('Datas salvas com sucesso.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao salvar datas.');
    } finally {
      setContestLoading(false);
    }
  }

  async function handleToggleRankingPublic() {
    setError(''); setSuccess(''); setContestLoading(true);
    try {
      const newValue = !(contest.config?.ranking_public ?? false);
      const { data } = await axios.put('/api/contest/config', {
        ...contestDates,
        ranking_public: newValue,
      });
      setContest(data);
      setSuccess(newValue ? 'Ranking liberado para todos.' : 'Ranking restrito a admin e professores.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar visibilidade do ranking.');
    } finally {
      setContestLoading(false);
    }
  }

  async function handleSetPhase(phase) {
    setError(''); setSuccess(''); setContestLoading(true);
    try {
      const { data } = await axios.post('/api/contest/phase', { phase });
      setContest(data);
      setSuccess(phase ? `Fase "${data.phaseLabel}" ativada manualmente.` : 'Voltando ao controle automático por datas.');
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao alterar fase.');
    } finally {
      setContestLoading(false);
    }
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

  const TABS = [['contest', 'Concurso'], ['metrics', 'Métricas'], ['teachers', 'Professores'], ['users', 'Usuários'], ['photos', 'Fotos']];

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      {modalPhoto && (
        <PhotoModal photo={modalPhoto} onClose={() => setModalPhoto(null)} />
      )}

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

      {tab === 'contest' && contest && (
        <div className="space-y-6 enter-1">
          {/* Status atual */}
          <div className={`panel border ${PHASE_META[contest.phase]?.border ?? 'border-line'} ${PHASE_META[contest.phase]?.bg ?? ''}`}>
            <p className="text-2xs text-ink-muted uppercase tracking-widest mb-2">Status do concurso</p>
            <p className={`font-display text-3xl italic leading-none ${PHASE_META[contest.phase]?.color ?? 'text-ink'}`}
               style={{ letterSpacing: '-0.02em' }}>
              {contest.phaseLabel}
            </p>
          </div>

          {/* Switch de fase manual */}
          <div className="panel">
            <PhaseSwitch
              current={contest.phase}
              override={contest.config?.phase_override ?? null}
              onSet={handleSetPhase}
              loading={contestLoading}
            />
          </div>

          {/* Visibilidade do ranking */}
          <div className="panel">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-medium text-ink uppercase tracking-wider">Visibilidade do ranking</h2>
                <p className="text-2xs text-ink-muted font-mono mt-1">
                  {contest.config?.ranking_public
                    ? 'Visível para todos, incluindo participantes e visitantes.'
                    : 'Visível apenas para admin e professores (ou ao encerrar o concurso).'}
                </p>
              </div>
              <button
                onClick={handleToggleRankingPublic}
                disabled={contestLoading}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-50 ${
                  contest.config?.ranking_public ? 'bg-green-500' : 'bg-surface-raised'
                }`}
                role="switch"
                aria-checked={contest.config?.ranking_public ?? false}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow transition duration-200 ${
                    contest.config?.ranking_public ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Configuração de datas */}
          <div className="panel">
            <h2 className="text-xs font-medium text-ink mb-1 uppercase tracking-wider">Configurar datas</h2>
            <p className="text-2xs text-ink-muted font-mono mb-6">
              As datas só são usadas quando nenhuma fase estiver definida manualmente.
            </p>
            <form onSubmit={handleSaveDates} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DateField
                  label="Início das inscrições"
                  value={contestDates.registration_start}
                  onChange={(v) => setContestDates((d) => ({ ...d, registration_start: v }))}
                />
                <DateField
                  label="Fim das inscrições"
                  value={contestDates.registration_end}
                  onChange={(v) => setContestDates((d) => ({ ...d, registration_end: v }))}
                />
                <DateField
                  label="Início da avaliação"
                  value={contestDates.evaluation_start}
                  onChange={(v) => setContestDates((d) => ({ ...d, evaluation_start: v }))}
                />
                <DateField
                  label="Fim da avaliação"
                  value={contestDates.evaluation_end}
                  onChange={(v) => setContestDates((d) => ({ ...d, evaluation_end: v }))}
                />
              </div>
              <button type="submit" className="btn-primary" disabled={contestLoading}>
                {contestLoading ? 'Salvando…' : 'Salvar datas'}
              </button>
            </form>
          </div>
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
            <KPI label="Total de fotos"  value={metrics.totalPhotos}    delay={240} />
            <KPI label="Fotos avaliadas" value={metrics.gradedPhotos}   delay={300} />
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
          <p className="text-2xs text-ink-muted font-mono mb-6">Clique na foto ou no UUID para visualizar · Clique no ícone de copiar para copiar o UUID</p>

          {photos.length === 0 ? (
            <p className="text-xs text-ink-muted font-mono">— nenhuma foto cadastrada —</p>
          ) : (
            <div>
              <div className="hidden md:grid grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-x-4 px-2 pb-2 border-b border-line text-2xs text-ink-muted uppercase tracking-wider">
                <span></span>
                <span>UUID</span>
                <span>Participante</span>
                <span>Data</span>
                <span className="text-center">Notas</span>
                <span className="text-center">Média</span>
              </div>

              {photosVisible.map((photo, i) => (
                <div key={photo.id} className="grid grid-cols-1 md:grid-cols-[auto_1fr_1fr_auto_auto_auto] gap-x-4 items-center py-4 border-b border-line last:border-0 gap-y-1.5"
                  style={{ animation: `fadeUp 0.3s ease ${i * 25}ms both` }}>

                  <button
                    onClick={() => setModalPhoto(photo)}
                    className="w-10 h-10 shrink-0 rounded-sm overflow-hidden bg-surface-raised border border-line hover:opacity-75 transition-opacity focus:outline-none focus:ring-2 focus:ring-ink/30"
                    title="Ver foto"
                  >
                    {photo.url
                      ? <img src={photo.url} alt="" className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-ink-ghost/30 text-xs font-mono">—</div>
                    }
                  </button>

                  <div className="group flex items-center gap-1.5">
                    <button
                      onClick={() => setModalPhoto(photo)}
                      className={`font-mono text-2xs break-all text-left transition-colors hover:underline underline-offset-2 ${copiedId === photo.id ? 'text-green-400' : 'text-ink-secondary hover:text-ink'}`}
                      title="Ver foto"
                    >
                      {photo.id}
                    </button>
                    <button
                      onClick={() => copyId(photo.id)}
                      className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Copiar UUID"
                    >
                      {copiedId === photo.id ? (
                        <svg className="text-green-400" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg className="text-ink-muted hover:text-ink transition-colors" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                    </button>
                  </div>

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
