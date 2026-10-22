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
  "Other"
];

interface AddExpenseModalProps {
  onClose: () => void;
}

export default function AddExpenseModal({ onClose }: AddExpenseModalProps) {
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isLoading, setIsLoading] = useState(false);

  const addExpense = useMutation(api.expenses.addExpense);

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
      await addExpense({
        amount: numAmount,
        category,
        description: description.trim() || undefined,
        date,
      });
      toast.success("Expense added successfully!");
      onClose();
    } catch (error) {
      toast.error("Failed to add expense");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white border-4 border-black shadow-brutal max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-4 sm:p-6 border-b-4 border-black">
          <h3 className="text-xl sm:text-2xl font-black text-black">💸 ADD EXPENSE</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <div>
            <label className="block font-bold text-black mb-2">Amount *</label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full border-4 border-black p-3 font-bold bg-white text-base"
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-black mb-2">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full border-4 border-black p-3 font-bold bg-white text-base"
              required
            >
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-black mb-2">Description</label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border-4 border-black p-3 font-bold bg-white text-base"
              placeholder="What did you spend on? (optional)"
            />
          </div>

          <div>
            <label className="block font-bold text-black mb-2">Date *</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full border-4 border-black p-3 font-bold bg-white text-base"
              required
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-white border-4 border-black px-4 py-3 font-bold text-black hover:bg-gray-100 transition-colors text-base"
            >
              CANCEL
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-yellow border-4 border-black px-4 py-3 font-bold text-black hover:bg-yellow-dark transition-colors disabled:opacity-50 text-base"
            >
              {isLoading ? "ADDING..." : "ADD EXPENSE"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
