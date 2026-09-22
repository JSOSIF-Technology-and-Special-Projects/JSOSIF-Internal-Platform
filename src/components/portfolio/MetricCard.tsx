import React from "react";

interface MetricCardProps {
  title: string;
  value: string;
  change?: number;
  changePercent?: number;
  changeLabel?: string;
  subtitle?: string;
  icon?: React.ReactNode;
  badge?: string;
  footer?: React.ReactNode;
}

export default function MetricCard({
  title,
  value,
  change,
  changePercent,
  changeLabel = "today",
  subtitle,
  icon,
  badge,
  footer,
}: MetricCardProps) {
  const isPositive = (change ?? 0) >= 0;
  const hasChange = change !== undefined || changePercent !== undefined;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-CA", {
      style: "currency",
      currency: "CAD",
      maximumFractionDigits: 0,
    }).format(val);
  };

  return (
    <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 group">
      {/* Top subtle gradient line on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0E5791] via-[#2A8CD6] to-[#4ECDC4] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-500">
          {title}
        </span>
        <div className="flex items-center gap-2">
          {badge && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-[#0E5791]">
              {badge}
            </span>
          )}
          {icon && (
            <div className="p-2 rounded-xl bg-gray-50 text-[#0E5791] group-hover:bg-blue-50 transition-colors">
              {icon}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-bold tracking-tight text-gray-900">
          {value}
        </span>
      </div>

      {hasChange && (
        <div className="flex items-center gap-2 text-xs">
          <span
            className={`inline-flex items-center gap-0.5 px-2 py-0.5 rounded-md font-semibold ${
              isPositive
                ? "bg-emerald-50 text-emerald-700"
                : "bg-rose-50 text-rose-700"
            }`}
          >
            {isPositive ? (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M5 10l7-7m0 0l7 7m-7-7v18"
                />
              </svg>
            ) : (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2.5}
                  d="M19 14l-7 7m0 0l-7-7m7 7V3"
                />
              </svg>
            )}
            {change !== undefined && (
              <span>
                {isPositive ? "+" : ""}
                {formatCurrency(change)}
              </span>
            )}
            {changePercent !== undefined && (
              <span>
                ({isPositive ? "+" : ""}
                {changePercent.toFixed(2)}%)
              </span>
            )}
          </span>
          <span className="text-gray-400 font-medium">{changeLabel}</span>
        </div>
      )}

      {subtitle && (
        <p className="text-xs text-gray-500 font-medium mt-2">{subtitle}</p>
      )}

      {footer && (
        <div className="mt-3 pt-3 border-t border-gray-100">{footer}</div>
      )}
    </div>
  );
}
