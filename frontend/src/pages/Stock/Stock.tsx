import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { apiService } from "../../services/api";
import type {
  StockItemResponse,
  StockItemRequest,
  StockType,
  PageResponse,
} from "../../services/api";
import "./Stock.css";

const UNITS_BY_TYPE: Record<StockType, string[]> = {
  SOLID: ["kg", "g"],
  LIQUID: ["liters", "ml"],
  PORTION: ["pieces", "portions"],
};

const TYPE_LABELS: Record<StockType, string> = {
  SOLID: "Solid (weight)",
  LIQUID: "Liquid (volume)",
  PORTION: "Portion (count)",
};

function convertUnit(value: number, from: string, to: string): number {
  if (from === to) return value;
  const weightG: Record<string, number> = { g: 1, kg: 1000 };
  const volMl: Record<string, number> = { ml: 1, liters: 1000 };
  if (weightG[from] !== undefined && weightG[to] !== undefined)
    return (value * weightG[from]) / weightG[to];
  if (volMl[from] !== undefined && volMl[to] !== undefined)
    return (value * volMl[from]) / volMl[to];
  return value;
}

const emptyForm = (): StockItemRequest => ({
  name: "",
  quantity: 0,
  unit: "kg",
  minimumThreshold: undefined,
  type: "SOLID",
});

const PAGE_SIZE = 5;

