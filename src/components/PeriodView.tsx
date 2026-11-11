import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { formatCurrency, formatDate } from "../utils/helpers";
import BarChart from "./BarChart";
import PieChart from "./PieChart";

export default function PeriodView() {
  const userSettings = useQuery(api.settings.getUserSettings);
  const periods = useQuery(api.periods.getUserPeriods);
  const { periodId } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const selectedPeriodId = periodId || searchParams.get('period') || '';

  const handleDateClick = (date: string) => {
    // Navigate to daily view with the selected date
    navigate(`/daily/${date}`);
  };

  // Get current period if no period is selected
  const currentPeriod = useQuery(api.periods.getCurrentPeriod);

  // Use the current period if no period is selected, or the most recent period if no current period
  const effectivePeriodId = useMemo(() => {
    // If user has explicitly selected a period, use that
    if (selectedPeriodId) return selectedPeriodId;

    // If there's a current period, use that
    if (currentPeriod?._id) return currentPeriod._id;

    // If there are periods but no current period, use the most recent one
    if (periods && periods.length > 0) {
      // Sort periods by start date in descending order (newest first)
      const sortedPeriods = [...periods].sort(
        (a, b) =>
          new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      );
      return sortedPeriods[0]._id;
    }

    // Fallback to empty string if no periods exist
    return "";
  }, [selectedPeriodId, currentPeriod, periods]);

  // Get analytics for the selected period
  const analytics = useQuery(
    api.expenses.getSpendingAnalytics,
    effectivePeriodId ? { periodId: effectivePeriodId as any } : "skip"
  );

  if (!userSettings || !periods) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-4 animate-spin border-yellow border-t-transparent"></div>
      </div>
    );
  }

  // Show empty state if no periods exist
  if (periods.length === 0) {
    return (
      <div className="space-y-6">
        <div className="p-6 bg-white border-4 border-black shadow-brutal">
          <h2 className="mb-4 text-3xl font-black text-black">
            📅 PERIOD VIEW
          </h2>
        </div>

        <div className="p-8 text-center bg-white border-4 border-black shadow-brutal">
          <div className="mb-6">
            <div className="mb-4 text-6xl">📅</div>
            <h3 className="mb-2 text-2xl font-black text-black">
              NO PERIODS FOUND
            </h3>
            <p className="mb-6 text-lg font-bold text-gray-600">
              Create your first period to start tracking expenses by time
              periods.
            </p>
            <button
              onClick={() => navigate('/period-manager')}
              className="px-6 py-3 text-lg font-bold text-black border-4 border-black transition-colors bg-yellow hover:bg-yellow-dark shadow-brutal-sm">
              CREATE YOUR FIRST PERIOD
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-4 animate-spin border-yellow border-t-transparent"></div>
      </div>
    );
  }

  // Find the selected period object
  const selectedPeriod = effectivePeriodId
    ? periods.find((p) => p._id === effectivePeriodId)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 bg-white border-4 border-black shadow-brutal">
        <h2 className="mb-4 text-3xl font-black text-black">📅 PERIOD VIEW</h2>

        <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center">
          <select
            value={selectedPeriodId}
            onChange={(e) => {
              const newPeriodId = e.target.value;
              if (newPeriodId) {
                navigate(`/periods/${newPeriodId}`);
              } else {
                navigate('/periods');
              }
            }}
            className="p-2 font-bold bg-white border-4 border-black transition-colors hover:bg-gray-50">
            <option value="">
              {currentPeriod ? "Current Period" : "Most Recent Period"}
            </option>
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
            : currentPeriod
              ? "CURRENT PERIOD"
              : "MOST RECENT PERIOD"}{" "}
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
              onDateClick={handleDateClick}
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
                    className="p-4 transition-colors cursor-pointer hover:bg-gray-50"
                    onClick={() => handleDateClick(day.date)}>
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
