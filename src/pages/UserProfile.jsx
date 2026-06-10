import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Avatar from '../components/Avatar';

const MEDAL = ['🥇', '🥈', '🥉'];

function PhotoCard({ photo, index }) {
  const [expanded, setExpanded] = useState(false);
  const comments = photo.feedbacks?.filter((f) => f.comment?.trim()) ?? [];

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e) => { if (e.key === 'Escape') setExpanded(false); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [expanded]);

  return (
    <>
      {expanded && createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 sm:p-6"
          onClick={() => setExpanded(false)}
        >
          <div
            className="relative max-w-[95vw] max-h-[92vh]"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={photo.url}
              alt={photo.originalName}
              className="block max-w-full max-h-[90vh] object-contain rounded-sm shadow-2xl"
            />
          </div>
          <button
            onClick={() => setExpanded(false)}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>,
        document.body
      )}

      <div
        className="rounded-sm border border-line overflow-hidden"
        style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms both` }}
      >
        {/* Imagem */}
        <div
          className="relative overflow-hidden cursor-zoom-in group"
          style={{ aspectRatio: '4/3' }}
          onClick={() => setExpanded(true)}
        >
          <img
            src={photo.url}
            alt={photo.originalName}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
          />
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
            <div className="w-10 h-10 rounded-full bg-black/50 flex items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
                <line x1="11" y1="8" x2="11" y2="14"/>
                <line x1="8" y1="11" x2="14" y2="11"/>
              </svg>
            </div>
          </div>
        </div>

        {/* Status */}
        {photo.gradeCount === 0 ? (
          <div className="px-4 py-3 border-t border-line/60">
            <span className="text-2xs text-ink-ghost/40 font-mono">aguardando avaliação</span>
          </div>
        ) : (
          <div className="px-4 py-3 border-t border-amber-500/25 bg-amber-500/5">
            <div className="flex items-baseline justify-between mb-1">
              <div className="flex items-baseline gap-1">
                <span className="font-display text-3xl italic text-ink leading-none" style={{ letterSpacing: '-0.03em' }}>
                  {photo.avgScore?.toFixed(1)}
                </span>
                <span className="text-xs text-ink-muted font-mono">/10</span>
              </div>
              <span className="text-2xs text-ink-muted font-mono">
                {photo.gradeCount} avaliação{photo.gradeCount !== 1 ? 'ões' : ''}
              </span>
            </div>

            {comments.length > 0 && (
              <div className="space-y-1.5 mt-2 pt-2 border-t border-amber-500/20">
                {comments.map((f, j) => (
                  <div key={j} className="flex gap-2">
                    <span className="text-2xs text-amber-400/70 font-mono shrink-0 mt-0.5">{f.score}·</span>
                    <p className="text-2xs text-ink-secondary leading-relaxed">{f.comment}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

export default function UserProfile() {

  const { userId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    axios.get(`/api/users/${userId}/profile`)
      .then((r) => setData(r.data))
      .catch((err) => { if (err.response?.status === 404) setNotFound(true); })
      .finally(() => setLoading(false));
  }, [userId]);

  useEffect(() => {
    function onKey(e) { if (e.key === 'Escape') navigate(-1); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [navigate]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[calc(100vh-48px)] text-ink-muted text-xs font-mono">
      carregando…
    </div>
  );

  if (notFound) return (
    <div className="max-w-2xl mx-auto px-6 py-14 text-center">
      <p className="font-display text-5xl italic text-ink-ghost/20 mb-4" style={{ letterSpacing: '-0.03em' }}>—</p>
      <p className="text-xs text-ink-muted font-mono">Participante não encontrado.</p>
      <button onClick={() => navigate(-1)} className="btn-ghost mt-6">Voltar</button>
    </div>
  );

  const { user, photos } = data;
  const graded = photos.filter((p) => p.gradeCount > 0);
  const avgGeral = graded.length > 0
    ? (graded.reduce((s, p) => s + p.avgScore, 0) / graded.length).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto px-6 py-14">
      {/* Voltar */}
      <button onClick={() => navigate(-1)} className="btn-ghost mb-10 enter-1">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Ranking
      </button>

      {/* Header do participante */}
      <div className="flex items-center gap-5 mb-10 enter-2">
        <Avatar name={user.name} avatar={user.avatar} size="2xl" />
        <div>
          <p className="text-2xs text-ink-muted uppercase tracking-widest mb-2">Participante</p>
          <h1 className="font-display text-4xl sm:text-5xl italic text-ink leading-none" style={{ letterSpacing: '-0.02em' }}>
            {user.name}
          </h1>
          <div className="flex items-center gap-4 mt-3">
            <span className="text-xs text-ink-secondary font-mono">{photos.length} foto{photos.length !== 1 ? 's' : ''}</span>
            {avgGeral && (
              <>
                <span className="text-ink-ghost/30">·</span>
                <div className="flex items-baseline gap-1">
                  <span className="font-display text-2xl italic text-ink leading-none" style={{ letterSpacing: '-0.03em' }}>
                    {avgGeral}
                  </span>
                  <span className="text-xs text-ink-muted font-mono">/10</span>
                  <span className="text-2xs text-ink-muted font-mono ml-1">média geral</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Fotos */}
      {photos.length === 0 ? (
        <div className="text-center py-16 enter-3">
          <p className="font-display text-5xl italic text-ink-ghost/20 mb-3" style={{ letterSpacing: '-0.03em' }}>—</p>
          <p className="text-xs text-ink-muted font-mono">Nenhuma foto enviada ainda.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 enter-3">
          {photos.map((photo, i) => (
            <PhotoCard key={photo.id} photo={photo} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}
