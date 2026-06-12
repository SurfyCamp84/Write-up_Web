const categoryColors: Record<string, string> = {
  web: '#4fd1c5',
  crypto: '#fbbf24',
  pwn: '#f87171',
  rev: '#a78bfa',
  forensics: '#34d399',
  misc: '#94a3b8',
  osint: '#fb923c',
};

type CategoryBadgeProps = {
  category: string;
  size?: 'sm' | 'md';
};

export default function CategoryBadge({ category, size = 'sm' }: CategoryBadgeProps) {
  const color = categoryColors[category] ?? '#94a3b8';

  const sizeClasses =
    size === 'md' ? 'text-sm px-3 py-1 gap-2' : 'text-xs px-2 py-0.5 gap-1.5';

  return (
    <span
      className={`inline-flex items-center rounded-full font-medium ${sizeClasses}`}
      style={{
        color,
        backgroundColor: `${color}18`,
      }}
    >
      <span
        className={`rounded-full ${size === 'md' ? 'h-2.5 w-2.5' : 'h-2 w-2'}`}
        style={{ backgroundColor: color }}
      />
      {category}
    </span>
  );
}
