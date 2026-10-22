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

export default function DailyView({ selectedDate, onDateChange }: DailyViewProps) {
  const userSettings = useQuery(api.settings.getUserSettings);
  const [editingExpense, setEditingExpense] = useState<any>(null);
  
  // Use today's date if no date is selected
  const currentDate = selectedDate || new Date().toISOString().split('T')[0];
  
  const expenses = useQuery(api.expenses.getExpensesByDate, { date: currentDate });
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
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow border-t-transparent"></div>
      </div>
    );
  }

  const totalForDay = expenses?.reduce((sum, expense) => sum + expense.amount, 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white border-4 border-black p-4 sm:p-6 shadow-brutal">
        <h2 className="text-2xl sm:text-3xl font-black text-black mb-4">📋 DAILY VIEW</h2>
        
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <input
            type="date"
            value={currentDate}
            onChange={(e) => onDateChange(e.target.value)}
            className="border-4 border-black p-2 font-bold bg-white text-base"
          />
          
          <div className="text-sm font-bold text-gray-600">
            {new Date(currentDate).toLocaleDateString('en-US', { 
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </div>
        </div>
      </div>

      {/* Daily Total */}
      <div className="bg-yellow border-4 border-black p-4 sm:p-6 shadow-brutal">
        <h3 className="text-lg sm:text-xl font-black text-black mb-2">DAY TOTAL</h3>
        <p className="text-2xl sm:text-4xl font-black text-black">
          {formatCurrency(totalForDay, userSettings.currency)}
        </p>
      </div>

      {/* Expenses List */}
      <div className="bg-white border-4 border-black shadow-brutal">
        <div className="p-4 sm:p-6 border-b-4 border-black">
          <h3 className="text-lg sm:text-xl font-black text-black">💸 EXPENSES</h3>
        </div>
        
        <div className="max-h-96 overflow-y-auto">
          {!expenses || expenses.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-lg font-bold text-gray-600">No expenses for this day</p>
            </div>
          ) : (
            <div className="divide-y-4 divide-black">
              {expenses.map((expense) => (
                <div key={expense._id} className="p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-3 mb-2">
                        <span className="bg-yellow border-2 border-black px-2 py-1 text-xs font-black">
                          {expense.category}
                        </span>
                        <p className="text-lg sm:text-xl font-black text-black">
                          {formatCurrency(expense.amount, userSettings.currency)}
                        </p>
                      </div>
                      {expense.description && (
                        <p className="font-bold text-gray-700 mb-1 break-words">{expense.description}</p>
                      )}
                      <p className="text-sm font-bold text-gray-500">
                        {new Date(expense.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    
                    <div className="flex gap-2 flex-shrink-0">
                      <button
                        onClick={() => setEditingExpense(expense)}
                        className="bg-white border-2 border-black px-2 sm:px-3 py-1 font-bold text-black hover:bg-gray-100 transition-colors text-sm"
                      >
                        <span className="hidden sm:inline">✏️ EDIT</span>
                        <span className="sm:hidden">✏️</span>
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id)}
                        className="bg-red-500 border-2 border-black px-2 sm:px-3 py-1 font-bold text-white hover:bg-red-600 transition-colors text-sm"
                      >
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
