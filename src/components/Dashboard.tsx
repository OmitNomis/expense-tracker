import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatCurrency, formatDate } from "../utils/helpers";
import BarChart from "./BarChart";
import PieChart from "./PieChart";
import { useState } from "react";

export default function Dashboard() {
  const userSettings = useQuery(api.settings.getUserSettings);
  const currentPeriod = useQuery(api.periods.getCurrentPeriod);
  
  const handleDateClick = (date: string) => {
    // Navigate to daily view with the selected date
    const navigateEvent = new CustomEvent('navigate', { detail: 'daily' });
    window.dispatchEvent(navigateEvent);
    
    // Set the selected date in App.tsx
    const dateSelectEvent = new CustomEvent('dateSelect', { detail: date });
    window.dispatchEvent(dateSelectEvent);
  };

  const analytics = useQuery(
    api.expenses.getSpendingAnalytics,
    currentPeriod ? { periodId: currentPeriod._id } : "skip"
  );

  if (!userSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-4 animate-spin border-yellow border-t-transparent"></div>
      </div>
    );
  }

  if (!currentPeriod) {
    return (
      <div className="space-y-6">
        <div className="p-4 bg-white border-4 border-black sm:p-6 shadow-brutal">
          <h2 className="mb-4 text-2xl font-black text-black sm:text-3xl">
            📊 DASHBOARD
          </h2>
        </div>

        <div className="p-8 text-center bg-white border-4 border-black shadow-brutal">
          <div className="mb-6">
            <div className="mb-4 text-6xl">📅</div>
            <h3 className="mb-2 text-2xl font-black text-black">
              NO ACTIVE PERIOD
            </h3>
            <p className="mb-6 text-lg font-bold text-gray-600">
              You need to create a period to start tracking your expenses.
            </p>
            <button
              onClick={() => {
                const event = new CustomEvent("navigate", {
                  detail: "period-manager",
                });
                window.dispatchEvent(event);
              }}
              className="px-6 py-3 text-lg font-bold text-black border-4 border-black transition-colors bg-yellow hover:bg-yellow-dark shadow-brutal-sm">
              CREATE A PERIOD
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

  return (
    <div className="space-y-6">
      <div className="p-4 bg-white border-4 border-black sm:p-6 shadow-brutal">
        <h2 className="mb-4 text-2xl font-black text-black sm:text-3xl">
          📊 DASHBOARD
        </h2>

        <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center">
          <div className="text-sm font-bold text-gray-600">
            Current Period: {currentPeriod.name}
          </div>
          <div className="text-sm font-bold text-gray-600">
            {formatDate(currentPeriod.startDate)} -{" "}
            {currentPeriod.endDate
              ? formatDate(currentPeriod.endDate)
              : "Ongoing"}
          </div>
        </div>
      </div>

      <div className="p-4 border-4 border-black bg-yellow sm:p-6 shadow-brutal">
        <h3 className="mb-2 text-lg font-black text-black sm:text-xl">
          TOTAL SPENDING
        </h3>
        <p className="text-2xl font-black text-black sm:text-4xl">
          {formatCurrency(analytics.totalSpending, userSettings.currency)}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <div className="p-4 bg-white border-4 border-black sm:p-6 shadow-brutal">
          <h3 className="mb-4 text-lg font-black text-black sm:text-xl">
            📈 DAILY SPENDING
          </h3>
          <div className="px-4 pb-6 -mx-4 h-full sm:-mx-6 sm:px-6">
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
            {analytics.dailySpending.filter((d: any) => d.amount > 0).length}
          </p>
        </div>

        <div className="p-4 bg-white border-4 border-black shadow-brutal">
          <h4 className="mb-2 text-sm font-black text-black sm:text-base">
            AVG DAILY
          </h4>
          <p className="text-xl font-black sm:text-2xl text-yellow">
            {formatCurrency(
              analytics.dailySpending.filter((d: any) => d.amount > 0).length >
                0
                ? analytics.totalSpending /
                    analytics.dailySpending.filter((d: any) => d.amount > 0)
                      .length
                : 0,
              userSettings.currency
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
