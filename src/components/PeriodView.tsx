import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import { formatCurrency, formatDate } from "../utils/helpers";
import BarChart from "./BarChart";
import PieChart from "./PieChart";

export default function PeriodView() {
  const userSettings = useQuery(api.settings.getUserSettings);
  const periods = useQuery(api.periods.getUserPeriods);
  const [selectedPeriodId, setSelectedPeriodId] = useState<string>("");

  // Get current period if no period is selected
  const currentPeriod = useQuery(api.periods.getCurrentPeriod);

  // Use the current period if no period is selected
  const effectivePeriodId = useMemo(() => {
    if (selectedPeriodId) return selectedPeriodId;
    return currentPeriod?._id || "";
  }, [selectedPeriodId, currentPeriod]);

  // Get analytics for the selected period
  const analytics = useQuery(
    api.expenses.getSpendingAnalytics,
    effectivePeriodId ? { periodId: effectivePeriodId as any } : "skip"
  );

  if (!userSettings || !periods || !analytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-4 animate-spin border-yellow border-t-transparent"></div>
      </div>
    );
  }

  // Find the selected period object
  const selectedPeriod = effectivePeriodId
    ? periods.find((p) => p._id === effectivePeriodId) || currentPeriod
    : currentPeriod;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white border-4 border-black shadow-brutal">
        <h2 className="mb-4 text-3xl font-black text-black">📅 PERIOD VIEW</h2>

        <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center">
          <select
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="p-2 font-bold bg-white border-4 border-black transition-colors hover:bg-gray-50">
            <option value="">Current Period</option>
            {periods.map((period) => (
              <option key={period._id} value={period._id}>
                {period.name} {period.isClosed ? "(Closed)" : ""}
              </option>
            ))}
          </select>

          {selectedPeriod && (
            <div className="p-2 text-sm font-bold text-gray-600 border-2 border-black bg-cream">
              {formatDate(selectedPeriod.startDate)}
              {selectedPeriod.endDate
                ? ` - ${formatDate(selectedPeriod.endDate)}`
                : " (Active)"}
            </div>
          )}
        </div>
      </div>

      {/* Period Summary */}
      <div className="p-6 border-4 border-black bg-yellow shadow-brutal">
        <h3 className="mb-2 text-xl font-black text-black">
          {selectedPeriod
            ? selectedPeriod.name.toUpperCase()
            : "CURRENT PERIOD"}{" "}
          TOTAL
        </h3>
        <p className="text-4xl font-black text-black">
          {formatCurrency(analytics.totalSpending, userSettings.currency)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
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

      {/* Daily Breakdown */}
      <div className="bg-white border-4 border-black shadow-brutal">
        <div className="p-6 border-b-4 border-black">
          <h3 className="text-xl font-black text-black">📋 DAILY BREAKDOWN</h3>
        </div>

        <div className="overflow-y-auto max-h-96">
          {analytics.dailySpending.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-lg font-bold text-gray-600">
                No expenses found for this period
              </p>
            </div>
          ) : (
            <div className="divide-y-4 divide-black">
              {analytics.dailySpending
                .filter((day) => day.amount > 0) // Only show days with expenses
                .sort((a, b) => b.date.localeCompare(a.date)) // Sort by date descending
                .map((day) => (
                  <div
                    key={day.date}
                    className="p-4 transition-colors hover:bg-gray-50">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-black text-black">
                          {formatDate(day.date)}
                        </p>
                        <p className="text-sm font-bold text-gray-600">
                          {new Date(day.date).toLocaleDateString("en-US", {
                            weekday: "long",
                          })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xl font-black text-black">
                          {formatCurrency(day.amount, userSettings.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Category Summary */}
      {analytics.categoryBreakdown.length > 0 && (
        <div className="bg-white border-4 border-black shadow-brutal">
          <div className="p-6 border-b-4 border-black">
            <h3 className="text-xl font-black text-black">
              🏷️ CATEGORY SUMMARY
            </h3>
          </div>

          <div className="divide-y-4 divide-black">
            {analytics.categoryBreakdown
              .sort((a, b) => b.amount - a.amount)
              .map((category) => (
                <div key={category.category} className="p-4">
                  <div className="flex justify-between items-center">
                    <p className="font-black text-black">{category.category}</p>
                    <p className="text-xl font-black text-black">
                      {formatCurrency(category.amount, userSettings.currency)}
                    </p>
                  </div>
                  <div className="mt-2 h-2 bg-gray-200 border-2 border-black">
                    <div
                      className="h-full bg-yellow"
                      style={{
                        width: `${(category.amount / analytics.totalSpending) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