function Stock() {
  const [data, setData] = useState<PageResponse<StockItemResponse> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<StockItemResponse | null>(null);
  const [form, setForm] = useState<StockItemRequest>(emptyForm());
  const [saving, setSaving] = useState(false);
  const [displayUnits, setDisplayUnits] = useState<Record<string, string>>({});
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getDisplayUnit = (item: StockItemResponse) =>
    displayUnits[item.id] ?? item.unit;

  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(0);
    }, 400);
  }, []);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const result = await apiService.getStock({
        search: search || undefined,
        page,
        size: PAGE_SIZE,
      });
      setData(result);
    } catch {
      toast.error("Failed to load stock items");
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    load();
  }, [load]);

  const items = data?.content ?? [];
  const currentPage = data?.page ?? 0;
  const totalPages = data?.totalPages ?? 0;

  const buildPageRange = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 0; i < totalPages; i++) pages.push(i);
    } else {
      pages.push(0);
      if (currentPage > 2) pages.push("…");
      for (
        let i = Math.max(1, currentPage - 1);
        i <= Math.min(totalPages - 2, currentPage + 1);
        i++
      )
        pages.push(i);
      if (currentPage < totalPages - 3) pages.push("…");
      pages.push(totalPages - 1);
    }
    return pages;
  };

  const openCreate = () => {
    setEditing(null);
    setForm(emptyForm());
    setShowForm(true);
  };

  const openEdit = (item: StockItemResponse) => {
    setEditing(item);
    setForm({
      name: item.name,
      quantity: item.quantity,
      unit: item.unit,
      minimumThreshold: item.minimumThreshold ?? undefined,
      type: item.type,
    });
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
      if (editing) {
        await apiService.updateStockItem(editing.id, form);
        toast.success("Stock item updated");
      } else {
        await apiService.createStockItem(form);
        toast.success("Stock item added");
      }
      setShowForm(false);
      load();
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "Operation failed");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: StockItemResponse) => {
    if (!confirm(`Delete "${item.name}"?`)) return;
    try {
      await apiService.deleteStockItem(item.id);
      toast.success("Deleted");
      load();
    } catch {
      toast.error("Failed to delete");
    }
  };

  return (
    <div className="stock-page">
      <div className="stock-header">
        <div>
          <h1>Stock Management</h1>
          <p className="stock-subtitle">
            Track and manage ingredient inventory
          </p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + Add Ingredient
        </button>
      </div>

      <div className="stock-search">
        <input
          type="text"
          placeholder="Search ingredients..."
          value={searchInput}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="search-input"
        />
      </div>

      {loading ? (
        <div className="stock-loading">Loading inventory...</div>
      ) : (
        <>
          <div className="stock-table-wrapper">
            <table className="stock-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Quantity</th>
                  <th>Unit</th>
                  <th>Min. Threshold</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="empty-row">
                      No ingredients found
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className={item.lowStock ? "low-stock-row" : ""}
                    >
                      <td className="ingredient-name">{item.name}</td>
                      <td>
                        {parseFloat(
                          convertUnit(
                            item.quantity,
                            item.unit,
                            getDisplayUnit(item),
                          ).toFixed(2),
                        )}
                      </td>
                      <td>
                        <select
                          className="unit-display-select"
                          value={getDisplayUnit(item)}
                          onChange={(e) =>
                            setDisplayUnits((d) => ({
                              ...d,
                              [item.id]: e.target.value,
                            }))
                          }
                        >
                          {UNITS_BY_TYPE[item.type].map((u) => (
                            <option key={u} value={u}>
                              {u}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td>{item.minimumThreshold ?? "—"}</td>
                      <td>
                        {item.lowStock ? (
                          <span className="badge badge-warning">Low Stock</span>
                        ) : (
                          <span className="badge badge-ok">OK</span>
                        )}
                      </td>
                      <td className="actions-cell">
                        <button
                          className="btn-edit"
                          onClick={() => openEdit(item)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(item)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data && totalPages > 1 && (
            <div className="pagination">
              <div className="pagination-info">
                Showing {data.page * data.size + 1}–
                {Math.min((data.page + 1) * data.size, data.totalElements)} of{" "}
                {data.totalElements}
              </div>
              <div className="pagination-controls">
                <button
                  className="page-btn"
                  onClick={() => setPage(0)}
                  disabled={data.first}
                  title="First page"
                >
                  «
                </button>
                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p - 1)}
                  disabled={data.first}
                  title="Previous page"
                >
                  ‹
                </button>

                {buildPageRange().map((p, idx) =>
                  p === "…" ? (
                    <span key={`ellipsis-${idx}`} className="page-ellipsis">
                      …
                    </span>
                  ) : (
                    <button
                      key={p}
                      className={`page-btn ${p === currentPage ? "active" : ""}`}
                      onClick={() => setPage(p as number)}
                    >
                      {(p as number) + 1}
                    </button>
                  ),
                )}

                <button
                  className="page-btn"
                  onClick={() => setPage((p) => p + 1)}
                  disabled={data.last}
                  title="Next page"
                >
                  ›
                </button>
                <button
                  className="page-btn"
                  onClick={() => setPage(totalPages - 1)}
                  disabled={data.last}
                  title="Last page"
                >
                  »
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-box" onClick={(e) => e.stopPropagation()}>
            <h2>{editing ? "Edit Ingredient" : "Add Ingredient"}</h2>
            <form onSubmit={handleSubmit} className="stock-form">
              <label>
                Name
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  placeholder="e.g. onion"
                />
              </label>
              <label>
                Quantity
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.quantity}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      quantity: parseFloat(e.target.value) || 0,
                    }))
                  }
                  required
                />
              </label>
              <label>
                Type
                <select
                  value={form.type}
                  onChange={(e) => {
                    const type = e.target.value as StockType;
                    setForm((f) => ({
                      ...f,
                      type,
                      unit: UNITS_BY_TYPE[type][0],
                    }));
                  }}
                >
                  {(Object.keys(UNITS_BY_TYPE) as StockType[]).map((t) => (
                    <option key={t} value={t}>
                      {TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Unit
                <select
                  value={form.unit}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, unit: e.target.value }))
                  }
                >
                  {UNITS_BY_TYPE[form.type].map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Minimum Threshold (optional)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.minimumThreshold ?? ""}
                  onChange={(e) =>
                    setForm((f) => ({
                      ...f,
                      minimumThreshold: e.target.value
                        ? parseFloat(e.target.value)
                        : undefined,
                    }))
                  }
                  placeholder="Alert when below this value"
                />
              </label>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? "Saving..." : editing ? "Update" : "Add"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Stock;
