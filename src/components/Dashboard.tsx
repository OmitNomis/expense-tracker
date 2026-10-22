import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import {
  formatCurrency,
  getCustomMonthRange,
  formatDate,
} from "../utils/helpers";
import BarChart from "./BarChart";
import PieChart from "./PieChart";

export default function Dashboard() {
  const userSettings = useQuery(api.settings.getUserSettings);
  const [selectedPeriod, setSelectedPeriod] = useState<"current" | "custom">(
    "current"
  );
  const [customMonth, setCustomMonth] = useState<string>("");

  // Get current custom month range
  const currentMonthRange = useMemo(() => {
    if (!userSettings) return { start: "", end: "" };
    return getCustomMonthRange(new Date(), userSettings.monthStartDay);
  }, [userSettings]);

  // Get selected period range
  const selectedRange = useMemo(() => {
    if (selectedPeriod === "current" || !customMonth) {
      return currentMonthRange;
    }

    const [year, month] = customMonth.split("-").map(Number);
    const date = new Date(year, month - 1, userSettings?.monthStartDay || 25);
    return getCustomMonthRange(date, userSettings?.monthStartDay || 25);
  }, [selectedPeriod, customMonth, currentMonthRange, userSettings]);

  const analytics = useQuery(
    api.expenses.getSpendingAnalytics,
    selectedRange.start
      ? {
          startDate: selectedRange.start,
          endDate: selectedRange.end,
        }
      : "skip"
  );

  if (!userSettings || !analytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-4 animate-spin border-yellow border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white border-4 border-black sm:p-6 shadow-brutal">
        <h2 className="mb-4 text-2xl font-black text-black sm:text-3xl">
          📊 DASHBOARD
        </h2>

        {/* Period Selector */}
        <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center">
          {/* <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value as "current" | "custom")}
            className="p-2 text-base font-bold bg-white border-4 border-black"
          >
            <option value="current">Current Month</option>
            <option value="custom">Custom Month</option>
          </select> */}

          {/* {selectedPeriod === "custom" && (
            <input
              type="month"
              value={customMonth}
              onChange={(e) => setCustomMonth(e.target.value)}
              className="p-2 text-base font-bold bg-white border-4 border-black"
            />
          )} */}

          <div className="text-sm font-bold text-gray-600">
            {formatDate(selectedRange.start)} - {formatDate(selectedRange.end)}
          </div>
        </div>
      </div>

      {/* Total Spending Card */}
      <div className="p-4 border-4 border-black bg-yellow sm:p-6 shadow-brutal">
        <h3 className="mb-2 text-lg font-black text-black sm:text-xl">
          TOTAL SPENDING
        </h3>
        <p className="text-2xl font-black text-black sm:text-4xl">
          {formatCurrency(analytics.totalSpending, userSettings.currency)}
        </p>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        {/* Daily Spending Bar Chart */}
        <div className="p-4 bg-white border-4 border-black sm:p-6 shadow-brutal">
          <h3 className="mb-4 text-lg font-black text-black sm:text-xl">
            📈 DAILY SPENDING
          </h3>
          <div className="overflow-x-auto">
            <BarChart
              data={analytics.dailySpending}
              currency={userSettings.currency}
            />
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="p-4 bg-white border-4 border-black sm:p-6 shadow-brutal">
          <h3 className="mb-4 text-lg font-black text-black sm:text-xl">
            🥧 SPENDING BY CATEGORY
          </h3>
          <PieChart
            data={analytics.categoryBreakdown}
            currency={userSettings.currency}
          />
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="p-4 bg-white border-4 border-black shadow-brutal">
          <h4 className="mb-2 text-sm font-black text-black sm:text-base">
            CATEGORIES
          </h4>
          <p className="text-xl font-black sm:text-2xl text-yellow">
            {analytics.categoryBreakdown.length}
          </p>
        </div>

        <div className="p-4 bg-white border-4 border-black shadow-brutal">
          <h4 className="mb-2 text-sm font-black text-black sm:text-base">
            DAYS WITH SPENDING
          </h4>
          <p className="text-xl font-black sm:text-2xl text-yellow">
            {analytics.dailySpending.filter((d) => d.amount > 0).length}
          </p>
        </div>

        <div className="p-4 bg-white border-4 border-black shadow-brutal">
          <h4 className="mb-2 text-sm font-black text-black sm:text-base">
            AVG DAILY
          </h4>
          <p className="text-xl font-black sm:text-2xl text-yellow">
            {formatCurrency(
              analytics.dailySpending.filter((d) => d.amount > 0).length > 0
                ? analytics.totalSpending /
                    analytics.dailySpending.filter((d) => d.amount > 0).length
                : 0,
              userSettings.currency
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
