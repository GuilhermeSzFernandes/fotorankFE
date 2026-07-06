import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import axios from 'axios';
import Avatar from '../components/Avatar';

const PHASE_BANNER = {
  waiting:      { text: 'As inscrições ainda não foram abertas. A avaliação começa após o encerramento das inscrições.', cls: 'text-ink-muted border-line bg-surface' },
  registration: { text: 'Período de inscrições em andamento. A avaliação de fotos ainda não está liberada.',             cls: 'text-blue-400/80 border-blue-900/30 bg-blue-900/5' },
  closed:       { text: 'O concurso foi encerrado. Não é mais possível alterar avaliações.',                             cls: 'text-green-500/80 border-green-900/30 bg-green-900/5' },
};

const PER_PAGE = 3;

// ── Estrelas (1–10) ────────────────────────────────────────────────────────────
function StarRating({ score, onChange, disabled }) {
  const [hover, setHover] = useState(null);
  const display = hover ?? score ?? 0;

  return (
    <div className="flex items-center gap-0.5 flex-wrap">
      {Array.from({ length: 10 }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          disabled={disabled}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(null)}
          onClick={() => onChange(star)}
          className={`transition-all duration-75 disabled:opacity-50 ${
            star <= display ? 'text-amber-400' : 'text-ink-muted/50 hover:text-amber-300'
          } hover:scale-110 active:scale-95`}
          title={`${star} ponto${star !== 1 ? 's' : ''}`}
        >
          <svg width="20" height="20" viewBox="0 0 24 24"
            fill={star <= display ? 'currentColor' : 'none'}
            stroke="currentColor" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>
      ))}
      <span className={`ml-3 font-display italic text-2xl tabular-nums leading-none transition-colors duration-75 ${
        hover != null ? 'text-amber-400' : score != null ? 'text-ink' : 'text-ink-ghost/25'
      }`} style={{ letterSpacing: '-0.02em' }}>
        {hover ?? score ?? '—'}
        <span className="text-xs text-ink-muted not-italic font-mono">/10</span>
      </span>
    </div>
  );
}

