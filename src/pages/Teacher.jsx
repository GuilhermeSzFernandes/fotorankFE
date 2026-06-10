import { useState, useEffect } from 'react';
import axios from 'axios';
import Avatar from '../components/Avatar';

export default function Teacher() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [scores, setScores] = useState({});
  const [comments, setComments] = useState({});
  const [filter, setFilter] = useState('pending');

  async function loadPhotos() {
    try {
      const { data } = await axios.get('/api/grades');
      setPhotos(data);
      const s = {};
      const c = {};
      data.forEach((p) => {
        if (p.myGrade) { s[p.id] = p.myGrade.score; c[p.id] = p.myGrade.comment || ''; }
      });
      setScores(s);
      setComments(c);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadPhotos(); }, []);

  async function handleGrade(photoId) {
    const score = Number(scores[photoId]);
    if (!score || score < 1 || score > 10) return;
    setSaving((s) => ({ ...s, [photoId]: true }));
    try {
      await axios.post('/api/grades', { photoId, score, comment: comments[photoId] || '' });
      await loadPhotos();
    } finally {
      setSaving((s) => ({ ...s, [photoId]: false }));
    }
  }

  const graded = photos.filter((p) => p.myGrade).length;
  const filtered = photos.filter((p) =>
    filter === 'all' ? true : filter === 'pending' ? !p.myGrade : !!p.myGrade
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-48px)] text-ink-muted text-xs font-mono">
        carregando…
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-14">
      <div className="flex items-end justify-between mb-12 flex-wrap gap-6">
        <div className="enter-1">
          <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4">Júri</p>
          <h1 className="font-display text-5xl italic text-ink leading-none" style={{ letterSpacing: '-0.02em' }}>
            Avaliação
          </h1>
          <p className="text-xs text-ink-secondary mt-3">
            <span className="font-mono text-ink">{graded}</span> de{' '}
            <span className="font-mono">{photos.length}</span> fotos avaliadas
          </p>
        </div>

        <div className="flex items-center bg-surface border border-line rounded-sm p-1 gap-0.5 enter-2">
          {[['pending', 'Pendentes'], ['graded', 'Avaliadas'], ['all', 'Todas']].map(([v, l]) => (
            <button key={v} onClick={() => setFilter(v)}
              className={`px-3 py-1.5 rounded-sm text-xs transition-colors duration-150 ${
                filter === v ? 'bg-surface-raised text-ink' : 'text-ink-secondary hover:text-ink'
              }`}>
              {l}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full bg-surface-raised rounded-full h-px mb-10 enter-3 overflow-hidden">
        <div
          className="bg-ink-secondary h-px transition-all duration-700 ease-out rounded-full"
          style={{ width: photos.length > 0 ? `${(graded / photos.length) * 100}%` : '0%' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-24 text-ink-muted text-xs font-mono enter-3">
          {filter === 'pending' ? '— todas avaliadas —' : '— nenhuma foto —'}
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((photo, i) => (
            <div
              key={photo.id}
              className="flex gap-5 p-5 bg-surface border border-line rounded-sm hover:border-line-strong transition-colors duration-150"
              style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${i * 50}ms both` }}
            >
              <div className="w-20 h-20 rounded-sm overflow-hidden border border-line shrink-0">
                <img src={photo.url} alt={photo.originalName} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Avatar name={photo.ownerName} avatar={photo.ownerAvatar} size="sm" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink">{photo.ownerName}</p>
                      <p className="text-2xs text-ink-muted font-mono mt-0.5 truncate">{photo.originalName}</p>
                    </div>
                  </div>
                  {photo.myGrade && (
                    <div className="text-right shrink-0">
                      <span className="font-display text-3xl italic text-ink" style={{ letterSpacing: '-0.02em' }}>
                        {photo.myGrade.score}
                      </span>
                      <span className="text-xs text-ink-muted">/10</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-2xs text-ink-muted uppercase tracking-widest">Nota</span>
                    <input type="number" min="1" max="10" className="field w-14 text-center py-1.5 font-mono"
                      placeholder="—"
                      value={scores[photo.id] || ''}
                      onChange={(e) => setScores((s) => ({ ...s, [photo.id]: e.target.value }))} />
                  </div>
                  <input type="text" className="field flex-1 min-w-[140px] py-1.5"
                    placeholder="Comentário (opcional)"
                    value={comments[photo.id] || ''}
                    onChange={(e) => setComments((c) => ({ ...c, [photo.id]: e.target.value }))} />
                  <button onClick={() => handleGrade(photo.id)}
                    disabled={!scores[photo.id] || saving[photo.id]}
                    className="btn-primary shrink-0">
                    {saving[photo.id] ? '…' : photo.myGrade ? 'Atualizar' : 'Salvar'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
