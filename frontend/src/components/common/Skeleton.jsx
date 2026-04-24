import clsx from 'clsx';

/**
 * Base skeleton primitive — animated shimmer block.
 */
export function Skeleton({ className, width, height, rounded = 'md' }) {
  const radius = { none: '', sm: 'rounded-sm', md: 'rounded-md', lg: 'rounded-lg', full: 'rounded-full' }[rounded] || 'rounded-md';
  return (
    <span
      className={clsx(
        'inline-block bg-surface-800 relative overflow-hidden',
        radius,
        className
      )}
      style={{ width, height }}
    >
      <span className="absolute inset-0 animate-skeleton bg-gradient-to-r from-transparent via-white/[0.025] to-transparent" />
    </span>
  );
}

export function SkeletonLine({ width = '100%', className }) {
  return <Skeleton className={clsx('h-3', className)} width={width} rounded="sm" />;
}

/**
 * Table skeleton - matches row layout with configurable columns.
 */
export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <div className="w-full">
      <div className="flex gap-4 pb-2 border-b border-surface-600/60 mb-2">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonLine key={i} width={i === 0 ? '140px' : '80px'} className="h-2.5" />
        ))}
      </div>
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 items-center">
            {Array.from({ length: cols }).map((_, c) => (
              <SkeletonLine key={c} width={c === 0 ? '140px' : c === cols - 1 ? '60px' : `${60 + (r + c) % 40}px`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * KPI row skeleton - 4 boxes matching KpiCard.
 */
export function SkeletonKpis({ count = 4 }) {
  return (
    <div className="grid grid-cols-4 gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-surface-800 rounded-lg p-3 ring-1 ring-white/[0.02]">
          <div className="flex items-center justify-between">
            <SkeletonLine width="60px" className="h-2.5" />
            <Skeleton className="h-3 w-3" rounded="sm" />
          </div>
          <SkeletonLine width="50px" className="mt-2 h-5" />
          <SkeletonLine width="80px" className="mt-1 h-2.5" />
        </div>
      ))}
    </div>
  );
}

/**
 * Tile skeleton - a dashboard tile with a title row and content.
 */
export function SkeletonTile({ height = 160 }) {
  return (
    <div className="tile p-4" style={{ height }}>
      <div className="flex items-center gap-2 mb-3">
        <Skeleton className="h-3 w-3" rounded="sm" />
        <SkeletonLine width="120px" className="h-3" />
      </div>
      <div className="space-y-2">
        <SkeletonLine width="100%" />
        <SkeletonLine width="88%" />
        <SkeletonLine width="76%" />
        <SkeletonLine width="92%" />
      </div>
    </div>
  );
}

/**
 * Dashboard-shaped skeleton for the initial Dashboard load.
 */
export function SkeletonDashboard() {
  return (
    <div className="space-y-3">
      <SkeletonKpis />
      <SkeletonTile height={180} />
      <div className="grid grid-cols-2 gap-3">
        <SkeletonTile />
        <SkeletonTile />
      </div>
      <div className="grid grid-cols-[1.6fr_1fr] gap-3">
        <SkeletonTile />
        <SkeletonTile />
      </div>
    </div>
  );
}
