import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState } from "react";
import { formatDate } from "../utils/helpers";
import { toast } from "sonner";

export default function PeriodManager() {
  const [showNewPeriodForm, setShowNewPeriodForm] = useState(false);
  const [newPeriodName, setNewPeriodName] = useState("");
  const [startDate, setStartDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [closingPeriodId, setClosingPeriodId] = useState<string | null>(null);
  const [editingPeriod, setEditingPeriod] = useState<any>(null);
  const [endDate, setEndDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [editName, setEditName] = useState("");
  const [editStartDate, setEditStartDate] = useState("");
  const [editEndDate, setEditEndDate] = useState("");

  const periods = useQuery(api.periods.getUserPeriods);
  const currentPeriod = useQuery(api.periods.getCurrentPeriod);
  const startNewPeriod = useMutation(api.periods.startNewPeriod);
  const closePeriod = useMutation(api.periods.closePeriod);
  const updatePeriod = useMutation(api.periods.updatePeriod);
  const reopenPeriod = useMutation(api.periods.reopenPeriod);
  const deletePeriod = useMutation(api.periods.deletePeriod);

  const handleStartNewPeriod = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPeriodName) {
      toast.error("Please enter a period name");
      return;
    }

    try {
      await startNewPeriod({
        name: newPeriodName,
        startDate,
      });
      toast.success("New period started!");
      setShowNewPeriodForm(false);
      setNewPeriodName("");
    } catch (error) {
      toast.error("Failed to start new period");
      console.error(error);
    }
  };

  const handleClosePeriod = async (periodId: string) => {
    setClosingPeriodId(periodId);
    setEndDate(new Date().toISOString().split("T")[0]);
  };

  const confirmClosePeriod = async () => {
    if (!closingPeriodId) return;

    try {
      await closePeriod({
        periodId: closingPeriodId as any,
        endDate,
      });
      toast.success("Period closed successfully!");
      setClosingPeriodId(null);
    } catch (error) {
      toast.error("Failed to close period");
      console.error(error);
    }
  };

  const handleEditPeriod = (period: any) => {
    setEditingPeriod(period);
    setEditName(period.name);
    setEditStartDate(period.startDate);
    setEditEndDate(period.endDate || "");
  };

  const confirmEditPeriod = async () => {
    if (!editingPeriod) return;

    try {
      await updatePeriod({
        periodId: editingPeriod._id,
        name: editName,
        startDate: editStartDate,
        endDate: editEndDate || undefined,
      });
      toast.success("Period updated successfully!");
      setEditingPeriod(null);
    } catch (error) {
      toast.error("Failed to update period");
      console.error(error);
    }
  };

  const handleReopenPeriod = async (periodId: string) => {
    try {
      await reopenPeriod({ periodId: periodId as any });
      toast.success("Period reopened successfully!");
    } catch (error) {
      toast.error("Failed to reopen period");
      console.error(error);
    }
  };

  const handleDeletePeriod = async (periodId: string, periodName: string) => {
    if (confirm(`Are you sure you want to delete the period "${periodName}"? This will remove the period association from all expenses but keep the expenses themselves.`)) {
      try {
        await deletePeriod({ periodId: periodId as any });
        toast.success("Period deleted successfully!");
      } catch (error) {
        toast.error("Failed to delete period");
        console.error(error);
      }
    }
  };

  if (!periods) {
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
        <h2 className="mb-4 text-3xl font-black text-black">
          📊 PERIOD MANAGER
        </h2>
        <p className="mb-4 text-gray-600">
          Periods allow you to track expenses in separate time frames. Close a
          period to start a new one.
        </p>

        {currentPeriod ? (
          <div className="p-4 mb-4 border-2 border-black bg-yellow">
            <h3 className="text-xl font-black">CURRENT PERIOD</h3>
            <p className="text-lg font-bold">{currentPeriod.name}</p>
            <p className="text-sm">
              Started: {formatDate(currentPeriod.startDate)}
            </p>
            <button
              onClick={() => handleClosePeriod(currentPeriod._id)}
              className="mt-2 px-4 py-2 font-bold text-white bg-black border-2 border-black transition-colors hover:bg-gray-800">
              Close Period
            </button>
          </div>
        ) : (
          <div className="p-4 mb-4 border-2 border-black bg-gray-100">
            <p className="font-bold">No active period. Start a new one!</p>
          </div>
        )}

        {!showNewPeriodForm ? (
          <button
            onClick={() => setShowNewPeriodForm(true)}
            className="px-4 py-2 font-bold text-white bg-black border-2 border-black transition-colors hover:bg-gray-800">
            Start New Period
          </button>
        ) : (
          <form onSubmit={handleStartNewPeriod} className="space-y-4">
            <div>
              <label className="block mb-1 font-bold">Period Name</label>
              <input
                type="text"
                value={newPeriodName}
                onChange={(e) => setNewPeriodName(e.target.value)}
                placeholder="e.g., January 2023"
                className="w-full p-2 border-2 border-black"
                required
              />
            </div>
            <div>
              <label className="block mb-1 font-bold">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full p-2 border-2 border-black"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 font-bold text-white bg-black border-2 border-black transition-colors hover:bg-gray-800">
                Start Period
              </button>
              <button
                type="button"
                onClick={() => setShowNewPeriodForm(false)}
                className="px-4 py-2 font-bold bg-white border-2 border-black transition-colors hover:bg-gray-100">
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Period List */}
      <div className="bg-white border-4 border-black shadow-brutal">
        <div className="p-6 border-b-4 border-black">
          <h3 className="text-xl font-black text-black">📋 PERIOD HISTORY</h3>
        </div>

        <div className="overflow-y-auto max-h-96">
          {periods.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-lg font-bold text-gray-600">
                No periods found
              </p>
            </div>
          ) : (
            <div className="divide-y-4 divide-black">
              {periods.map((period) => (
                <div
                  key={period._id}
                  className={`p-4 transition-colors ${period.isClosed ? "" : "bg-yellow"}`}>
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div className="flex-1">
                      <p className="font-black text-black">{period.name}</p>
                      <p className="text-sm font-bold text-gray-600">
                        {formatDate(period.startDate)}
                        {period.endDate
                          ? ` - ${formatDate(period.endDate)}`
                          : " (Active)"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleEditPeriod(period)}
                        className="px-3 py-1 text-sm font-bold text-black bg-white border-2 border-black transition-colors hover:bg-gray-100 touch-manipulation">
                        ✏️ Edit
                      </button>
                      {period.isClosed ? (
                        <button
                          onClick={() => handleReopenPeriod(period._id)}
                          className="px-3 py-1 text-sm font-bold text-white bg-green-600 border-2 border-black transition-colors hover:bg-green-700 touch-manipulation">
                          🔓 Reopen
                        </button>
                      ) : (
                        <button
                          onClick={() => handleClosePeriod(period._id)}
                          className="px-3 py-1 text-sm font-bold text-white bg-black border-2 border-black transition-colors hover:bg-gray-800 touch-manipulation">
                          🔒 Close
                        </button>
                      )}
                      <button
                        onClick={() => handleDeletePeriod(period._id, period.name)}
                        className="px-3 py-1 text-sm font-bold text-white bg-red-500 border-2 border-black transition-colors hover:bg-red-600 touch-manipulation">
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Close Period Modal */}
      {closingPeriodId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white border-4 border-black shadow-brutal p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-black mb-4">📅 CLOSE PERIOD</h3>
            <p className="mb-4 text-gray-600">
              Choose the end date for this period. Expenses on this date will be
              included in the period.
            </p>
            <div className="mb-4">
              <label className="block mb-1 font-bold">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full p-2 border-2 border-black"
                required
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={confirmClosePeriod}
                className="px-4 py-2 font-bold text-white bg-black border-2 border-black transition-colors hover:bg-gray-800">
                Close Period
              </button>
              <button
                onClick={() => setClosingPeriodId(null)}
                className="px-4 py-2 font-bold bg-white border-2 border-black transition-colors hover:bg-gray-100">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Period Modal */}
      {editingPeriod && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white border-4 border-black shadow-brutal max-w-md w-full">
            <div className="p-6 border-b-4 border-black">
              <h3 className="text-xl font-black">✏️ EDIT PERIOD</h3>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block mb-1 font-bold">Period Name</label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full p-2 border-2 border-black font-bold"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">Start Date</label>
                <input
                  type="date"
                  value={editStartDate}
                  onChange={(e) => setEditStartDate(e.target.value)}
                  className="w-full p-2 border-2 border-black font-bold"
                  required
                />
              </div>
              <div>
                <label className="block mb-1 font-bold">End Date (optional)</label>
                <input
                  type="date"
                  value={editEndDate}
                  onChange={(e) => setEditEndDate(e.target.value)}
                  className="w-full p-2 border-2 border-black font-bold"
                  placeholder="Leave empty to keep period open"
                />
                <p className="text-sm text-gray-600 mt-1">
                  Leave empty to keep period open. Setting a date will close the period.
                </p>
              </div>
              <div className="flex gap-2 pt-4">
                <button
                  onClick={confirmEditPeriod}
                  className="flex-1 px-4 py-2 font-bold text-white bg-black border-2 border-black transition-colors hover:bg-gray-800 touch-manipulation">
                  Update Period
                </button>
                <button
                  onClick={() => setEditingPeriod(null)}
                  className="flex-1 px-4 py-2 font-bold bg-white border-2 border-black transition-colors hover:bg-gray-100 touch-manipulation">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
