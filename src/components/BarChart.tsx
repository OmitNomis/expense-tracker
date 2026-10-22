import { formatCurrency } from "../utils/helpers";

interface BarChartProps {
  data: Array<{ date: string; amount: number }>;
  currency: string;
}

export default function BarChart({ data, currency }: BarChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="font-bold text-gray-600">No data to display</p>
      </div>
    );
  }

  const maxAmount = Math.max(...data.map(d => d.amount), 1);
  
  return (
    <div className="relative">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="border-t border-gray-200 w-full" />
        ))}
      </div>
      
      {/* Y-axis labels */}
      <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs font-bold text-gray-600 pr-2">
        {[...Array(5)].map((_, i) => {
          const value = maxAmount * (4 - i) / 4;
          return (
            <div key={i} className="transform -translate-y-1/2">
              {formatCurrency(value, currency)}
            </div>
          );
        })}
      </div>
      
      {/* Chart area */}
      <div className="ml-16 h-64 flex items-end justify-start gap-1 p-4 overflow-x-auto">
        {data.map((item, index) => {
          const height = maxAmount > 0 ? (item.amount / maxAmount) * 200 + 4 : 4;
          const date = new Date(item.date);
          
          return (
            <div key={item.date} className="flex flex-col items-center group relative min-w-[16px]">
              <div
                className={`border-2 border-black min-w-[16px] hover:opacity-80 transition-colors cursor-pointer ${
                  item.amount > 0 ? 'bg-yellow' : 'bg-gray-200'
                }`}
                style={{ height: `${height}px` }}
              />
              <div className="text-xs font-bold text-black mt-1 transform -rotate-45 origin-left whitespace-nowrap">
                {date.getDate()}
              </div>
              
              {/* Tooltip */}
              <div className="absolute bottom-full mb-2 hidden group-hover:block bg-black text-white p-2 rounded text-xs font-bold whitespace-nowrap z-10">
                {date.toLocaleDateString()}<br/>
                {formatCurrency(item.amount, currency)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
