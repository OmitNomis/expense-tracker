import { formatCurrency } from "../utils/helpers";
import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useEffect, useState } from "react";

interface PieChartProps {
  data: Array<{ category: string; amount: number }>;
  currency: string;
}

// Default colors as fallback
const DEFAULT_COLORS = [
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

interface CategoryWithColor {
  name: string;
  color: string;
}

export default function PieChart({ data, currency }: PieChartProps) {
  const userSettings = useQuery(api.settings.getUserSettings);
  const [categoryColors, setCategoryColors] = useState<Map<string, string>>(new Map());
  
  // Initialize category colors from user settings or defaults
  useEffect(() => {
    const colorMap = new Map<string, string>();
    
    if (userSettings?.categories && userSettings.categories.length > 0) {
      // Use user's custom categories
      userSettings.categories.forEach((cat: CategoryWithColor) => {
        colorMap.set(cat.name, cat.color);
      });
    }
    
    // Set default colors for any categories not in user's custom list
    data.forEach((item, index) => {
      if (!colorMap.has(item.category)) {
        colorMap.set(item.category, DEFAULT_COLORS[index % DEFAULT_COLORS.length]);
      }
    });
    
    setCategoryColors(colorMap);
  }, [userSettings, data]);
  if (data.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <p className="font-bold text-gray-600">No data to display</p>
      </div>
    );
  }

  const total = data.reduce((sum, item) => sum + item.amount, 0);

  // Handle single category case
  if (data.length === 1) {
    const categoryColor = categoryColors.get(data[0].category) || DEFAULT_COLORS[0];
    
    return (
      <div className="flex flex-col items-center">
        <div className="relative">
          <svg width="240" height="240" className="border-4 border-black">
            <circle
              cx="120"
              cy="120"
              r="80"
              fill={categoryColor}
              stroke="#000"
              strokeWidth="2"
            />
          </svg>
        </div>

        {/* Legend */}
        <div className="mt-4 space-y-2 w-full">
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center">
              <div
                className="w-4 h-4 border-2 border-black"
                style={{ backgroundColor: categoryColor }}
              />
              <span className="text-sm font-bold text-black">
                {data[0].category}
              </span>
            </div>
            <div className="text-right">
              <div className="text-sm font-black text-black">
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
            
            // Get color from user's custom categories or fall back to default
            const categoryColor = categoryColors.get(item.category) || DEFAULT_COLORS[index % DEFAULT_COLORS.length];

            return (
              <path
                key={item.category}
                d={pathData}
                fill={categoryColor}
                stroke="#000"
                strokeWidth="2"
                className="cursor-pointer hover:opacity-80"
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
              className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <div
                  className="w-4 h-4 border-2 border-black"
                  style={{ backgroundColor: categoryColors.get(item.category) || DEFAULT_COLORS[index % DEFAULT_COLORS.length] }}
                />
                <span className="text-sm font-bold text-black">
                  {item.category}
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm font-black text-black">
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
