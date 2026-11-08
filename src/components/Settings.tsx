import { useQuery, useMutation } from "convex/react";
import { api } from "../../convex/_generated/api";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Id } from "../../convex/_generated/dataModel";

const CURRENCIES = [
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "NPR", symbol: "रु", name: "Nepali Rupee" },
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "KRW", symbol: "₩", name: "Korean Won" },
];

const DEFAULT_CATEGORIES = [
  { name: "Food & Dining", color: "#FFD600" },
  { name: "Transportation", color: "#FF6B6B" },
  { name: "Shopping", color: "#4ECDC4" },
  { name: "Entertainment", color: "#45B7D1" },
  { name: "Bills & Utilities", color: "#96CEB4" },
  { name: "Healthcare", color: "#FFEAA7" },
  { name: "Education", color: "#DDA0DD" },
  { name: "Travel", color: "#98D8C8" },
  { name: "Groceries", color: "#F7DC6F" },
  { name: "Other", color: "#BB8FCE" },
];

const THEME_COLORS = [
  "#FFD600", // Yellow (Default)
  "#FF6B6B", // Red
  "#4ECDC4", // Teal
  "#45B7D1", // Blue
  "#96CEB4", // Green
  "#FFEAA7", // Light Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Mint
  "#F7DC6F", // Gold
  "#BB8FCE", // Lavender
  "#FF9A76", // Coral
  "#A3D2CA", // Seafoam
  "#5EAAA8", // Teal Green
  "#F8A978", // Peach
  "#EB96EB", // Pink
  "#B5EAD7", // Mint Green
  "#C7CEEA", // Periwinkle
  "#FF9AA2", // Salmon
];

interface Category {
  _id?: Id<"userCategories">;
  name: string;
  color: string;
}