// ── Lightbox com navegação e avaliação ────────────────────────────────────────
function Lightbox({ photos, initialIndex, scores, comments, saving, onScoreChange, onCommentChange, onCommentSave, onUngrade, onClose, canGrade }) {
  const [idx, setIdx] = useState(initialIndex);

  // Fecha se não há mais fotos; ajusta índice se a lista encolheu
  useEffect(() => {
    if (photos.length === 0) { onClose(); return; }
    if (idx >= photos.length) setIdx(photos.length - 1);
  }, [photos.length]);

  const photo = photos[Math.min(idx, photos.length - 1)];
  if (!photo) return null;

  const score = scores[photo.id] ?? null;
  const comment = comments[photo.id] ?? '';
  const commentDirty = comment !== (photo.myGrade?.comment ?? '');

  const prev = () => setIdx((i) => Math.max(0, i - 1));
  const next = () => setIdx((i) => Math.min(photos.length - 1, i + 1));

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  prev();
      if (e.key === 'ArrowRight') next();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose, idx]);

  return createPortal(
    <div className="fixed inset-0 z-50 flex bg-black/80 backdrop-blur-md" onClick={onClose}>

      {/* Seta esquerda */}
      <button
        onClick={(e) => { e.stopPropagation(); prev(); }}
        disabled={idx === 0}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors disabled:opacity-20"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* Seta direita */}
      <button
        onClick={(e) => { e.stopPropagation(); next(); }}
        disabled={idx === photos.length - 1}
        className="absolute right-[316px] top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors disabled:opacity-20 sm:right-[336px]"
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Foto */}
      <div
        className="flex-1 flex items-center justify-center p-6 sm:p-10"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={photo.id}
          src={photo.url}
          alt={photo.originalName}
          className="max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl"
        />
      </div>

      {/* Painel lateral */}
      <div
        className="w-72 sm:w-80 shrink-0 bg-base/95 border-l border-white/10 flex flex-col overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <span className="text-2xs text-white/40 font-mono">{idx + 1} / {photos.length}</span>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/60 hover:text-white transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="flex flex-col gap-5 p-5 flex-1">
          {/* Dono */}
          <div className="flex items-center gap-2.5">
            <Avatar name={photo.ownerName} avatar={photo.ownerAvatar} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-ink truncate">{photo.ownerName}</p>
            </div>
          </div>

          {/* Indicador de salvo + desavaliar */}
          {score != null && !saving[photo.id] && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-2xs text-amber-400/70 font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                avaliada · {score}/10
              </div>
              {canGrade && (
                <button
                  onClick={() => onUngrade(photo.id)}
                  className="text-2xs text-ink-muted hover:text-red-400 font-mono transition-colors"
                  title="Remover avaliação"
                >
                  desavaliar
                </button>
              )}
            </div>
          )}
          {saving[photo.id] && (
            <p className="text-2xs text-ink-muted font-mono">salvando…</p>
          )}

          {/* Estrelas */}
          <div>
            <p className="text-2xs text-ink-muted uppercase tracking-widest mb-3">Nota</p>
            <StarRating
              score={score}
              onChange={(s) => onScoreChange(photo.id, s)}
              disabled={!!saving[photo.id] || !canGrade}
            />
          </div>

          {/* Comentário */}
          {canGrade && (
            <div className="flex flex-col gap-2">
              <textarea
                rows={3}
                placeholder="Comentário (opcional)"
                value={comment}
                onChange={(e) => onCommentChange(photo.id, e.target.value)}
                className="field py-2 text-xs resize-none"
              />
              {commentDirty && score != null && (
                <button
                  onClick={() => onCommentSave(photo.id)}
                  disabled={!!saving[photo.id]}
                  className="btn-primary text-xs py-1.5 disabled:opacity-40"
                >
                  {saving[photo.id] ? 'Salvando…' : 'Salvar comentário'}
                </button>
              )}
            </div>
          )}
        </div>

        {/* Navegação no rodapé */}
        <div className="flex gap-2 px-5 py-4 border-t border-white/10">
          <button onClick={prev} disabled={idx === 0} className="btn-ghost flex-1 justify-center disabled:opacity-30 text-xs">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Anterior
          </button>
          <button onClick={next} disabled={idx === photos.length - 1} className="btn-ghost flex-1 justify-center disabled:opacity-30 text-xs">
            Próxima
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ── Card de foto ───────────────────────────────────────────────────────────────
function PhotoCard({ photo, score, comment, saving, onScoreChange, onCommentChange, onCommentSave, onUngrade, onExpand, index, canGrade }) {
  const graded = score != null;
  const commentDirty = comment !== (photo.myGrade?.comment ?? '');

  return (
    <div
      className={`flex flex-col rounded-sm border overflow-hidden transition-colors duration-200 ${
        graded
          ? 'border-amber-500/30 bg-surface'
          : 'border-line bg-surface'
      }`}
      style={{ animation: `fadeUp 0.4s cubic-bezier(0.16,1,0.3,1) ${index * 70}ms both` }}
    >
      {/* Imagem clicável */}
      <div
        className="relative overflow-hidden cursor-zoom-in group"
        style={{ aspectRatio: '4/3' }}
        onClick={() => onExpand(photo)}
      >
        <img
          src={photo.url}
          alt={photo.originalName}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />

        {/* Badge de nota salva */}
        {graded && (
          <div className="absolute top-2.5 right-2.5 bg-base/85 border border-amber-500/30 rounded-sm px-2 py-0.5">
            <span className="font-mono text-xs text-amber-400 tabular-nums">{score}<span className="text-ink-muted">/10</span></span>
          </div>
        )}

        {/* Ícone de zoom */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/15">
          <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              <line x1="11" y1="8" x2="11" y2="14"/>
              <line x1="8" y1="11" x2="14" y2="11"/>
            </svg>
          </div>
        </div>

        {/* Indicador "avaliada" */}
        {graded && (
          <div className="absolute top-2.5 left-2.5 w-2 h-2 rounded-full bg-amber-400" title="Avaliada" />
        )}
      </div>

      {/* Info + avaliação */}
      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Dono */}
        <div className="flex items-center gap-2.5">
          <Avatar name={photo.ownerName} avatar={photo.ownerAvatar} size="sm" />
          <div className="min-w-0">
            <p className="text-sm font-medium text-ink truncate">{photo.ownerName}</p>
          </div>
        </div>

        {/* Estrelas — clique salva automaticamente */}
        <div>
          <p className="text-2xs text-ink-muted uppercase tracking-widest mb-2">Nota</p>
          <StarRating score={score} onChange={(s) => onScoreChange(photo.id, s)} disabled={saving || !canGrade} />
        </div>

        {/* Comentário */}
        {canGrade && (
          <div className="flex gap-2 items-start mt-auto">
            <input
              type="text"
              placeholder="Comentário (opcional)"
              value={comment ?? ''}
              onChange={(e) => onCommentChange(photo.id, e.target.value)}
              className="field py-1.5 text-xs flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter' && commentDirty) onCommentSave(photo.id); }}
            />
            {commentDirty && score != null && (
              <button
                onClick={() => onCommentSave(photo.id)}
                disabled={saving}
                className="px-2.5 py-1.5 text-2xs text-ink-muted border border-line rounded-sm hover:border-ink-secondary hover:text-ink-secondary transition-colors shrink-0 disabled:opacity-40"
              >
                {saving ? '…' : 'Salvar'}
              </button>
            )}
          </div>
        )}

        {/* Estado de salvamento / desavaliar */}
        {saving ? (
          <p className="text-2xs text-ink-muted font-mono">salvando…</p>
        ) : score != null && canGrade && (
          <div className="flex justify-end">
            <button
              onClick={() => onUngrade(photo.id)}
              className="text-2xs text-ink-muted hover:text-red-400 font-mono transition-colors"
            >
              desavaliar
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Paginação ──────────────────────────────────────────────────────────────────
function Pagination({ page, totalPages, onChange, totalVisible, totalAll }) {
  if (totalPages <= 1 && page === 0) return null;

  return (
    <div className="flex items-center justify-between mt-6">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 0}
        className="btn-ghost disabled:opacity-30"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Anterior
      </button>

      <span className="text-2xs text-ink-muted font-mono">
        {page * PER_PAGE + 1}–{Math.min((page + 1) * PER_PAGE, totalVisible)} de {totalVisible}
        {totalVisible !== totalAll && <span className="text-ink-ghost/50"> ({totalAll} total)</span>}
      </span>

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages - 1}
        className="btn-ghost disabled:opacity-30"
      >
        Próximas
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

// ── Página principal ───────────────────────────────────────────────────────────
export default function Teacher() {
  const [photos, setPhotos]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving]   = useState({});
  const [scores, setScores]   = useState({});
  const [comments, setComments] = useState({});
  const [filter, setFilter]   = useState('pending');
  const [page, setPage]       = useState(0);
  const [lightboxIdx, setLightboxIdx] = useState(null);
  const [phase, setPhase] = useState(null);

  const canGrade = phase === 'evaluation';

  async function loadPhotos() {
    try {
      const [gradesRes, contestRes] = await Promise.all([
        axios.get('/api/grades'),
        axios.get('/api/contest/config'),
      ]);
      const data = gradesRes.data;
      setPhotos(data);
      setPhase(contestRes.data.phase);
      const s = {};
      const c = {};
      data.forEach((p) => {
        if (p.myGrade) {
          s[p.id] = p.myGrade.score;
          c[p.id] = p.myGrade.comment ?? '';
        }
      });
      setScores(s);
      setComments(c);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPhotos(); }, []);

  async function saveGrade(photoId, score, comment) {
    setSaving((s) => ({ ...s, [photoId]: true }));
    try {
      await axios.post('/api/grades', { photoId, score, comment: comment ?? '' });
      setPhotos((prev) =>
        prev.map((p) =>
          p.id === photoId
            ? { ...p, myGrade: { ...(p.myGrade || {}), score, comment: comment ?? '' } }
            : p
        )
      );
    } finally {
      setSaving((s) => ({ ...s, [photoId]: false }));
    }
  }

  function handleScoreChange(photoId, star) {
    setScores((s) => ({ ...s, [photoId]: star }));
    saveGrade(photoId, star, comments[photoId] ?? '');
  }

  function handleCommentChange(photoId, value) {
    setComments((c) => ({ ...c, [photoId]: value }));
  }

  function handleCommentSave(photoId) {
    if (scores[photoId] == null) return;
    saveGrade(photoId, scores[photoId], comments[photoId] ?? '');
  }

  async function handleUngrade(photoId) {
    setSaving((s) => ({ ...s, [photoId]: true }));
    try {
      await axios.delete(`/api/grades/${photoId}`);
      setScores((s) => { const n = { ...s }; delete n[photoId]; return n; });
      setComments((c) => { const n = { ...c }; delete n[photoId]; return n; });
      setPhotos((prev) =>
        prev.map((p) => p.id === photoId ? { ...p, myGrade: null } : p)
      );
    } finally {
      setSaving((s) => ({ ...s, [photoId]: false }));
    }
  }

  function handleFilterChange(f) {
    setFilter(f);
    setPage(0);
  }

  const graded = photos.filter((p) => p.myGrade).length;

  const filtered = photos.filter((p) =>
    filter === 'all'     ? true :
    filter === 'pending' ? !p.myGrade :
                           !!p.myGrade
  );

  const totalPages  = Math.ceil(filtered.length / PER_PAGE);
  const pagePhotos  = filtered.slice(page * PER_PAGE, (page + 1) * PER_PAGE);
  const progressPct = photos.length > 0 ? (graded / photos.length) * 100 : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-48px)] text-ink-muted text-xs font-mono">
        carregando…
      </div>
    );
  }

  return (
    <>
      {lightboxIdx !== null && (
        <Lightbox
          photos={filtered}
          initialIndex={lightboxIdx}
          scores={scores}
          comments={comments}
          saving={saving}
          onScoreChange={handleScoreChange}
          onCommentChange={handleCommentChange}
          onCommentSave={handleCommentSave}
          onUngrade={handleUngrade}
          onClose={() => setLightboxIdx(null)}
          canGrade={canGrade}
        />
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">

        {/* Banner de fase */}
        {phase && phase !== 'evaluation' && PHASE_BANNER[phase] && (
          <div className={`text-xs mb-6 px-3 py-2.5 border rounded-sm enter-1 ${PHASE_BANNER[phase].cls}`}>
            {PHASE_BANNER[phase].text}
          </div>
        )}

        {/* Cabeçalho */}
        <div className="flex items-end justify-between mb-8 flex-wrap gap-5 enter-1">
          <div>
            <p className="text-2xs text-ink-muted uppercase tracking-widest mb-3">Júri</p>
            <h1 className="font-display text-4xl sm:text-5xl italic text-ink leading-none" style={{ letterSpacing: '-0.02em' }}>
              Avaliação
            </h1>
          </div>

          {/* Filtros */}
          <div className="flex items-center bg-surface border border-line rounded-sm p-1 gap-0.5 enter-2">
            {[
              ['pending', 'Pendentes'],
              ['graded',  'Avaliadas'],
              ['all',     'Todas'],
            ].map(([v, l]) => (
              <button
                key={v}
                onClick={() => handleFilterChange(v)}
                className={`px-3 py-1.5 rounded-sm text-xs transition-colors duration-150 ${
                  filter === v ? 'bg-surface-raised text-ink' : 'text-ink-secondary hover:text-ink'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Progresso */}
        <div className="mb-8 enter-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-ink-secondary">
              <span className="font-mono text-ink">{graded}</span> de{' '}
              <span className="font-mono">{photos.length}</span> fotos avaliadas
            </span>
            <span className="text-xs text-ink-muted font-mono">{Math.round(progressPct)}%</span>
          </div>
          <div className="w-full h-1 bg-surface-raised rounded-full overflow-hidden">
            <div
              className="h-1 bg-amber-400/70 rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Grid de fotos */}
        {filtered.length === 0 ? (
          <div className="text-center py-24 enter-3">
            <p className="font-display text-5xl italic text-ink-ghost/20 mb-3" style={{ letterSpacing: '-0.03em' }}>—</p>
            <p className="text-xs text-ink-muted font-mono">
              {filter === 'pending' ? 'todas as fotos já foram avaliadas' : 'nenhuma foto encontrada'}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 enter-3">
              {pagePhotos.map((photo, i) => (
                <PhotoCard
                  key={photo.id}
                  index={i}
                  photo={photo}
                  score={scores[photo.id] ?? null}
                  comment={comments[photo.id] ?? ''}
                  saving={!!saving[photo.id]}
                  onScoreChange={handleScoreChange}
                  onCommentChange={handleCommentChange}
                  onCommentSave={handleCommentSave}
                  onUngrade={handleUngrade}
                  onExpand={(p) => setLightboxIdx(filtered.findIndex((f) => f.id === p.id))}
                  canGrade={canGrade}
                />
              ))}
            </div>

            <Pagination
              page={page}
              totalPages={totalPages}
              onChange={setPage}
              totalVisible={filtered.length}
              totalAll={photos.length}
            />
          </>
        )}
      </div>
    </>
  );
}
