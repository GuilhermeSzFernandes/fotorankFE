const SIZES = {
  xs:  'w-5  h-5  text-[8px]',
  sm:  'w-6  h-6  text-[9px]',
  md:  'w-8  h-8  text-[10px]',
  lg:  'w-10 h-10 text-xs',
  xl:  'w-16 h-16 text-base',
  '2xl': 'w-20 h-20 text-lg',
};

export default function Avatar({ name = '', avatar, size = 'md', className = '' }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials = parts.length >= 2
    ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
    : (parts[0]?.[0] ?? '?').toUpperCase();

  const base = `${SIZES[size]} rounded-full shrink-0 object-cover border border-line ${className}`;

  if (avatar) {
    return <img src={avatar} alt={name} className={base} />;
  }

  return (
    <div className={`${base} bg-surface-raised flex items-center justify-center font-medium text-ink-muted`}>
      {initials}
    </div>
  );
}
