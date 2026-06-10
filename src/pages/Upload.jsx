import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

function GallerySlot({ photo, pending, isUploadSlot, uploading, onFile, onRemovePending, onDeletePhoto, fileRef, index }) {
  // Foto já enviada definitivamente
  if (photo) {
    const canDelete = photo.gradeCount === 0;
    return (
      <div
        className="relative aspect-square overflow-hidden rounded-sm border border-line group"
        style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms both` }}
      >
        <img src={photo.url} alt={photo.originalName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />

        {/* Overlay com info — só aparece no hover em desktop */}
        <div className="absolute inset-0 bg-base/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
          <p className="text-2xs text-ink/70 font-mono truncate">{photo.originalName}</p>
          <p className="text-2xs text-ink-secondary font-mono">{new Date(photo.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>

        {/* Número do slot */}
        <div className="absolute top-2 left-2 pointer-events-none">
          <span className="font-mono text-2xs text-white/40">0{index + 1}</span>
        </div>

        {/* Botão de remover — sempre visível no celular, hover em desktop */}
        {canDelete ? (
          <button
            onClick={() => onDeletePhoto(photo.id)}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-base/80 border border-line flex items-center justify-center text-ink-muted
                       opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200
                       hover:text-red-400 hover:border-red-900/60 active:scale-95"
            title="Remover foto"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : (
          <div
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-base/80 border border-line flex items-center justify-center
                       opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200"
            title="Foto já avaliada — não pode ser removida"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
          </div>
        )}
      </div>
    );
  }

  // Pré-visualização pendente (ainda não enviada)
  if (pending) {
    return (
      <div
        className="relative aspect-square overflow-hidden rounded-sm border border-ink-muted/40 group"
        style={{ animation: `fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both` }}
      >
        <img src={pending.previewUrl} alt="pré-visualização" className="w-full h-full object-cover" />
        {/* Overlay com badge "aguardando" */}
        <div className="absolute inset-0 bg-base/40 flex flex-col justify-between p-2">
          <div className="flex justify-between items-start">
            <span className="font-mono text-2xs text-white/40">0{index + 1}</span>
            <button
              onClick={onRemovePending}
              className="w-6 h-6 rounded-full bg-base/80 border border-line flex items-center justify-center text-ink-muted hover:text-ink hover:border-ink-secondary transition-colors"
              title="Remover"
            >
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <span className="text-2xs font-mono text-white/50 truncate">{pending.file.name}</span>
        </div>
      </div>
    );
  }

  // Slot de envio disponível
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
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          )}
        </div>
        <p className="text-2xs text-ink-muted group-hover:text-ink-secondary transition-colors font-mono">
          {uploading ? 'enviando…' : 'escolher foto'}
        </p>
        <span className="absolute top-2 left-2 font-mono text-2xs text-ink-ghost/40">0{index + 1}</span>
        <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFile} disabled={uploading} />
      </label>
    );
  }

  // Slot bloqueado
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
  const [pending, setPending] = useState(null); // { file, previewUrl }
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

  // Limpa a URL de objeto ao desmontar ou trocar pending
  useEffect(() => {
    return () => { if (pending) URL.revokeObjectURL(pending.previewUrl); };
  }, [pending]);

  function handleFileSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setSuccess('');

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth < 800 || img.naturalHeight < 600) {
        URL.revokeObjectURL(previewUrl);
        setError(`Resolução mínima é 800×600 px. Sua foto tem ${img.naturalWidth}×${img.naturalHeight} px.`);
        if (fileRef.current) fileRef.current.value = '';
        return;
      }
      if (pending) URL.revokeObjectURL(pending.previewUrl);
      setPending({ file, previewUrl });
      if (fileRef.current) fileRef.current.value = '';
    };
    img.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      setError('Não foi possível ler a imagem.');
      if (fileRef.current) fileRef.current.value = '';
    };
    img.src = previewUrl;
  }

  function handleRemovePending() {
    if (pending) URL.revokeObjectURL(pending.previewUrl);
    setPending(null);
    if (fileRef.current) fileRef.current.value = '';
  }

  async function handleDeletePhoto(photoId) {
    if (!window.confirm('Remover esta foto do portfólio?')) return;
    setError('');
    setSuccess('');
    try {
      await axios.delete(`/api/photos/${photoId}`);
      setSuccess('Foto removida.');
      loadPhotos();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao remover foto.');
    }
  }

  async function handleConfirmUpload() {
    if (!pending) return;
    setError('');
    setSuccess('');
    setUploading(true);
    const fd = new FormData();
    fd.append('photo', pending.file);
    try {
      await axios.post('/api/photos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      URL.revokeObjectURL(pending.previewUrl);
      setPending(null);
      setSuccess('Foto adicionada ao portfólio.');
      loadPhotos();
    } catch (err) {
      setError(err.response?.data?.message || 'Erro ao enviar foto.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  }

  const uploadSlotIndex = photos.length; // próximo slot disponível
  const remaining = 3 - photos.length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">

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

      <div className="grid grid-cols-3 gap-3 mb-6">
        {[0, 1, 2].map((i) => (
          <GallerySlot
            key={i}
            index={i}
            photo={photos[i]}
            pending={!photos[i] && i === uploadSlotIndex ? pending : null}
            isUploadSlot={!photos[i] && i === uploadSlotIndex && !pending && remaining > 0}
            uploading={uploading}
            onFile={handleFileSelect}
            onRemovePending={handleRemovePending}
            onDeletePhoto={handleDeletePhoto}
            fileRef={i === uploadSlotIndex ? fileRef : undefined}
          />
        ))}
      </div>

      {/* Ações da pré-visualização */}
      {pending && (
        <div className="flex items-center gap-3 mb-6 enter-1">
          <button
            onClick={handleConfirmUpload}
            disabled={uploading}
            className="btn-primary flex-1"
          >
            {uploading ? 'Enviando…' : 'Confirmar envio'}
          </button>
          <button
            onClick={handleRemovePending}
            disabled={uploading}
            className="px-4 py-2 text-xs text-ink-muted border border-line rounded-sm hover:border-ink-secondary hover:text-ink-secondary transition-colors"
          >
            Cancelar
          </button>
        </div>
      )}

      {remaining === 0 && !pending && (
        <div className="text-xs text-ink-muted px-4 py-3 border border-line rounded-sm enter-4">
          Limite de 3 fotos atingido. Seu portfólio está completo.
        </div>
      )}

      <div className="mt-14 pt-6 border-t border-line enter-5">
        <p className="text-2xs text-ink-muted">JPEG · PNG · WebP · máx. 30 MB · mín. 800×600 px</p>
      </div>

    </div>
  );
}
