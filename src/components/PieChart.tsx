import { formatCurrency } from "../utils/helpers";

interface PieChartProps {
  data: Array<{ category: string; amount: number }>;
  currency: string;
}

const COLORS = [
  "#FFD600", // Yellow
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Light Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Gold
  "#BB8FCE", // Lavender
];

export default function PieChart({ data, currency }: PieChartProps) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center">
        <p className="font-bold text-gray-600">No data to display</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  // Handle single category case
  if (data.length === 1) {
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="240" height="240" className="border-4 border-black">
            <circle
              cx="120"
              cy="120"
              r="80"
              fill={COLORS[0]}
              stroke="#000"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2 w-full">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="w-4 h-4 border-2 border-black"
                style={{ backgroundColor: COLORS[0] }}
              />
              <span className="font-bold text-black text-sm">
                {data[0].category}
              </span>
            </div>
            <div className="text-right">
              <div className="font-black text-black text-sm">
                {formatCurrency(data[0].amount, currency)}
              </div>
              <div className="text-xs font-bold text-gray-600">100.0%</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let currentAngle = 0;
  const radius = 80;
  const centerX = 120;
  const centerY = 120;

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg width="240" height="240" className="border-4 border-black">
          {data.map((item, index) => {
            const angle = (item.amount / total) * 360;

            const startAngle = currentAngle;
            const endAngle = currentAngle + angle;

            const startAngleRad = (startAngle * Math.PI) / 180;
            const endAngleRad = (endAngle * Math.PI) / 180;

            const x1 = centerX + radius * Math.cos(startAngleRad);
            const y1 = centerY + radius * Math.sin(startAngleRad);
            const x2 = centerX + radius * Math.cos(endAngleRad);
            const y2 = centerY + radius * Math.sin(endAngleRad);

            const largeArcFlag = angle > 180 ? 1 : 0;

            const pathData = [
              `M ${centerX} ${centerY}`,
              `L ${x1} ${y1}`,
              `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
              "Z",
            ].join(" ");

            currentAngle += angle;

            return (
              <path
                key={item.category}
                d={pathData}
                fill={COLORS[index % COLORS.length]}
                stroke="#000"
                strokeWidth="2"
                className="hover:opacity-80 cursor-pointer"
              />
            );
          })}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 space-y-2 w-full">
        {data.map((item, index) => {
          const percentage = ((item.amount / total) * 100).toFixed(1);
          return (
            <div
              key={item.category}
              className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-4 h-4 border-2 border-black"
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                />
                <span className="font-bold text-black text-sm">
                  {item.category}
                </span>
              </div>
              <div className="text-right">
                <div className="font-black text-black text-sm">
                  {formatCurrency(item.amount, currency)}
                </div>
                <div className="text-xs font-bold text-gray-600">
                  {percentage}%
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
