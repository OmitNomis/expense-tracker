import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatCurrency, formatDate } from "../utils/helpers";
import BarChart from "./BarChart";
import PieChart from "./PieChart";

export default function Dashboard() {
  const userSettings = useQuery(api.settings.getUserSettings);
  const currentPeriod = useQuery(api.periods.getCurrentPeriod);

  const analytics = useQuery(
    api.expenses.getSpendingAnalytics,
    currentPeriod ? { periodId: currentPeriod._id } : "skip"
  );

  if (!userSettings || !analytics || !currentPeriod) {
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
          <div className="overflow-x-auto h-full">
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
