import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const CURRENCIES = [
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "NPR", symbol: "रु", name: "Nepali Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "KRW", symbol: "₩", name: "Korean Won" },
];

export default function Settings() {
  const userSettings = useQuery(api.settings.getUserSettings);
  const updateSettings = useMutation(api.settings.updateUserSettings);

  const [currency, setCurrency] = useState("");
  const [monthStartDay, setMonthStartDay] = useState(25);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (userSettings) {
      setCurrency(userSettings.currency);
      setMonthStartDay(userSettings.monthStartDay);
    }
  }, [userSettings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSettings({
        currency,
        monthStartDay,
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  if (!userSettings) {
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
        <h2 className="text-3xl font-black text-black">⚙️ SETTINGS</h2>
      </div>

      <div className="p-6 bg-white border-4 border-black shadow-brutal">
        <h3 className="mb-4 text-xl font-black text-black">💱 CURRENCY</h3>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-bold text-black">
              Default Currency
            </label>
            <select
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="p-3 w-full font-bold bg-white border-4 border-black">
              {CURRENCIES.map((curr) => (
                <option key={curr.code} value={curr.code}>
                  {curr.symbol} {curr.code} - {curr.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Month Period Settings */}
      {/* <div className="p-6 bg-white border-4 border-black shadow-brutal">
        <h3 className="mb-4 text-xl font-black text-black">📅 MONTH PERIOD</h3>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-bold text-black">
              Month Start Day
            </label>
            <select
              value={monthStartDay}
              onChange={(e) => setMonthStartDay(Number(e.target.value))}
              className="p-3 w-full font-bold bg-white border-4 border-black">
              {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
            <p className="mt-2 text-sm font-bold text-gray-600">
              Your custom month runs from the {monthStartDay}th of one month to
              the {monthStartDay - 1}th of the next month.
            </p>
          </div>
        </div>
      </div> */}

      {/* PWA Info */}
      <div className="p-6 border-4 border-black bg-yellow shadow-brutal">
        <h3 className="mb-4 text-xl font-black text-black">
          📱 PWA (PROGRESSIVE WEB APP)
        </h3>
        <p className="mb-4 font-bold text-black">
          This app works as a PWA! You can install it on your device for a
          native app experience.
        </p>
        <div className="space-y-2 text-sm font-bold text-black">
          <p>• On mobile: Tap "Add to Home Screen" in your browser menu</p>
          <p>• On desktop: Look for the install icon in your address bar</p>
          <p>• Works offline for viewing cached data</p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isLoading}
          className="px-8 py-3 font-black text-black border-4 border-black transition-colors bg-yellow hover:bg-yellow-dark shadow-brutal disabled:opacity-50">
          {isLoading ? "SAVING..." : "💾 SAVE SETTINGS"}
        </button>
      </div>
    </div>
  );
}
