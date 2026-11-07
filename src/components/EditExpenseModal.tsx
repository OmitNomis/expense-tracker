import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { toast } from "sonner";

const CATEGORIES = [
  "Food & Dining",
  "Transportation",
  "Shopping",
  "Entertainment",
  "Bills & Utilities",
  "Healthcare",
  "Education",
  "Travel",
  "Groceries",
  "Other",
];

interface EditExpenseModalProps {
  expense: any;
  onClose: () => void;
}

export default function EditExpenseModal({
  expense,
  onClose,
}: EditExpenseModalProps) {
  const [amount, setAmount] = useState(expense.amount.toString());
  const [category, setCategory] = useState(expense.category);
  const [description, setDescription] = useState(expense.description || "");
  const [date, setDate] = useState(expense.date);
  const [isLoading, setIsLoading] = useState(false);

  const updateExpense = useMutation(api.expenses.updateExpense);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!amount || !category || !date) {
      toast.error("Please fill in required fields");
      return;
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    setIsLoading(true);
    try {
      await updateExpense({
        id: expense._id,
        amount: numAmount,
        category,
        description: description.trim() || undefined,
        date,
      });
      toast.success("Expense updated successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to update expense");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
      <div className="bg-white border-4 border-black shadow-brutal max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b-4 border-black sm:p-6">
          <h3 className="text-xl font-black text-black sm:text-2xl">
            ✏️ EDIT EXPENSE
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 sm:p-6">
          <div>
            <label className="block mb-2 font-bold text-black">Amount *</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="p-3 w-full text-base font-bold bg-white border-4 border-black"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block mb-2 font-bold text-black">
              Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="p-3 w-full text-base font-bold bg-white border-4 border-black"
              required>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-2 font-bold text-black">
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="p-3 w-full text-base font-bold bg-white border-4 border-black"
              placeholder="What did you spend on? (optional)"
            />
          </div>

          <div>
            <label className="block mb-2 font-bold text-black">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="p-3 w-full text-base font-bold bg-white border-4 border-black"
              required
            />
          </div>

          <div className="flex flex-col gap-4 pt-4 sm:flex-row">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-base font-bold text-black bg-white border-4 border-black transition-colors hover:bg-gray-100">
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-4 py-3 text-base font-bold text-black border-4 border-black transition-colors bg-yellow hover:bg-yellow-dark disabled:opacity-50">
              {isLoading ? "UPDATING..." : "UPDATE EXPENSE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
