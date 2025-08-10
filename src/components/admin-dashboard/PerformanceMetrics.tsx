interface PerformanceMetricsProps {
  title: string;
  value: string;
  className?: string;
}

export default function PerformanceMetrics({ title, value, className = "" }: PerformanceMetricsProps) {
  return (
    <div className={`rounded-lg shadow-lg p-6 ${className}`}>
      <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wide">{title}</h3>
      <p className="mt-2 text-3xl font-bold">{value}</p>
    </div>
  );
}
