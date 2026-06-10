import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function GallerySlot({ photo, isUploadSlot, uploading, onFile, fileRef, index }) {
  if (photo) {
    return (
      <div
        className="relative aspect-square overflow-hidden rounded-sm border border-line group"
        style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms both` }}
      >
        <img src={photo.url} alt={photo.originalName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-base/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
          <p className="text-2xs text-ink/70 font-mono truncate">{photo.originalName}</p>
          <p className="text-2xs text-ink-secondary font-mono">{new Date(photo.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
        {/* Slot number */}
        <div className="absolute top-2 left-2">
          <span className="font-mono text-2xs text-white/40">0{index + 1}</span>
        </div>
      </div>
    );
  }

  if (isUploadSlot) {
    return (
      <label
        className="relative aspect-square rounded-sm border border-dashed border-line-strong hover:border-ink-muted transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 group"
        style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms both` }}
      >
        <div className="text-ink-muted group-hover:text-ink-secondary transition-colors duration-200">
          {uploading ? (
            <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </div>
        <p className="text-2xs text-ink-muted group-hover:text-ink-secondary transition-colors font-mono">
          {uploading ? 'enviando…' : 'enviar foto'}
        </p>
        <span className="absolute top-2 left-2 font-mono text-2xs text-ink-ghost/40">0{index + 1}</span>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} disabled={uploading} />
      </label>
    );
  }

  return (
    <div
      className="aspect-square rounded-sm border border-line/40 flex items-center justify-center"
      style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms both` }}
    >
      <span className="font-mono text-2xs text-ink-ghost/30">0{index + 1}</span>
    </div>
  );
}

export default function Upload() {
  const { user } = useAuth();
  const [photos, setPhotos] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileRef = useRef();

  async function loadPhotos() {
    try {
      const { data } = await axios.get('/api/photos/my');
      setPhotos(data);
    } catch {
      setError('Erro ao carregar fotos.');
    }
  }

  useEffect(() => { loadPhotos(); }, []);

  async function handleUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setSuccess('');
    setUploading(true);
    const fd = new FormData();
    fd.append('photo', file);
    try {
      await axios.post('/api/photos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSuccess('Foto adicionada ao portfólio.');
      loadPhotos();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar foto.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const remaining = 3 - photos.length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">

      {/* Header */}
      <div className="mb-12">
        <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4 enter-1">Portfólio</p>
        <h1 className="font-display text-5xl italic text-ink leading-none enter-2" style={{ letterSpacing: '-0.02em' }}>
          Suas fotos
        </h1>
        <p className="text-xs text-ink-secondary mt-3 enter-3">
          {user?.name} · {photos.length}/3 enviadas
          {remaining > 0 && ` · ${remaining} vaga${remaining > 1 ? 's' : ''} disponível`}
        </p>
      </div>

      {/* Notifications */}
      {error && (
        <div className="text-red-400/80 text-xs mb-6 px-3 py-2.5 border border-red-900/30 rounded-sm bg-red-900/5 enter-1">
          {error}
        </div>
      )}
      {success && (
        <div className="text-green-500/80 text-xs mb-6 px-3 py-2.5 border border-green-900/30 rounded-sm bg-green-900/5 enter-1">
          {success}
        </div>
      )}

      {/* Gallery grid */}
      <div className="grid grid-cols-3 gap-3 mb-10">
        {[0, 1, 2].map((i) => (
          <GallerySlot
            key={i}
            index={i}
            photo={photos[i]}
            isUploadSlot={!photos[i] && i === photos.length && remaining > 0}
            uploading={uploading}
            onFile={handleUpload}
            fileRef={i === photos.length ? fileRef : undefined}
          />
        ))}
      </div>

      {/* Limit reached */}
      {remaining === 0 && (
        <div className="text-xs text-ink-muted px-4 py-3 border border-line rounded-sm enter-4">
          Limite de 3 fotos atingido. Seu portfólio está completo.
        </div>
      )}

      {/* Footer note */}
      <div className="mt-14 pt-6 border-t border-line enter-5">
        <p className="text-2xs text-ink-muted">JPEG · PNG · WebP · máx. 10 MB por foto</p>
      </div>

    </div>
  );
}
