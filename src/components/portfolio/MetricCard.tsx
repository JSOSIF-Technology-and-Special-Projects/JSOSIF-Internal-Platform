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
    <div className="relative overflow-hidden rounded-3xl bg-white border border-slate-200/80 p-5 sm:p-6 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] hover:shadow-lg hover:border-slate-300/90 transition-all duration-300 group flex flex-col justify-between">
      {/* Top subtle gradient accent on hover */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#0E5791] via-blue-500 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {title}
          </span>
          <div className="flex items-center gap-1.5">
            {badge && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-[#0E5791] border border-blue-100/60">
                {badge}
              </span>
            )}
            {icon && (
              <div className="p-2 rounded-2xl bg-slate-50 text-[#0E5791] group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                {icon}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900">
            {value}
          </span>
        </div>

        {hasChange && (
          <div className="flex flex-wrap items-center gap-1.5 text-xs mt-1">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-xs ${
                isPositive
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200/70"
                  : "bg-rose-50 text-rose-700 border border-rose-200/70"
              }`}
            >
              {isPositive ? (
                <svg
                  className="w-3 h-3"
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
                  className="w-3 h-3"
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
            <span className="text-slate-400 font-medium text-[11px]">{changeLabel}</span>
          </div>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500 font-medium mt-3 pt-3 border-t border-slate-100">{subtitle}</p>
      )}

      {footer && (
        <div className="mt-3 pt-3 border-t border-slate-100">{footer}</div>
      )}
    </div>
  );
}
