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
import { Routes, Route, useNavigate, useLocation, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import PeriodView from "./components/PeriodView";
import DailyView from "./components/DailyView";
import Settings from "./components/Settings";
import AdminPortal from "./components/AdminPortal";
import AddExpenseModal from "./components/AddExpenseModal";
import PeriodManager from "./components/PeriodManager";
import SignoutModal from "./components/SignoutModal";

export default function App() {
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [signOutModalVisible, setSignOutModalVisible] = useState<boolean>(false);
  const navigate = useNavigate();
  const location = useLocation();

  const loggedInUser = useQuery(api.auth.loggedInUser);
  const userSettings = useQuery(api.settings.getUserSettings);
  const initializeSettings = useMutation(api.settings.initializeUserSettings);

  // Initialize user settings on first login
  useEffect(() => {
    if (loggedInUser && !userSettings) {
      initializeSettings();
    }
  }, [loggedInUser, userSettings, initializeSettings]);
  
  // Apply user's primary color theme
  useEffect(() => {
    if (userSettings?.primaryColor) {
      document.documentElement.style.setProperty('--color-yellow', userSettings.primaryColor);
      
      // Calculate a darker shade for hover states (10% darker)
      const darkerShade = calculateDarkerShade(userSettings.primaryColor, 10);
      document.documentElement.style.setProperty('--color-yellow-dark', darkerShade);
    }
  }, [userSettings?.primaryColor]);
  
  // Helper function to calculate a darker shade of a hex color
  const calculateDarkerShade = (hexColor: string, percent: number): string => {
    // Remove the # if present
    hexColor = hexColor.replace('#', '');
    
    // Parse the hex values
    const r = parseInt(hexColor.substring(0, 2), 16);
    const g = parseInt(hexColor.substring(2, 4), 16);
    const b = parseInt(hexColor.substring(4, 6), 16);
    
    // Calculate darker values
    const factor = 1 - percent / 100;
    const newR = Math.floor(r * factor);
    const newG = Math.floor(g * factor);
    const newB = Math.floor(b * factor);
    
    // Convert back to hex
    return `#${newR.toString(16).padStart(2, '0')}${newG.toString(16).padStart(2, '0')}${newB.toString(16).padStart(2, '0')}`;
  };

  // Listen for navigation events from empty states (for backward compatibility)
  useEffect(() => {
    const handleNavigate = (event: CustomEvent) => {
      const view = event.detail as string;
      navigate(`/${view}`);
      setSidebarOpen(false);
    };

    const handleDateSelect = (event: CustomEvent) => {
      const date = event.detail as string;
      navigate(`/daily?date=${date}`);
    };

    window.addEventListener("navigate", handleNavigate as EventListener);
    window.addEventListener("dateSelect", handleDateSelect as EventListener);

    return () => {
      window.removeEventListener("navigate", handleNavigate as EventListener);
      window.removeEventListener("dateSelect", handleDateSelect as EventListener);
    };
  }, [navigate]);

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
          <header className="p-4 bg-white border-4 border-black shadow-brutal safe-area-inset-top">
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center sm:gap-4">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="px-3 py-2 font-bold text-black border-2 border-black transition-colors lg:hidden bg-yellow hover:bg-yellow-dark touch-manipulation">
                  ☰
                </button>
                <h1 className="text-base font-black text-black truncate sm:text-lg md:text-2xl">
                  💰 EXPENSE TRACKER
                </h1>
              </div>
              <button
                onClick={() => setShowAddExpense(true)}
                className="flex flex-shrink-0 justify-center items-center w-12 h-12 text-xl font-bold text-black border-4 border-black transition-colors bg-yellow hover:bg-yellow-dark shadow-brutal-sm touch-manipulation">
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
              safe-area-inset-left safe-area-inset-bottom
            `}>
              <div className="flex flex-col space-y-2 h-full">
                <NavButton
                  active={location.pathname === "/" || location.pathname === "/dashboard"}
                  to="/dashboard"
                  onClick={() => setSidebarOpen(false)}>
                  📊 DASHBOARD
                </NavButton>
                <NavButton
                  active={location.pathname === "/periods"}
                  to="/periods"
                  onClick={() => setSidebarOpen(false)}>
                  📅 PERIOD VIEW
                </NavButton>
                <NavButton
                  active={location.pathname === "/period-manager"}
                  to="/period-manager"
                  onClick={() => setSidebarOpen(false)}>
                  🗂️ MANAGE PERIODS
                </NavButton>
                <NavButton
                  active={location.pathname === "/daily"}
                  to="/daily"
                  onClick={() => setSidebarOpen(false)}>
                  📋 DAILY VIEW
                </NavButton>
                <NavButton
                  active={location.pathname === "/settings"}
                  to="/settings"
                  onClick={() => setSidebarOpen(false)}>
                  ⚙️ SETTINGS
                </NavButton>
                {userSettings?.isAdmin && (
                  <NavButton
                    active={location.pathname === "/admin"}
                    to="/admin"
                    onClick={() => setSidebarOpen(false)}>
                    👑 ADMIN
                  </NavButton>
                )}
                <div className="pt-4 mt-auto">
                  <button
                    className="px-4 py-2 w-full text-sm font-bold text-black bg-white border-4 border-black transition-colors hover:bg-gray-100 shadow-brutal-sm sm:text-base touch-manipulation"
                    onClick={() => setSignOutModalVisible(true)}>
                    🚪 SIGN OUT
                  </button>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="overflow-auto flex-1 p-4 sm:p-6 safe-area-inset-right safe-area-inset-bottom">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/periods" element={<PeriodView />} />
                <Route path="/periods/:periodId" element={<PeriodView />} />
                <Route path="/period-manager" element={<PeriodManager />} />
                <Route path="/daily" element={<DailyView />} />
                <Route path="/daily/:date" element={<DailyView />} />
                <Route path="/settings" element={<Settings />} />
                {userSettings?.isAdmin && (
                  <Route path="/admin" element={<AdminPortal />} />
                )}
                {/* Fallback route */}
                <Route path="*" element={<Dashboard />} />
              </Routes>
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
  to,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  to: string;
  onClick: () => void;
}) {
  return (
    <Link
      to={to}
      onClick={onClick}
      className={`w-full text-left p-3 font-bold border-4 border-black transition-colors shadow-brutal-sm text-sm sm:text-base block ${
        active
          ? "text-black bg-yellow"
          : "text-black bg-white hover:bg-gray-100"
      }`}>
      {children}
    </Link>
  );
}