export default function Settings() {
  const userSettings = useQuery(api.settings.getUserSettings);
  const updateSettings = useMutation(api.settings.updateUserSettings);
  const addCategory = useMutation(api.settings.addUserCategory);
  const updateCategory = useMutation(api.settings.updateUserCategory);
  const deleteCategory = useMutation(api.settings.deleteUserCategory);

  const [currency, setCurrency] = useState("");
  const [monthStartDay, setMonthStartDay] = useState(25);
  const [isLoading, setIsLoading] = useState(false);
  const [primaryColor, setPrimaryColor] = useState("#FFD600");

  // Category management
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryColor, setNewCategoryColor] = useState("#FFD600");
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  useEffect(() => {
    if (userSettings) {
      setCurrency(userSettings.currency);
      setMonthStartDay(userSettings.monthStartDay);
      setPrimaryColor(userSettings.primaryColor || "#FFD600");

      // Initialize categories from user settings or defaults
      if (userSettings.categories) {
        setCategories(userSettings.categories);
      } else {
        // Use default categories if user has none
        setCategories([]);
      }
    }
  }, [userSettings]);

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await updateSettings({
        currency,
        monthStartDay,
        primaryColor,
      });
      toast.success("Settings saved successfully!");
    } catch (error) {
      toast.error("Failed to save settings");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error("Please enter a category name");
      return;
    }

    try {
      const result = await addCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
      });

      // Add the new category to the local state
      setCategories([
        ...categories,
        {
          _id: result,
          name: newCategoryName.trim(),
          color: newCategoryColor,
        },
      ]);

      // Reset form
      setNewCategoryName("");
      setNewCategoryColor("#FFD600");
      setShowAddCategory(false);
      toast.success("Category added successfully!");
    } catch (error) {
      toast.error("Failed to add category");
    }
  };

  const handleUpdateCategory = async () => {
    if (!editingCategory || !editingCategory._id) return;

    try {
      await updateCategory({
        id: editingCategory._id,
        name: editingCategory.name,
        color: editingCategory.color,
      });

      // Update the category in local state
      setCategories(
        categories.map((cat) =>
          cat._id === editingCategory._id ? editingCategory : cat
        )
      );

      setEditingCategory(null);
      toast.success("Category updated successfully!");
    } catch (error) {
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (id: Id<"userCategories">) => {
    try {
      await deleteCategory({ id });

      // Remove the category from local state
      setCategories(categories.filter((cat) => cat._id !== id));
      toast.success("Category deleted successfully!");
    } catch (error) {
      toast.error("Failed to delete category");
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

      {/* Currency Settings */}
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

      {/* Theme Settings */}
      <div className="p-6 bg-white border-4 border-black shadow-brutal">
        <h3 className="mb-4 text-xl font-black text-black">🎨 APP THEME</h3>

        <div className="space-y-4">
          <div>
            <label className="block mb-2 font-bold text-black">
              Primary Color
            </label>
            <div className="grid grid-cols-6 gap-2 mb-4 sm:grid-cols-6 md:grid-cols-9">
              {THEME_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => setPrimaryColor(color)}
                  className={`w-full aspect-square border-4 ${primaryColor === color ? "border-black" : "border-gray-300"}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Select ${color} as primary color`}
                />
              ))}
            </div>
            <div
              className="p-4 font-bold text-center border-4 border-black"
              style={{ backgroundColor: primaryColor }}>
              Preview
            </div>
          </div>
        </div>
      </div>

      {/* Categories Settings */}
      <div className="p-6 bg-white border-4 border-black shadow-brutal">
        <h3 className="mb-4 text-xl font-black text-black">
          🏷️ EXPENSE CATEGORIES
        </h3>

        <div className="space-y-4">
          {/* Existing Categories */}
          <div className="space-y-2">
            {categories.length > 0 ? (
              categories.map((category) => (
                <div
                  key={category._id?.toString() || category.name}
                  className="flex justify-between items-center p-3 border-2 border-black">
                  <div className="flex gap-2 items-center">
                    <div
                      className="w-6 h-6 border-2 border-black"
                      style={{ backgroundColor: category.color }}
                    />
                    <span className="font-bold">{category.name}</span>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingCategory(category)}
                      className="px-2 py-1 text-sm font-bold border-2 border-black bg-yellow">
                      Edit
                    </button>
                    {category._id && (
                      <button
                        onClick={() => handleDeleteCategory(category._id!)}
                        className="px-2 py-1 text-sm font-bold bg-red-300 border-2 border-black">
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="font-bold text-gray-600">
                You haven't created any custom categories yet. Add some below!
              </p>
            )}
          </div>

          {/* Add New Category Form */}
          {showAddCategory ? (
            <div className="p-4 bg-gray-100 border-2 border-black">
              <h4 className="mb-3 font-bold">Add New Category</h4>
              <div className="space-y-3">
                <div>
                  <label className="block mb-1 text-sm font-bold">Name</label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="p-2 w-full border-2 border-black"
                    placeholder="e.g. Pet Expenses"
                  />
                </div>
                <div>
                  <label className="block mb-1 text-sm font-bold">Color</label>
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                    {THEME_COLORS.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategoryColor(color)}
                        className={`w-full aspect-square border-2 ${newCategoryColor === color ? "border-black" : "border-gray-300"}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    onClick={() => setShowAddCategory(false)}
                    className="px-3 py-2 text-sm font-bold bg-white border-2 border-black">
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    className="px-3 py-2 text-sm font-bold border-2 border-black bg-yellow">
                    Add Category
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddCategory(true)}
              className="px-4 py-2 font-bold border-2 border-black bg-yellow">
              + Add New Category
            </button>
          )}

          {/* Default Categories Info */}
          <div className="p-3 mt-4 text-sm bg-gray-100 border-2 border-black">
            <p className="font-bold">Default Categories</p>
            <p>
              The app comes with default categories if you don't create your
              own.
            </p>
            <div className="grid grid-cols-2 gap-2 mt-2">
              {DEFAULT_CATEGORIES.map((cat) => (
                <div
                  key={cat.name}
                  className="flex gap-1 justify-between items-center">
                  <div className="flex gap-1 items-center">
                    <div
                      className="w-3 h-3 border border-black"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="text-xs">{cat.name}</span>
                  </div>
                  <button
                    onClick={() => {
                      // Add this default category to user's custom categories
                      addCategory({
                        name: cat.name,
                        color: cat.color,
                      })
                        .then((result) => {
                          // Add the new category to the local state
                          setCategories([
                            ...categories,
                            {
                              _id: result,
                              name: cat.name,
                              color: cat.color,
                            },
                          ]);
                          toast.success(`Added ${cat.name} to your categories`);
                        })
                        .catch(() => {
                          toast.error(`Failed to add ${cat.name}`);
                        });
                    }}
                    className="px-1 py-0.5 text-xs font-bold border border-black bg-yellow">
                    Add
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Category Modal */}
      {editingCategory && (
        <div className="flex fixed inset-0 z-50 justify-center items-center p-4 bg-black bg-opacity-50">
          <div className="p-6 w-full max-w-md bg-white border-4 border-black shadow-brutal">
            <h3 className="mb-4 text-xl font-black">Edit Category</h3>

            <div className="space-y-4">
              <div>
                <label className="block mb-2 font-bold">Name</label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory({
                      ...editingCategory,
                      name: e.target.value,
                    })
                  }
                  className="p-3 w-full border-4 border-black"
                />
              </div>

              <div>
                <label className="block mb-2 font-bold">Color</label>
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
                  {THEME_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() =>
                        setEditingCategory({ ...editingCategory, color })
                      }
                      className={`w-full aspect-square border-4 ${editingCategory.color === color ? "border-black" : "border-gray-300"}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex gap-4 justify-end pt-4">
                <button
                  onClick={() => setEditingCategory(null)}
                  className="px-4 py-2 font-bold bg-white border-4 border-black">
                  Cancel
                </button>
                <button
                  onClick={handleUpdateCategory}
                  className="px-4 py-2 font-bold border-4 border-black bg-yellow">
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PWA Info */}
      <div
        className="p-6 border-4 border-black shadow-brutal"
        style={{ backgroundColor: primaryColor }}>
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
          className="px-8 py-3 font-black text-black border-4 border-black transition-colors shadow-brutal disabled:opacity-50"
          style={{ backgroundColor: primaryColor }}>
          {isLoading ? "SAVING..." : "💾 SAVE SETTINGS"}
        </button>
      </div>
    </div>
  );
}
