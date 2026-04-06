import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { apiService } from "../../services/api";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

const toAbsoluteUrl = (url: string | null | undefined) =>
  url ? (url.startsWith("http") ? url : `${API_BASE_URL}${url}`) : null;
import type {
  MenuItemResponse,
  MenuItemRequest,
  RecipeIngredientDto,
  StockItemResponse,
} from "../../services/api";
import "./Recipes.css";

const CATEGORIES = [
  "starter",
  "main",
  "dessert",
  "beverage",
  "pizza",
  "burger",
  "salad",
  "soup",
];
const UNITS = ["kg", "g", "liters", "ml", "pieces", "portions"];

const emptyIngredient = (): RecipeIngredientDto => ({
  ingredientName: "",
  quantity: 0,
  unit: "g",
});

const emptyForm = (): MenuItemRequest => ({
  name: "",
  description: "",
  price: 0,
  category: "",
  available: true,
  recipe: [],
});

function Recipes() {
  const [items, setItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<MenuItemResponse | null>(null);
  const [form, setForm] = useState<MenuItemRequest>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<
    Record<number, StockItemResponse[]>
  >({});
  const [showSuggestions, setShowSuggestions] = useState<
    Record<number, boolean>
  >({});
  const debounceTimers = useRef<Record<number, ReturnType<typeof setTimeout>>>(
    {},
  );

  const handleIngredientNameChange = (idx: number, value: string) => {
    updateIngredient(idx, "ingredientName", value);
    if (debounceTimers.current[idx]) clearTimeout(debounceTimers.current[idx]);
    if (!value.trim()) {
      setSuggestions((s) => ({ ...s, [idx]: [] }));
      setShowSuggestions((s) => ({ ...s, [idx]: false }));
      return;
    }
    debounceTimers.current[idx] = setTimeout(async () => {
      try {
        const results = await apiService.getAllStock(value);
        setSuggestions((s) => ({ ...s, [idx]: results }));
        setShowSuggestions((s) => ({ ...s, [idx]: true }));
      } catch {
        // ignore
      }
    }, 300);
  };

  const selectSuggestion = (idx: number, item: StockItemResponse) => {
    setForm((f) => {
      const recipe = [...(f.recipe ?? [])];
      recipe[idx] = {
        ...recipe[idx],
        ingredientName: item.name,
        unit: item.unit,
      };
      return { ...f, recipe };
    });
    setShowSuggestions((s) => ({ ...s, [idx]: false }));
  };

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getMenuItems({
        search: search || undefined,
      });
      setItems(data);
    } catch {
      toast.error("Failed to load menu items");
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => {
    const timer = setTimeout(load, 300);
    return () => clearTimeout(timer);
  }, [load]);

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setImageFile(null);
    setImagePreview(null);
    setShowForm(true);
  };

  const openEdit = (item: MenuItemResponse) => {
    setEditing(item);
    setForm({
      name: item.name,
      description: item.description ?? "",
      price: item.price,
      category: item.category ?? "",
      available: item.available,
      recipe: item.recipe.map((r) => ({ ...r })),
    });
    setImageFile(null);
    setImagePreview(toAbsoluteUrl(item.imageUrl));
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim()) {
      toast.error("Name is required");
      return;
    }
    setSaving(true);
    try {
      let saved: MenuItemResponse;
      if (editing) {
        saved = await apiService.updateMenuItem(editing.id, form);
        toast.success("Menu item updated");
      } else {
        saved = await apiService.createMenuItem(form);
        toast.success("Menu item created");
      }
      if (imageFile) {
        await apiService.uploadMenuItemImage(saved.id, imageFile);
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: MenuItemResponse) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await apiService.deleteMenuItem(item.id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  // Recipe ingredient helpers
  const addIngredient = () => {
    setForm((f) => ({
      ...f,
      recipe: [...(f.recipe ?? []), emptyIngredient()],
    }));
  };

  const removeIngredient = (index: number) => {
    setForm((f) => ({ ...f, recipe: f.recipe?.filter((_, i) => i !== index) }));
  };

  const updateIngredient = (
    index: number,
    field: keyof RecipeIngredientDto,
    value: string | number,
  ) => {
    setForm((f) => {
      const updated = [...(f.recipe ?? [])];
      updated[index] = { ...updated[index], [field]: value };
      return { ...f, recipe: updated };
    });
  };

  return (
    <div className="recipes-page">
      <div className="recipes-header">
        <div>
          <h1>Menu & Recipes</h1>
          <p className="recipes-subtitle">
            Manage dishes and their ingredient recipes
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add Dish
        </button>
      </div>

      <div className="recipes-search">
        <input
          type="text"
          placeholder="Search dishes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="recipes-loading">Loading menu items...</div>
      ) : (
        <div className="recipes-grid">
          {items.length === 0 ? (
            <div className="empty-state">
              No dishes found. Add your first dish!
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className={`dish-card ${!item.available ? "unavailable" : ""}`}
              >
                {item.imageUrl && (
                  <img
                    src={toAbsoluteUrl(item.imageUrl)!}
                    alt={item.name}
                    className="dish-image"
                  />
                )}
                <div className="dish-card-header">
                  <div>
                    <h3 className="dish-name">{item.name}</h3>
                    {item.category && (
                      <span className="dish-category">{item.category}</span>
                    )}
                  </div>
                  <div className="dish-price">€{item.price.toFixed(2)}</div>
                </div>

                {item.description && (
                  <p className="dish-description">{item.description}</p>
                )}

                <div className="dish-status">
                  {item.available ? (
                    <span className="badge badge-ok">Available</span>
                  ) : (
                    <span className="badge badge-off">Unavailable</span>
                  )}
                  <span className="recipe-count">
                    {item.recipe.length} ingredient
                    {item.recipe.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {item.recipe.length > 0 && (
                  <div className="recipe-section">
                    <button
                      className="btn-toggle-recipe"
                      onClick={() =>
                        setExpandedId(expandedId === item.id ? null : item.id)
                      }
                    >
                      {expandedId === item.id
                        ? "▲ Hide Recipe"
                        : "▼ Show Recipe"}
                    </button>
                    {expandedId === item.id && (
                      <table className="recipe-table">
                        <thead>
                          <tr>
                            <th>Ingredient</th>
                            <th>Qty</th>
                            <th>Unit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {item.recipe.map((r, i) => (
                            <tr key={i}>
                              <td>{r.ingredientName}</td>
                              <td>{r.quantity}</td>
                              <td>{r.unit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                )}

                <div className="dish-actions">
                  <button className="btn-edit" onClick={() => openEdit(item)}>
                    Edit
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(item)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div
            className="modal-box modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>{editing ? "Edit Dish" : "Add Dish"}</h2>
            <form onSubmit={handleSubmit} className="recipe-form">
              <div className="form-grid">
                <label>
                  Name *
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, name: e.target.value }))
                    }
                    required
                    placeholder="e.g. Margherita Pizza"
                  />
                </label>
                <label>
                  Price (€) *
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.price}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        price: parseFloat(e.target.value) || 0,
                      }))
                    }
                    required
                  />
                </label>
                <label>
                  Category
                  <select
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                  >
                    <option value="">Select category</option>
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Available
                  <select
                    value={form.available ? "true" : "false"}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        available: e.target.value === "true",
                      }))
                    }
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                </label>
              </div>

              <label className="full-width">
                Description
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={2}
                  placeholder="Short description..."
                />
              </label>

              <div className="image-upload-section">
                <label className="full-width">
                  Photo
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0] ?? null;
                      setImageFile(file);
                      setImagePreview(
                        file
                          ? URL.createObjectURL(file)
                          : toAbsoluteUrl(editing?.imageUrl),
                      );
                    }}
                    className="image-input"
                  />
                </label>
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="image-preview"
                  />
                )}
              </div>

              <div className="recipe-editor">
                <div className="recipe-editor-header">
                  <h3>Recipe Ingredients</h3>
                  <button
                    type="button"
                    className="btn-add-ingredient"
                    onClick={addIngredient}
                  >
                    + Add Ingredient
                  </button>
                </div>
                {(form.recipe ?? []).length === 0 && (
                  <p className="no-ingredients">
                    No ingredients yet. Click "+ Add Ingredient" to start.
                  </p>
                )}
                {(form.recipe ?? []).map((ing, idx) => (
                  <div key={idx} className="ingredient-row">
                    <div className="ingredient-autocomplete">
                      <input
                        type="text"
                        placeholder="Ingredient name"
                        value={ing.ingredientName}
                        onChange={(e) =>
                          handleIngredientNameChange(idx, e.target.value)
                        }
                        onBlur={() =>
                          setTimeout(
                            () =>
                              setShowSuggestions((s) => ({
                                ...s,
                                [idx]: false,
                              })),
                            150,
                          )
                        }
                        autoComplete="off"
                      />
                      {showSuggestions[idx] &&
                        (suggestions[idx] ?? []).length > 0 && (
                          <ul className="suggestions-dropdown">
                            {suggestions[idx].map((item) => (
                              <li
                                key={item.id}
                                className="suggestion-item"
                                onMouseDown={() => selectSuggestion(idx, item)}
                              >
                                <span>{item.name}</span>
                                <span className="suggestion-unit">
                                  {item.unit}
                                </span>
                              </li>
                            ))}
                          </ul>
                        )}
                      {showSuggestions[idx] &&
                        (suggestions[idx] ?? []).length === 0 &&
                        ing.ingredientName.trim() && (
                          <ul className="suggestions-dropdown">
                            <li className="suggestion-empty">
                              No stock items found
                            </li>
                          </ul>
                        )}
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="Qty"
                      value={ing.quantity}
                      onChange={(e) =>
                        updateIngredient(
                          idx,
                          "quantity",
                          parseFloat(e.target.value) || 0,
                        )
                      }
                    />
                    <select
                      value={ing.unit}
                      onChange={(e) =>
                        updateIngredient(idx, "unit", e.target.value)
                      }
                    >
                      {UNITS.map((u) => (
                        <option key={u} value={u}>
                          {u}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      className="btn-remove"
                      onClick={() => removeIngredient(idx)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Recipes;
