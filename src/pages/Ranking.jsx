import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Avatar from '../components/Avatar';

const MEDAL = ['🥇', '🥈', '🥉'];
const PER_PAGE = 10;

function PhotoModal({ entry, onClose }) {
  const navigate = useNavigate();
  const [grades, setGrades] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get(`/api/ranking/photo/${entry.photoId}/grades`)
      .then(({ data }) => setGrades(data))
      .catch(() => setGrades([]))
      .finally(() => setLoading(false));
  }, [entry.photoId]);

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
        {/* Botão fechar */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 flex items-center justify-center rounded-sm bg-black/40 text-white hover:bg-black/60 transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>

        {/* Foto */}
        <div className="md:w-3/5 bg-black flex items-center justify-center min-h-64">
          {entry.url
            ? <img src={entry.url} alt="" className="max-w-full max-h-[70vh] object-contain" />
            : <div className="text-ink-ghost/30 text-xs font-mono">sem imagem</div>
          }
        </div>

        {/* Painel lateral */}
        <div className="md:w-2/5 flex flex-col overflow-y-auto">
          {/* Cabeçalho */}
          <div className="px-6 pt-6 pb-4 border-b border-line">
            <div className="flex items-center gap-3">
              <Avatar name={entry.name} avatar={entry.avatar} size="sm" />
              <button
                onClick={() => { onClose(); navigate(`/perfil/${entry.userId}`); }}
                className="text-sm font-medium text-ink hover:text-ink-secondary hover:underline transition-colors text-left"
              >
                {entry.name}
              </button>
            </div>
            {entry.avgScore !== null && (
              <div className="flex items-baseline gap-1 mt-4">
                <span className="font-display italic text-5xl text-ink leading-none" style={{ letterSpacing: '-0.03em' }}>
                  {entry.avgScore.toFixed(1)}
                </span>
                <span className="text-xs text-ink-muted font-mono">/10</span>
                <span className="text-2xs text-ink-muted font-mono ml-2">
                  {entry.gradeCount} avaliação{entry.gradeCount !== 1 ? 'ões' : ''}
                </span>
              </div>
            )}
          </div>

          {/* Notas */}
          <div className="flex-1 px-6 py-4">
            {loading ? (
              <p className="text-xs text-ink-muted font-mono">carregando…</p>
            ) : grades.length === 0 ? (
              <p className="text-xs text-ink-muted font-mono">Nenhuma avaliação ainda.</p>
            ) : (
              <div className="flex flex-col gap-3">
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

function PhotoRankingRow({ entry, position, delay, onPhotoClick }) {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 border-b border-line last:border-0 hover:bg-surface-raised/50 transition-colors duration-150"
      style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${delay}ms both` }}
    >
      <div className="w-8 shrink-0 text-center">
        {position <= 3
          ? <span className="text-lg leading-none">{MEDAL[position - 1]}</span>
          : <span className="font-mono text-2xs text-ink-muted">{String(position).padStart(2, '0')}</span>
        }
      </div>

      <button
        onClick={() => onPhotoClick(entry)}
        className="w-14 h-14 shrink-0 rounded-sm overflow-hidden bg-surface-raised border border-line hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-ink/30"
      >
        {entry.url
          ? <img src={entry.url} alt="" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-ink-ghost/30 text-xs font-mono">—</div>
        }
      </button>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Avatar name={entry.name} avatar={entry.avatar} size="xs" />
          <button
            onClick={() => navigate(`/perfil/${entry.userId}`)}
            className="text-sm font-medium text-ink hover:text-ink-secondary hover:underline transition-colors truncate text-left"
          >
            {entry.name}
          </button>
          {entry.gradeCount > 0 && (
            <>
              <span className="text-ink-ghost/30">·</span>
              <span className="font-mono text-2xs text-ink-muted shrink-0">
                {entry.gradeCount} avaliação{entry.gradeCount !== 1 ? 'ões' : ''}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="shrink-0 text-right">
        {entry.avgScore !== null ? (
          <div className="flex items-baseline gap-1 justify-end">
            <span className={`font-display italic leading-none ${
              position === 1 ? 'text-4xl text-ink' : position <= 3 ? 'text-3xl text-ink-secondary' : 'text-2xl text-ink-muted'
            }`} style={{ letterSpacing: '-0.03em' }}>
              {entry.avgScore.toFixed(1)}
            </span>
            <span className="text-2xs text-ink-muted font-mono">/10</span>
          </div>
        ) : (
          <span className="text-xs text-ink-muted font-mono">—</span>
        )}
      </div>
    </div>
  );
}


function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  return (
    <div className="flex items-center justify-between mt-4">
      <button onClick={() => onChange(page - 1)} disabled={page === 1} className="btn-ghost disabled:opacity-30">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Anterior
      </button>
      <div className="flex items-center gap-1">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onChange(p)}
            className={`w-7 h-7 rounded-sm text-xs font-mono transition-colors duration-150 ${
              p === page ? 'bg-surface-raised text-ink' : 'text-ink-muted hover:text-ink hover:bg-surface-raised/50'
            }`}
          >
            {p}
          </button>
        ))}
      </div>
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages} className="btn-ghost disabled:opacity-30">
        Próxima
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>
    </div>
  );
}

export default function Ranking() {
  const [byPhoto, setByPhoto] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restricted, setRestricted] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [modalEntry, setModalEntry] = useState(null);

  async function load() {
    setRefreshing(true);
    try {
      const { data } = await axios.get('/api/ranking');
      setRestricted(false);
      setByPhoto(Array.isArray(data.byPhoto) ? data.byPhoto : []);
      setUpdatedAt(new Date());
      setPage(1);
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        setRestricted(true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { load(); }, []);

  const totalPages = Math.ceil(byPhoto.length / PER_PAGE);
  const pageEntries = byPhoto.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      {modalEntry && (
        <PhotoModal entry={modalEntry} onClose={() => setModalEntry(null)} />
      )}

      <div className="flex items-end justify-between mb-10 flex-wrap gap-6">
        <div className="enter-1">
          <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4">Concurso</p>
          <h1 className="font-display text-5xl italic text-ink leading-none" style={{ letterSpacing: '-0.02em' }}>
            Ranking
          </h1>
          {updatedAt && (
            <p className="text-2xs text-ink-muted font-mono mt-3">
              {updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              {byPhoto.length > 0 && <span className="ml-3">{byPhoto.length} foto{byPhoto.length !== 1 ? 's' : ''}</span>}
            </p>
          )}
        </div>
        <button onClick={load} disabled={refreshing} className="btn-outline enter-2">
          <svg className={refreshing ? 'animate-spin' : ''} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.3" />
          </svg>
          Atualizar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-24 text-ink-muted text-xs font-mono enter-3">carregando…</div>
      ) : restricted ? (
        <div className="text-center py-24 enter-3">
          <p className="font-display text-6xl italic text-ink-ghost/20 mb-4" style={{ letterSpacing: '-0.03em' }}>—</p>
          <p className="text-sm text-ink-muted">O ranking estará disponível ao encerramento do concurso.</p>
        </div>
      ) : byPhoto.length === 0 ? (
        <div className="text-center py-24 enter-3">
          <p className="font-display text-6xl italic text-ink-ghost/20 mb-4" style={{ letterSpacing: '-0.03em' }}>—</p>
          <p className="text-xs text-ink-muted font-mono">Nenhuma foto ainda.</p>
        </div>
      ) : (
        <>
          <div className="border border-line rounded-sm overflow-hidden enter-3">
            {pageEntries.map((entry, i) => (
              <PhotoRankingRow
                key={entry.photoId}
                entry={entry}
                position={(page - 1) * PER_PAGE + i + 1}
                delay={i * 40}
                onPhotoClick={setModalEntry}
              />
            ))}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <p className="text-center text-2xs text-ink-muted font-mono mt-10">F5 para recarregar</p>
    </div>
  );
}
