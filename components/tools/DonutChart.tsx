"use client";

interface DonutChartProps {
  data: { label: string; value: number; color?: string }[];
  size?: number;
}

const DEFAULT_COLORS = [
  "#6366f1", "#06b6d4", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#84cc16",
];

export function DonutChart({ data, size = 200 }: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0) || 1;
  const radius = size * 0.35;
  const circumference = 2 * Math.PI * radius;

  const slices = data.reduce<{ key: number; label: string; value: number; percentage: number; color: string; dashArray: string; dashOffset: number }[]>((acc, item, i) => {
    const percentage = item.value / total;
    const length = percentage * circumference;
    const offset = acc.reduce((sum, s) => sum + (s.percentage * circumference), 0);
    acc.push({
      key: i,
      label: item.label,
      value: item.value,
      percentage,
      color: item.color || DEFAULT_COLORS[i % DEFAULT_COLORS.length],
      dashArray: `${length} ${circumference - length}`,
      dashOffset: -offset,
    });
    return acc;
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={size * 0.1}
        />
        {slices.map((slice) => (
          <circle
            key={slice.key}
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={slice.color}
            strokeWidth={size * 0.1}
            strokeDasharray={slice.dashArray}
            strokeDashoffset={slice.dashOffset}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            className="transition-all duration-700 ease-out"
          />
        ))}
        <text
          x={size / 2}
          y={size / 2 - 4}
          textAnchor="middle"
          className="text-lg font-bold"
          fill="currentColor"
        >
          {total.toLocaleString()}
        </text>
        <text
          x={size / 2}
          y={size / 2 + 12}
          textAnchor="middle"
          className="text-xs"
          fill="var(--color-muted)"
        >
          Total
        </text>
      </svg>

      <div className="space-y-2">
        {slices.map((slice) => (
          <div key={slice.key} className="flex items-center gap-2 text-sm">
            <span
              className="h-3 w-3 rounded-sm shrink-0"
              style={{ backgroundColor: slice.color }}
            />
            <span className="text-zinc-600 dark:text-zinc-400">{slice.label}</span>
            <span className="font-medium ml-auto">
              {(slice.percentage * 100).toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
