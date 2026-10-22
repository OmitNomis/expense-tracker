export function formatCurrency(amount: number, currency: string): string {
  const currencyMap: Record<string, { symbol: string; decimals: number }> = {
    JPY: { symbol: "¥", decimals: 0 },
    USD: { symbol: "$", decimals: 2 },
    EUR: { symbol: "€", decimals: 2 },
    GBP: { symbol: "£", decimals: 2 },
    CNY: { symbol: "¥", decimals: 2 },
    KRW: { symbol: "₩", decimals: 0 },
  };

  const config = currencyMap[currency] || { symbol: currency, decimals: 2 };

  return `${config.symbol}${amount.toLocaleString(undefined, {
    minimumFractionDigits: config.decimals,
    maximumFractionDigits: config.decimals,
  })}`;
}

export function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function getCustomMonthRange(
  date: Date,
  startDay: number
): { start: string; end: string } {
  const year = date.getFullYear();
  const month = date.getMonth();

  // Always start from the specified start day of the selected month
  const startDate = new Date(year, month, startDay + 1);

  // End date is the day before the start day of the next month
  const endDate = new Date(year, month + 1, startDay);

  // Handle edge cases for months with fewer days
  if (isNaN(startDate.getTime())) {
    // If startDay is invalid for this month (e.g., 31 in February),
    // use the last day of the month
    startDate.setDate(1); // Set to first day of month
    startDate.setMonth(month); // Ensure correct month
    const lastDay = new Date(year, month + 1, 0).getDate();
    startDate.setDate(Math.min(startDay, lastDay));
  }

  if (isNaN(endDate.getTime())) {
    // If end date is invalid, use the last day of the next month
    endDate.setDate(1); // Set to first day of next month
    endDate.setMonth(month + 1); // Ensure next month
    const lastDay = new Date(year, month + 2, 0).getDate();
    endDate.setDate(Math.min(startDay - 1, lastDay));
  }

  return {
    start: startDate.toISOString().split("T")[0],
    end: endDate.toISOString().split("T")[0],
  };
}

export function getCurrentCustomMonth(startDay: number): string {
  const now = new Date();
  const range = getCustomMonthRange(now, startDay);
  const startDate = new Date(range.start);

  return `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, "0")}`;
}
