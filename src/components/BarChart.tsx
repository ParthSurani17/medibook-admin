export interface BarChartDatum {
  label: string;
  value: number;
}

interface BarChartProps {
  data: BarChartDatum[];
  color?: string;
  height?: number;
}

export default function BarChart({ data, color = "#3366FF", height = 200 }: BarChartProps) {
  const max = Math.max(...data.map((d) => d.value), 1);
  const barWidth = 100 / data.length;

  return (
    <div>
      <svg
        viewBox={`0 0 100 ${height / 10}`}
        preserveAspectRatio="none"
        className="w-full"
        style={{ height }}
      >
        {data.map((d, i) => {
          const barHeight = (d.value / max) * (height / 10 - 6);
          const x = i * barWidth + barWidth * 0.2;
          const y = height / 10 - barHeight - 3;
          return (
            <rect
              key={d.label}
              x={x}
              y={y}
              width={barWidth * 0.6}
              height={barHeight}
              rx="1"
              fill={color}
              opacity={0.85}
            />
          );
        })}
      </svg>
      <div className="mt-2 flex text-[11px] text-ink-400">
        {data.map((d) => (
          <div key={d.label} style={{ width: `${barWidth}%` }} className="text-center">
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
