import {
  Authenticated,
  Unauthenticated,
  useQuery,
  useMutation,
} from "convex/react";
import { api } from "../convex/_generated/api";
import { SignInForm } from "./SignInForm";
import { SignOutButton } from "./SignOutButton";
import { Toaster } from "sonner";
import { useState, useEffect } from "react";
import Dashboard from "./components/Dashboard";
import PeriodView from "./components/PeriodView";
import DailyView from "./components/DailyView";
import Settings from "./components/Settings";
import AdminPortal from "./components/AdminPortal";
import AddExpenseModal from "./components/AddExpenseModal";
import PeriodManager from "./components/PeriodManager";

type View =
  | "dashboard"
  | "periods"
  | "daily"
  | "settings"
  | "admin"
  | "period-manager";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userSettings = useQuery(api.settings.getUserSettings);
  const initializeSettings = useMutation(api.settings.initializeUserSettings);

  // Initialize user settings on first login
  useEffect(() => {
    if (loggedInUser && !userSettings) {
      initializeSettings();
    }
  }, [loggedInUser, userSettings, initializeSettings]);

  // Listen for navigation events from empty states
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      setCurrentView(event.detail as View);
      setSidebarOpen(false);
    };

    window.addEventListener('navigate', handleNavigate as EventListener);
    return () => window.removeEventListener('navigate', handleNavigate as EventListener);
  }, []);

  if (loggedInUser === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-yellow border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Authenticated>
        <div className="flex flex-col h-screen">
          {/* Header */}
          <header className="bg-white border-4 border-black shadow-brutal p-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden bg-yellow border-2 border-black px-3 py-2 font-bold text-black hover:bg-yellow-dark transition-colors">
                  ☰
                </button>
                <h1 className="text-lg sm:text-2xl font-black text-black">
                  💰 EXPENSE TRACKER
                </h1>
              </div>
              <button
                onClick={() => setShowAddExpense(true)}
                className="bg-yellow border-4 border-black w-12 h-12 font-bold text-black hover:bg-yellow-dark transition-colors shadow-brutal-sm flex items-center justify-center text-xl">
                +
              </button>
            </div>
          </header>

          <div className="flex flex-1 overflow-hidden relative">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
                onClick={() => setSidebarOpen(false)}
              />
            )}

            {/* Sidebar Navigation */}
            <nav
              className={`
              ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} 
              lg:translate-x-0 fixed lg:relative z-50 lg:z-auto
              w-64 bg-white border-r-4 border-black p-4 h-full
              transition-transform duration-300 ease-in-out
            `}>
              <div className="space-y-2 flex flex-col h-full">
                <NavButton
                  active={currentView === "dashboard"}
                  onClick={() => {
                    setCurrentView("dashboard");
                    setSidebarOpen(false);
                  }}>
                  📊 DASHBOARD
                </NavButton>
                <NavButton
                  active={currentView === "periods"}
                  onClick={() => {
                    setCurrentView("periods");
                    setSidebarOpen(false);
                  }}>
                  📅 PERIOD VIEW
                </NavButton>
                <NavButton
                  active={currentView === "period-manager"}
                  onClick={() => {
                    setCurrentView("period-manager");
                    setSidebarOpen(false);
                  }}>
                  🗂️ MANAGE PERIODS
                </NavButton>
                <NavButton
                  active={currentView === "daily"}
                  onClick={() => {
                    setCurrentView("daily");
                    setSidebarOpen(false);
                  }}>
                  📋 DAILY VIEW
                </NavButton>
                <NavButton
                  active={currentView === "settings"}
                  onClick={() => {
                    setCurrentView("settings");
                    setSidebarOpen(false);
                  }}>
                  ⚙️ SETTINGS
                </NavButton>
                {userSettings?.isAdmin && (
                  <NavButton
                    active={currentView === "admin"}
                    onClick={() => {
                      setCurrentView("admin");
                      setSidebarOpen(false);
                    }}>
                    👑 ADMIN
                  </NavButton>
                )}
                <div className="mt-auto pt-4">
                  <SignOutButton />
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 overflow-auto p-4 sm:p-6">
              {currentView === "dashboard" && <Dashboard />}
              {currentView === "periods" && <PeriodView />}
              {currentView === "period-manager" && <PeriodManager />}
              {currentView === "daily" && (
                <DailyView
                  selectedDate={selectedDate}
                  onDateChange={setSelectedDate}
                />
              )}
              {currentView === "settings" && <Settings />}
              {currentView === "admin" && userSettings?.isAdmin && (
                <AdminPortal />
              )}
            </main>
          </div>
        </div>

        {/* Add Expense Modal */}
        {showAddExpense && (
          <AddExpenseModal onClose={() => setShowAddExpense(false)} />
        )}
      </Authenticated>

      <Unauthenticated>
        <div className="min-h-screen flex items-center justify-center p-4 sm:p-8">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h1 className="text-2xl sm:text-4xl font-black text-black mb-4">
                💰 EXPENSE TRACKER
              </h1>
              <p className="text-lg sm:text-xl font-bold text-gray-700">
                Track your spending like a boss!
              </p>
            </div>
            <SignInForm />
          </div>
        </div>
      </Unauthenticated>

      <Toaster />
    </div>
  );
}

function NavButton({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left p-3 font-bold border-4 border-black transition-colors shadow-brutal-sm text-sm sm:text-base ${
        active
          ? "bg-yellow text-black"
          : "bg-white text-black hover:bg-gray-100"
      }`}>
      {children}
    </button>
  );
}
