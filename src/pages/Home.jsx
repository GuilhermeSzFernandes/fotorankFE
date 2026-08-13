import { Link } from 'react-router-dom';

const INFO = [
  {
    label: 'Inscrições',
    detail: 'De 14/08 a 30/09/2026',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    label: 'Tema livre',
    detail: 'Carapicuíba pelos seus olhos',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
        <circle cx="12" cy="13" r="4" />
      </svg>
    ),
  },
  {
    label: 'Quem pode participar',
    detail: 'Todos os moradores de Carapicuíba',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    ),
  },
  {
    label: 'Premiação',
    detail: '1º lugar: impressora fotográfica Canon SELPHY 1500',
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="12" cy="8" r="7" />
        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88" />
      </svg>
    ),
  },
];

export default function Home() {
  return (
    <div>
      <section className="max-w-3xl mx-auto px-6 pt-16 pb-20 text-center sm:text-left">
        <p className="text-base sm:text-lg font-medium text-ink-secondary uppercase tracking-wide mb-2 enter-1">1º Concurso Fotográfico</p>
        <h1 className="font-display text-5xl sm:text-6xl italic text-ink leading-none mb-6 enter-2" style={{ letterSpacing: '-0.02em' }}>
          da Etec Carapicuíba
        </h1>
        <p className="text-2xs text-ink-muted uppercase tracking-widest mb-6 enter-3">
          Olhe · Registre · Inspire · Carapicuíba
        </p>
        <p className="text-sm text-ink-secondary leading-relaxed max-w-lg mb-10 enter-3 sm:mx-0 mx-auto">
          Mostre, através do seu olhar, a beleza, a cultura, as pessoas e os lugares que fazem de{' '}
          <span className="text-ink font-medium">Carapicuíba</span> um lugar único.
        </p>
        <div className="flex items-center gap-3 justify-center sm:justify-start enter-4">
          <Link to="/register" className="btn-primary">Inscrever-se</Link>
          <a href="#detalhes" className="btn-outline">Ver detalhes</a>
        </div>
      </section>

      <section id="detalhes" className="max-w-3xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {INFO.map((item, i) => (
            <div
              key={item.label}
              className="panel-sm"
              style={{ animation: `fadeUp 0.45s cubic-bezier(0.16,1,0.3,1) ${i * 60}ms both` }}
            >
              <div className="flex items-center gap-2 text-ink-muted mb-3">
                {item.icon}
                <p className="text-2xs uppercase tracking-widest">{item.label}</p>
              </div>
              <p className="text-sm text-ink leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24">
        <div className="panel flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <div className="w-12 h-12 rounded-full bg-warning-bg border border-warning-border flex items-center justify-center text-warning shrink-0">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
          </div>
          <div>
            <p className="text-2xs text-ink-muted uppercase tracking-widest mb-2">Prêmio</p>
            <p className="text-sm text-ink leading-relaxed">
              O vencedor leva para casa uma impressora fotográfica <span className="font-medium">Canon SELPHY 1500</span> — suas melhores memórias, impressas para sempre.
            </p>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 pb-24 text-center">
        <p className="font-display text-3xl italic text-ink leading-none mb-6" style={{ letterSpacing: '-0.02em' }}>
          Pronto para participar?
        </p>
        <div className="flex items-center gap-3 justify-center">
          <Link to="/register" className="btn-primary">Inscrever-se</Link>
          <Link to="/login" className="btn-outline">Já tenho conta</Link>
        </div>
      </section>
    </div>
  );
}
