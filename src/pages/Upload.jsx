import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const PHASE_BANNER = {
  waiting:    { text: 'As inscrições ainda não foram abertas.',               cls: 'text-ink-muted border-line bg-surface' },
  evaluation: { text: 'O período de inscrições foi encerrado. Suas fotos estão em avaliação.', cls: 'text-amber-400/80 border-amber-900/30 bg-amber-900/5' },
  closed:     { text: 'O concurso foi encerrado.',                            cls: 'text-green-500/80 border-green-900/30 bg-green-900/5' },
};

function FullscreenModal({ photo, onClose }) {
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={handleBackdrop}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-9 h-9 flex items-center justify-center rounded-sm bg-white/10 text-white hover:bg-white/20 transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
      <img
        src={photo.url}
        alt={photo.originalName}
        className="max-w-full max-h-full object-contain select-none"
        style={{ maxHeight: '95vh', maxWidth: '95vw' }}
      />
      {(photo.location || photo.equipment || photo.description) && (
        <div className="absolute bottom-4 left-4 max-w-sm flex flex-col gap-2 bg-black/50 backdrop-blur-sm rounded-sm px-4 py-3 pointer-events-none">
          {photo.location && (
            <div>
              <p className="text-2xs text-white/40 uppercase tracking-widest">Local</p>
              <p className="text-xs text-white/80">{photo.location}</p>
            </div>
          )}
          {photo.equipment && (
            <div>
              <p className="text-2xs text-white/40 uppercase tracking-widest">Equipamento</p>
              <p className="text-xs text-white/80">{photo.equipment}</p>
            </div>
          )}
          {photo.description && (
            <div>
              <p className="text-2xs text-white/40 uppercase tracking-widest">Descrição</p>
              <p className="text-xs text-white/80 whitespace-pre-wrap">{photo.description}</p>
            </div>
          )}
        </div>
      )}
      <p className="absolute bottom-4 right-4 text-2xs text-white/40 font-mono">
        {photo.originalName}
      </p>
    </div>
  );
}

