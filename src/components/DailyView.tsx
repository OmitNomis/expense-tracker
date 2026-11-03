import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { formatCurrency, formatDate } from "../utils/helpers";
import { toast } from "sonner";
import EditExpenseModal from "./EditExpenseModal";

interface DailyViewProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export default function DailyView({
  selectedDate,
  onDateChange,
}: DailyViewProps) {
  const userSettings = useQuery(api.settings.getUserSettings);
  const [editingExpense, setEditingExpense] = useState<any>(null);

  // Use today's date if no date is selected
  const currentDate = selectedDate || new Date().toISOString().split("T")[0];

  const expenses = useQuery(api.expenses.getExpensesByDate, {
    date: currentDate,
  });
  const deleteExpense = useMutation(api.expenses.deleteExpense);

  const handleDelete = async (expenseId: string) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      try {
        await deleteExpense({ id: expenseId as any });
        toast.success("Expense deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete expense");
      }
    }
  };

  if (!userSettings) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-12 h-12 rounded-full border-4 animate-spin border-yellow border-t-transparent"></div>
      </div>
    );
  }

  const totalForDay =
    expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-4 bg-white border-4 border-black sm:p-6 shadow-brutal">
        <h2 className="mb-4 text-2xl font-black text-black sm:text-3xl">
          📋 DAILY VIEW
        </h2>

        <div className="flex flex-col gap-4 items-start sm:flex-row sm:items-center">
          <input
            type="date"
            value={currentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="p-2 text-base font-bold bg-white border-4 border-black"
          />

          <div className="text-sm font-bold text-gray-600">
            {new Date(currentDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
        </div>
      </div>

      {/* Daily Total */}
      <div className="p-4 border-4 border-black bg-yellow sm:p-6 shadow-brutal">
        <h3 className="mb-2 text-lg font-black text-black sm:text-xl">
          DAY TOTAL
        </h3>
        <p className="text-2xl font-black text-black sm:text-4xl">
          {formatCurrency(totalForDay, userSettings.currency)}
          {console.log(userSettings.currency)}
        </p>
      </div>

      {/* Expenses List */}
      <div className="bg-white border-4 border-black shadow-brutal">
        <div className="p-4 border-b-4 border-black sm:p-6">
          <h3 className="text-lg font-black text-black sm:text-xl">
            💸 EXPENSES
          </h3>
        </div>

        <div className="overflow-y-auto max-h-96">
          {!expenses || expenses.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-lg font-bold text-gray-600">
                No expenses for this day
              </p>
            </div>
          ) : (
            <div className="divide-y-4 divide-black">
              {expenses.map((expense) => (
                <div
                  key={expense._id}
                  className="p-4 transition-colors hover:bg-gray-50">
                  <div className="flex flex-col gap-4 justify-between items-start sm:flex-row">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-3 items-center mb-2">
                        <span className="px-2 py-1 text-xs font-black border-2 border-black bg-yellow">
                          {expense.category}
                        </span>
                        <p className="text-lg font-black text-black sm:text-xl">
                          {formatCurrency(
                            expense.amount,
                            userSettings.currency
                          )}
                        </p>
                      </div>
                      {expense.description && (
                        <p className="mb-1 font-bold text-gray-700 break-words">
                          {expense.description}
                        </p>
                      )}
                      <p className="text-sm font-bold text-gray-500">
                        {new Date(expense.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    <div className="flex flex-shrink-0 gap-2">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="px-2 py-1 text-sm font-bold text-black bg-white border-2 border-black transition-colors sm:px-3 hover:bg-gray-100">
                        <span className="hidden sm:inline">✏️ EDIT</span>
                        <span className="sm:hidden">✏️</span>
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="px-2 py-1 text-sm font-bold text-white bg-red-500 border-2 border-black transition-colors sm:px-3 hover:bg-red-600">
                        <span className="hidden sm:inline">🗑️ DELETE</span>
                        <span className="sm:hidden">🗑️</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Expense Modal */}
      {editingExpense && (
        <EditExpenseModal
          expense={editingExpense}
          onClose={() => setEditingExpense(null)}
        />
      )}
    </div>
  );
}
