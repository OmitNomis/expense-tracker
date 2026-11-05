import { formatCurrency } from "../utils/helpers";

interface BarChartProps {
  data: Array<{ date: string; amount: number }>;
  currency: string;
  onDateClick?: (date: string) => void;
}

export default function BarChart({
  data,
  currency,
  onDateClick,
}: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="font-bold text-gray-600">No data to display</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="relative">
      {/* Grid lines */}
      <div className="flex absolute inset-0 flex-col justify-between pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full border-t border-gray-200" />
        ))}
      </div>

      {/* Y-axis labels */}
      <div className="flex absolute top-0 left-0 flex-col justify-between pr-2 h-full text-xs font-bold text-gray-600">
        {[...Array(5)].map((_, i) => {
          const value = (maxAmount * (4 - i)) / 4;
          return (
            <div key={i} className="transform -translate-y-1/2">
              {formatCurrency(value, currency)}
            </div>
          );
        })}
      </div>

      {/* Chart area */}
      <div className="ml-16 h-64 flex items-end justify-start gap-1 p-4 overflow-x-auto min-h-[300px] sm:min-h-[400px]">
        {data.map((item, index) => {
          const height =
            maxAmount > 0 ? (item.amount / maxAmount) * 200 + 4 : 4;
          const date = new Date(item.date);

          return (
            <div
              key={item.date}
              className="flex flex-col items-center group relative min-w-[16px]">
              <div
                className={`border-4 border-black min-w-[24px] sm:min-w-[32px] hover:opacity-80 transition-colors cursor-pointer ${
                  item.amount > 0 ? "bg-yellow" : "bg-gray-200"
                }`}
                style={{ height: `${height}px` }}
                onClick={() => onDateClick && onDateClick(item.date)}
              />
              <div className="mt-2 text-xs font-bold text-black whitespace-nowrap transform origin-left -rotate-45">
                {date.getDate()}
              </div>

              {/* Tooltip */}
              <div className="hidden absolute bottom-full z-10 p-2 mb-2 text-xs font-bold text-white whitespace-nowrap bg-black rounded group-hover:block">
                {date.toLocaleDateString()}
                <br />
                {formatCurrency(item.amount, currency)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