function DetailsModal({ slotIndex, pending, onSave, onClose }) {
  const [location, setLocation]       = useState(pending.location || '');
  const [equipment, setEquipment]     = useState(pending.equipment || '');
  const [description, setDescription] = useState(pending.description || '');

  const handleBackdrop = useCallback((e) => {
    if (e.target === e.currentTarget) onClose();
  }, [onClose]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  function handleSave() {
    onSave(slotIndex, {
      location: location.trim(),
      equipment: equipment.trim(),
      description: description.trim(),
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
      onClick={handleBackdrop}
    >
      <div className="bg-base border border-line rounded-sm w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <p className="text-2xs text-ink-muted uppercase tracking-widest">Detalhes da foto</p>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-surface border border-line flex items-center justify-center text-ink-muted hover:text-ink transition-colors"
            title="Fechar"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="p-5 flex flex-col gap-4">
          <div className="aspect-video overflow-hidden rounded-sm border border-line bg-surface">
            <img src={pending.previewUrl} alt="pré-visualização" className="w-full h-full object-contain" />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-2xs text-ink-muted uppercase tracking-widest">Local</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={120}
              placeholder="Onde a foto foi tirada"
              className="field py-2 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-2xs text-ink-muted uppercase tracking-widest">Equipamento</label>
            <input
              type="text"
              value={equipment}
              onChange={(e) => setEquipment(e.target.value)}
              maxLength={120}
              placeholder="Câmera, lente, etc."
              className="field py-2 text-xs"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-2xs text-ink-muted uppercase tracking-widest">Descrição</label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              placeholder="Conte sobre a foto (opcional)"
              className="field py-2 text-xs resize-none"
            />
            <p className="text-2xs text-ink-ghost font-mono self-end">{description.length}/500</p>
          </div>

          <button onClick={handleSave} className="btn-primary">
            Salvar detalhes
          </button>
        </div>
      </div>
    </div>
  );
}

function GallerySlot({ photo, pending, uploading, uploadingThis, onFile, onRemovePending, onEditPending, onDeletePhoto, onPhotoClick, fileRef, index, canEdit }) {
  // Foto já confirmada
  if (photo) {
    return (
      <div
        className="relative aspect-square overflow-hidden rounded-sm border border-line group"
        style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms both` }}
      >
        <button
          onClick={() => onPhotoClick(photo)}
          className="w-full h-full focus:outline-none"
          title="Ver em tela cheia"
        >
          <img src={photo.url} alt={photo.originalName} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        </button>
        <div className="absolute inset-0 bg-base/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3 pointer-events-none">
          <p className="text-2xs text-ink-secondary font-mono">{new Date(photo.createdAt).toLocaleDateString('pt-BR')}</p>
        </div>
        {canEdit && (
          <button
            onClick={(e) => { e.stopPropagation(); onDeletePhoto(photo.id); }}
            className="absolute top-2 right-2 w-7 h-7 rounded-full bg-base/80 border border-line flex items-center justify-center text-ink-muted
                       opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity duration-200
                       hover:text-red-400 hover:border-red-900/60 active:scale-95"
            title="Remover foto"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // Preview pendente
  if (pending) {
    const hasDetails = !!(pending.location || pending.equipment || pending.description);
    return (
      <div className="relative aspect-square overflow-hidden rounded-sm border border-ink-muted/40 group"
        style={{ animation: `fadeUp 0.3s cubic-bezier(0.16,1,0.3,1) both` }}
      >
        <button
          onClick={onEditPending}
          disabled={uploadingThis}
          className="w-full h-full focus:outline-none cursor-pointer"
          title="Adicionar detalhes (local, equipamento, descrição)"
        >
          <img src={pending.previewUrl} alt="pré-visualização" className="w-full h-full object-cover" />
        </button>
        {uploadingThis && (
          <div className="absolute inset-0 bg-base/60 flex items-center justify-center">
            <svg className="animate-spin text-white" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
          </div>
        )}
        {!uploadingThis && (
          <div className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 px-2 py-1.5 bg-base/70 pointer-events-none">
            {hasDetails ? (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-green-500/90 shrink-0">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span className="text-2xs text-ink-secondary font-mono truncate">detalhes</span>
              </>
            ) : (
              <>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-ink-muted shrink-0">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                <span className="text-2xs text-ink-muted font-mono truncate">detalhes</span>
              </>
            )}
          </div>
        )}
        {!uploadingThis && (
          <button
            onClick={(e) => { e.stopPropagation(); onRemovePending(); }}
            className="absolute top-2 right-2 w-6 h-6 rounded-full bg-base/80 border border-line flex items-center justify-center text-ink-muted hover:text-ink hover:border-ink-secondary transition-colors"
            title="Remover"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        )}
      </div>
    );
  }

  // Slot vazio — clicável apenas se inscrições abertas
  if (!canEdit) {
    return (
      <div
        className="relative aspect-square rounded-sm border border-dashed border-line/40 flex flex-col items-center justify-center gap-3 opacity-40"
        style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms both` }}
      >
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-ink-ghost">
          <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
      </div>
    );
  }

  return (
    <label
      className="relative aspect-square rounded-sm border border-dashed border-line-strong hover:border-ink-muted transition-colors duration-200 cursor-pointer flex flex-col items-center justify-center gap-3 group"
      style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${index * 80}ms both` }}
    >
      <div className="text-ink-muted group-hover:text-ink-secondary transition-colors duration-200">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </div>
      <p className="text-2xs text-ink-muted group-hover:text-ink-secondary transition-colors font-mono">escolher foto</p>
      <input ref={fileRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={onFile} disabled={uploading} />
    </label>
  );
}

export default function Upload() {
  const { user } = useAuth();
  const [photos, setPhotos]   = useState([]);
  const [pendings, setPendings] = useState({});
  const [uploading, setUploading] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState(null);
  const [error, setError]   = useState('');
  const [success, setSuccess] = useState('');
  const [phase, setPhase] = useState(null);
  const [modalPhoto, setModalPhoto] = useState(null);
  const [detailsSlot, setDetailsSlot] = useState(null);
  const fileRefs = [useRef(), useRef(), useRef()];

  const canEdit = phase === 'registration';

  async function loadPhotos() {
    try {
      const { data } = await axios.get('/api/photos/my');
      setPhotos(data);
    } catch {
      setError('Erro ao carregar fotos.');
    }
  }

  async function loadPhase() {
    try {
      const { data } = await axios.get('/api/contest/config');
      setPhase(data.phase);
    } catch {
      setPhase('waiting');
    }
  }

  useEffect(() => { loadPhotos(); loadPhase(); }, []);

  // Revoga URLs ao desmontar
  useEffect(() => {
    return () => {
      Object.values(pendings).forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, []);

  function handleFileSelect(slotIndex, e) {
    const file = e.target.files[0];
    if (!file) return;
    setError('');
    setSuccess('');

    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      setError('Apenas imagens JPG ou PNG são aceitas.');
      if (fileRefs[slotIndex].current) fileRefs[slotIndex].current.value = '';
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      if (img.naturalWidth < 800 || img.naturalHeight < 600) {
        URL.revokeObjectURL(previewUrl);
        setError(`Resolução mínima é 800×600 px. Sua foto tem ${img.naturalWidth}×${img.naturalHeight} px.`);
        if (fileRefs[slotIndex].current) fileRefs[slotIndex].current.value = '';
        return;
      }
      // Revoga preview anterior deste slot, se existir
      setPendings((prev) => {
        if (prev[slotIndex]) URL.revokeObjectURL(prev[slotIndex].previewUrl);
        return { ...prev, [slotIndex]: { file, previewUrl, location: '', equipment: '', description: '' } };
      });
      if (fileRefs[slotIndex].current) fileRefs[slotIndex].current.value = '';
    };
    img.onerror = () => {
      URL.revokeObjectURL(previewUrl);
      setError('Não foi possível ler a imagem.');
      if (fileRefs[slotIndex].current) fileRefs[slotIndex].current.value = '';
    };
    img.src = previewUrl;
  }

  function handleSaveDetails(slotIndex, values) {
    setPendings((prev) => {
      if (!prev[slotIndex]) return prev;
      return { ...prev, [slotIndex]: { ...prev[slotIndex], ...values } };
    });
    setDetailsSlot(null);
  }

  function handleRemovePending(slotIndex) {
    setPendings((prev) => {
      if (prev[slotIndex]) URL.revokeObjectURL(prev[slotIndex].previewUrl);
      const next = { ...prev };
      delete next[slotIndex];
      return next;
    });
    if (fileRefs[slotIndex].current) fileRefs[slotIndex].current.value = '';
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
    const slots = Object.keys(pendings).map(Number).sort();
    if (slots.length === 0) return;
    setError('');
    setSuccess('');
    setUploading(true);
    let sent = 0;

    for (const slot of slots) {
      const { file, previewUrl, location, equipment, description } = pendings[slot];
      setUploadingSlot(slot);
      const fd = new FormData();
      fd.append('photo', file);
      if (location)    fd.append('location', location);
      if (equipment)   fd.append('equipment', equipment);
      if (description) fd.append('description', description);
      try {
        await axios.post('/api/photos', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
        URL.revokeObjectURL(previewUrl);
        setPendings((prev) => {
          const next = { ...prev };
          delete next[slot];
          return next;
        });
        sent++;
      } catch (err) {
        setError(err.response?.data?.message || `Erro ao enviar foto ${slot + 1}.`);
        break;
      }
    }

    setUploading(false);
    setUploadingSlot(null);
    if (sent > 0) {
      setSuccess(`${sent} foto${sent > 1 ? 's adicionadas' : ' adicionada'} ao portfólio.`);
      loadPhotos();
    }
  }

  const pendingCount = Object.keys(pendings).length;
  const remaining = 3 - photos.length;

  return (
    <div className="max-w-2xl mx-auto px-6 py-14">
      {modalPhoto && (
        <FullscreenModal photo={modalPhoto} onClose={() => setModalPhoto(null)} />
      )}

      {detailsSlot !== null && pendings[detailsSlot] && (
        <DetailsModal
          slotIndex={detailsSlot}
          pending={pendings[detailsSlot]}
          onSave={handleSaveDetails}
          onClose={() => setDetailsSlot(null)}
        />
      )}

      <div className="mb-12">
        <p className="text-2xs text-ink-muted uppercase tracking-widest mb-4 enter-1">Portfólio</p>
        <h1 className="font-display text-5xl italic text-ink leading-none enter-2" style={{ letterSpacing: '-0.02em' }}>
          Suas fotos
        </h1>
        <p className="text-xs text-ink-secondary mt-3 enter-3">
          {user?.name} · {photos.length}/3 enviadas
          {canEdit && remaining > 0 && ` · ${remaining} ${remaining > 1 ? 'envios disponíveis' : 'envio disponível'}`}
        </p>
      </div>

      {phase && phase !== 'registration' && PHASE_BANNER[phase] && (
        <div className={`text-xs mb-8 px-3 py-2.5 border rounded-sm enter-1 ${PHASE_BANNER[phase].cls}`}>
          {PHASE_BANNER[phase].text}
        </div>
      )}

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
            pending={!photos[i] ? pendings[i] ?? null : null}
            uploading={uploading}
            uploadingThis={uploadingSlot === i}
            onFile={(e) => handleFileSelect(i, e)}
            onRemovePending={() => handleRemovePending(i)}
            onEditPending={() => setDetailsSlot(i)}
            onDeletePhoto={handleDeletePhoto}
            onPhotoClick={setModalPhoto}
            fileRef={fileRefs[i]}
            canEdit={canEdit}
          />
        ))}
      </div>

      {/* Ações */}
      {pendingCount > 0 && canEdit && (
        <div className="flex items-center gap-3 mb-6 enter-1">
          <button
            onClick={handleConfirmUpload}
            disabled={uploading}
            className="btn-primary flex-1"
          >
            {uploading
              ? 'Enviando…'
              : `Enviar ${pendingCount} foto${pendingCount > 1 ? 's' : ''}`}
          </button>
          <button
            onClick={() => {
              Object.values(pendings).forEach((p) => URL.revokeObjectURL(p.previewUrl));
              setPendings({});
            }}
            disabled={uploading}
            className="px-4 py-2 text-xs text-ink-muted border border-line rounded-sm hover:border-ink-secondary hover:text-ink-secondary transition-colors"
          >
            Cancelar tudo
          </button>
        </div>
      )}

      {remaining === 0 && pendingCount === 0 && (
        <div className="text-xs text-ink-muted px-4 py-3 border border-line rounded-sm enter-4">
          Limite de 3 fotos atingido. Seu portfólio está completo.
        </div>
      )}

      <div className="mt-14 pt-6 border-t border-line enter-5">
        <p className="text-2xs text-ink-muted">JPG · PNG · máx. 30 MB · mín. 800×600 px</p>
      </div>

    </div>
  );
}
