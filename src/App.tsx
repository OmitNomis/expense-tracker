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
import SignoutModal from "./components/SignoutModal";

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
  const [signOutModalVisible, setSignOutModalVisible] =
    useState<boolean>(false);

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

    window.addEventListener("navigate", handleNavigate as EventListener);
    return () =>
      window.removeEventListener("navigate", handleNavigate as EventListener);
  }, []);

  if (loggedInUser === undefined) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-cream">
        <div className="w-12 h-12 rounded-full border-4 animate-spin border-yellow border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream">
      <Authenticated>
        <div className="flex flex-col h-screen">
          {/* Header */}
          <header className="p-4 bg-white border-4 border-black shadow-brutal">
            <div className="flex justify-between items-center">
              <div className="flex gap-4 items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="px-3 py-2 font-bold text-black border-2 border-black transition-colors lg:hidden bg-yellow hover:bg-yellow-dark">
                  ☰
                </button>
                <h1 className="text-lg font-black text-black sm:text-2xl">
                  💰 EXPENSE TRACKER
                </h1>
              </div>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex justify-center items-center w-12 h-12 text-xl font-bold text-black border-4 border-black transition-colors bg-yellow hover:bg-yellow-dark shadow-brutal-sm">
                +
              </button>
            </div>
          </header>

          <div className="flex overflow-hidden relative flex-1">
            {/* Mobile Sidebar Overlay */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
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
              <div className="flex flex-col space-y-2 h-full">
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
                <div className="pt-4 mt-auto">
                  <button
                    className="px-4 py-2 w-full text-sm font-bold text-black bg-white border-4 border-black transition-colors hover:bg-gray-100 shadow-brutal-sm sm:text-base"
                    onClick={() => setSignOutModalVisible(true)}>
                    🚪 SIGN OUT
                  </button>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="overflow-auto flex-1 p-4 sm:p-6">
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
        {signOutModalVisible && (
          <SignoutModal onClose={() => setSignOutModalVisible(false)} />
        )}
      </Authenticated>

      <Unauthenticated>
        <div className="flex justify-center items-center p-4 min-h-screen sm:p-8">
          <div className="w-full max-w-md">
            <div className="mb-8 text-center">
              <h1 className="mb-4 text-2xl font-black text-black sm:text-4xl">
                💰 EXPENSE TRACKER
              </h1>
              <p className="text-lg font-bold text-gray-700 sm:text-xl">
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
          ? "text-black bg-yellow"
          : "text-black bg-white hover:bg-gray-100"
      }`}>
      {children}
    </button>
  );
}
