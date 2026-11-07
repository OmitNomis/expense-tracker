import { useQuery } from "convex/react";
import { api } from "../../convex/_generated/api";
import { formatCurrency } from "../utils/helpers";

export default function AdminPortal() {
  const allUsersSpending = useQuery(api.admin.getAllUsersSpending);

  if (!allUsersSpending) {
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
        <h2 className="text-3xl font-black text-black">👑 ADMIN PORTAL</h2>
        <p className="mt-2 font-bold text-gray-700">
          Overview of all users and their spending data
        </p>
      </div>

      {/* Users Overview */}
      <div className="p-6 border-4 border-black bg-yellow shadow-brutal">
        <h3 className="mb-2 text-xl font-black text-black">TOTAL USERS</h3>
        <p className="text-4xl font-black text-black">
          {allUsersSpending.length}
        </p>
      </div>

      {/* Users List */}
      <div className="bg-white border-4 border-black shadow-brutal">
        <div className="p-6 border-b-4 border-black">
          <h3 className="text-xl font-black text-black">👥 ALL USERS</h3>
        </div>

        <div className="overflow-y-auto max-h-96">
          {allUsersSpending.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-lg font-bold text-gray-600">No users found</p>
            </div>
          ) : (
            <div className="divide-y-4 divide-black">
              {allUsersSpending
                .sort((a, b) => b.totalSpending - a.totalSpending)
                .map((userData) => (
                  <div key={userData.user.id} className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="text-lg font-black text-black">
                          {userData.user.name || userData.user.email}
                        </h4>
                        <p className="font-bold text-gray-600">
                          {userData.user.email}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-black">
                          {formatCurrency(userData.totalSpending, "JPY")}
                        </p>
                        <p className="text-sm font-bold text-gray-600">
                          {userData.expenses.length} expenses
                        </p>
                      </div>
                    </div>

                    {/* Recent Expenses */}
                    {userData.expenses.length > 0 && (
                      <div className="p-4 bg-gray-50 border-2 border-black">
                        <h5 className="mb-2 font-black text-black">
                          RECENT EXPENSES
                        </h5>
                        <div className="space-y-2">
                          {userData.expenses
                            .sort((a: any, b: any) => b.createdAt - a.createdAt)
                            .slice(0, 3)
                            .map((expense: any) => (
                              <div
                                key={expense._id}
                                className="flex justify-between items-center">
                                <div>
                                  <span className="px-2 py-1 mr-2 text-xs font-black border border-black bg-yellow">
                                    {expense.category}
                                  </span>
                                  <span className="font-bold text-gray-700">
                                    {expense.description}
                                  </span>
                                </div>
                                <div className="text-right">
                                  <p className="font-black text-black">
                                    {formatCurrency(expense.amount, "JPY")}
                                  </p>
                                  <p className="text-xs font-bold text-gray-500">
                                    {expense.date}
                                  </p>
                                </div>
                              </div>
                            ))}
                        </div>
                        {userData.expenses.length > 3 && (
                          <p className="mt-2 text-xs font-bold text-gray-500">
                            ... and {userData.expenses.length - 3} more
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
