import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Avatar from '../components/Avatar';

const MEDAL = ['🥇', '🥈', '🥉'];
const PER_PAGE = 10;

function PhotoRankingRow({ entry, position, delay }) {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center gap-4 px-5 py-4 border-b border-line last:border-0 hover:bg-surface-raised/50 transition-colors duration-150 cursor-pointer"
      style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${delay}ms both` }}
      onClick={() => navigate(`/perfil/${entry.userId}`)}
    >
      <div className="w-8 shrink-0 text-center">
        {position <= 3
          ? <span className="text-lg leading-none">{MEDAL[position - 1]}</span>
          : <span className="font-mono text-2xs text-ink-muted">{String(position).padStart(2, '0')}</span>
        }
      </div>

      <div className="w-14 h-14 shrink-0 rounded-sm overflow-hidden bg-surface-raised border border-line">
        {entry.url
          ? <img src={entry.url} alt={entry.originalName} className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-ink-ghost/30 text-xs font-mono">—</div>
        }
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{entry.originalName}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <Avatar name={entry.name} avatar={entry.avatar} size="xs" />
          <span className="text-2xs text-ink-muted truncate">{entry.name}</span>
          {entry.gradeCount > 0 && (
            <>
              <span className="text-ink-ghost/30">·</span>
              <span className="font-mono text-2xs text-ink-muted">
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

function ParticipantRankingRow({ entry, position, delay }) {
  const navigate = useNavigate();
  return (
    <div
      className="flex items-center gap-5 px-5 py-5 border-b border-line last:border-0 hover:bg-surface-raised/50 transition-colors duration-150 cursor-pointer"
      style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${delay}ms both` }}
      onClick={() => navigate(`/perfil/${entry.userId}`)}
    >
      <div className="w-8 shrink-0 text-center">
        {position <= 3
          ? <span className="text-lg leading-none">{MEDAL[position - 1]}</span>
          : <span className="font-mono text-2xs text-ink-muted">{String(position).padStart(2, '0')}</span>
        }
      </div>

      <Avatar name={entry.name} avatar={entry.avatar} size="md" />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink truncate">{entry.name}</p>
        <div className="flex items-center gap-3 mt-0.5">
          <span className="font-mono text-2xs text-ink-muted">
            {entry.photoCount} foto{entry.photoCount !== 1 ? 's' : ''}
          </span>
          {entry.gradeCount > 0 && (
            <>
              <span className="text-ink-ghost/30">·</span>
              <span className="font-mono text-2xs text-ink-muted">
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
  const [byParticipant, setByParticipant] = useState([]);
  const [loading, setLoading] = useState(true);
  const [restricted, setRestricted] = useState(false);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [tab, setTab] = useState('photo');
  const [pagePhoto, setPagePhoto] = useState(1);
  const [pageParticipant, setPageParticipant] = useState(1);

  async function load() {
    setRefreshing(true);
    try {
      const { data } = await axios.get('/api/ranking');
      setRestricted(false);
      setByPhoto(data.byPhoto);
      setByParticipant(data.byParticipant);
      setUpdatedAt(new Date());
      setPagePhoto(1);
      setPageParticipant(1);
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

  const activeList = tab === 'photo' ? byPhoto : byParticipant;
  const page = tab === 'photo' ? pagePhoto : pageParticipant;
  const setPage = tab === 'photo' ? setPagePhoto : setPageParticipant;
  const totalPages = Math.ceil(activeList.length / PER_PAGE);
  const pageEntries = activeList.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      <div className="flex items-end justify-between mb-10 flex-wrap gap-6">
        <div className="enter-1">
          <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4">Concurso</p>
          <h1 className="font-display text-5xl italic text-ink leading-none" style={{ letterSpacing: '-0.02em' }}>
            Ranking
          </h1>
          {updatedAt && (
            <p className="text-2xs text-ink-muted font-mono mt-3">
              {updatedAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              {tab === 'photo'
                ? byPhoto.length > 0 && <span className="ml-3">{byPhoto.length} foto{byPhoto.length !== 1 ? 's' : ''}</span>
                : byParticipant.length > 0 && <span className="ml-3">{byParticipant.length} participante{byParticipant.length !== 1 ? 's' : ''}</span>
              }
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

      {!restricted && (
        <div className="flex gap-1 mb-6 enter-2">
          <button
            onClick={() => setTab('photo')}
            className={`px-4 py-1.5 rounded-sm text-xs font-mono transition-colors duration-150 ${
              tab === 'photo' ? 'bg-surface-raised text-ink' : 'text-ink-muted hover:text-ink hover:bg-surface-raised/50'
            }`}
          >
            Por foto
          </button>
          <button
            onClick={() => setTab('participant')}
            className={`px-4 py-1.5 rounded-sm text-xs font-mono transition-colors duration-150 ${
              tab === 'participant' ? 'bg-surface-raised text-ink' : 'text-ink-muted hover:text-ink hover:bg-surface-raised/50'
            }`}
          >
            Por nota
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-24 text-ink-muted text-xs font-mono enter-3">carregando…</div>
      ) : restricted ? (
        <div className="text-center py-24 enter-3">
          <p className="font-display text-6xl italic text-ink-ghost/20 mb-4" style={{ letterSpacing: '-0.03em' }}>—</p>
          <p className="text-sm text-ink-muted">O ranking estará disponível ao encerramento do concurso.</p>
        </div>
      ) : activeList.length === 0 ? (
        <div className="text-center py-24 enter-3">
          <p className="font-display text-6xl italic text-ink-ghost/20 mb-4" style={{ letterSpacing: '-0.03em' }}>—</p>
          <p className="text-xs text-ink-muted font-mono">
            {tab === 'photo' ? 'Nenhuma foto ainda.' : 'Nenhum participante ainda.'}
          </p>
        </div>
      ) : (
        <>
          <div className="border border-line rounded-sm overflow-hidden enter-3">
            {pageEntries.map((entry, i) =>
              tab === 'photo' ? (
                <PhotoRankingRow
                  key={entry.photoId}
                  entry={entry}
                  position={(page - 1) * PER_PAGE + i + 1}
                  delay={i * 40}
                />
              ) : (
                <ParticipantRankingRow
                  key={entry.userId}
                  entry={entry}
                  position={(page - 1) * PER_PAGE + i + 1}
                  delay={i * 40}
                />
              )
            )}
          </div>
          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </>
      )}

      <p className="text-center text-2xs text-ink-muted font-mono mt-10">F5 para recarregar</p>
    </div>
  );
}
