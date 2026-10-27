import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useMemo } from "react";
import {
  formatCurrency,
  getCustomMonthRange,
  formatDate,
} from "../utils/helpers";

export default function MonthlyView() {
  const userSettings = useQuery(api.settings.getUserSettings);
  const [selectedMonth, setSelectedMonth] = useState<string>("");

  // Get current custom month range
  const currentMonthRange = useMemo(() => {
    if (!userSettings) return { start: "", end: "" };
    return getCustomMonthRange(new Date(), userSettings.monthStartDay);
  }, [userSettings]);

  // Get selected month range
  const selectedRange = useMemo(() => {
    if (!selectedMonth) {
      return currentMonthRange;
    }

    const [year, month] = selectedMonth.split("-").map(Number);
    const date = new Date(year, month - 1, userSettings?.monthStartDay || 25);
    return getCustomMonthRange(date, userSettings?.monthStartDay || 25);
  }, [selectedMonth, currentMonthRange, userSettings]);

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
      <div className="p-6 bg-white border-4 border-black shadow-brutal">
        <h2 className="mb-4 text-3xl font-black text-black">📅 MONTHLY VIEW</h2>

        <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center">
          <div className="relative">
            <button
              onClick={() => {
                const calendarInput = document.getElementById(
                  "month-calendar"
                ) as HTMLInputElement;
                if (calendarInput) calendarInput.showPicker();
              }}
              className="flex gap-2 items-center p-2 font-bold bg-white border-4 border-black transition-colors hover:bg-gray-50">
              <span>
                {selectedMonth
                  ? new Date(selectedMonth + "-01").toLocaleDateString(
                      "en-US",
                      { month: "long", year: "numeric" }
                    )
                  : "Select Month"}
              </span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                viewBox="0 0 16 16">
                <path d="M3.5 0a.5.5 0 0 1 .5.5V1h8V.5a.5.5 0 0 1 1 0V1h1a2 2 0 0 1 2 2v11a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V3a2 2 0 0 1 2-2h1V.5a.5.5 0 0 1 .5-.5zM1 4v10a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4H1z" />
              </svg>
            </button>
            <input
              id="month-calendar"
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="absolute opacity-0 pointer-events-none"
              aria-hidden="true"
            />
          </div>

          <div className="p-2 text-sm font-bold text-gray-600 border-2 border-black bg-cream">
            {formatDate(selectedRange.start)} - {formatDate(selectedRange.end)}
          </div>
        </div>
      </div>

      {/* Monthly Summary */}
      <div className="p-6 border-4 border-black bg-yellow shadow-brutal">
        <h3 className="mb-2 text-xl font-black text-black">MONTH TOTAL</h3>
        <p className="text-4xl font-black text-black">
          {formatCurrency(analytics.totalSpending, userSettings.currency)}
        </p>
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
              {analytics.dailySpending.map((day) => (
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
