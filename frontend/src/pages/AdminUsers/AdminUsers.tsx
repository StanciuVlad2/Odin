import { useState, useEffect, useCallback, useRef } from "react";
import toast from "react-hot-toast";
import { apiService, ALL_ROLES } from "../../services/api";
import type { UserAdminResponse, PageResponse } from "../../services/api";
import "./AdminUsers.css";

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: "Admin",
  ROLE_MANAGER: "Manager",
  ROLE_CHEF: "Chef",
  ROLE_WAITER: "Waiter",
  ROLE_GUEST: "Guest",
};

const ROLE_COLORS: Record<string, string> = {
  ROLE_ADMIN: "badge-admin",
  ROLE_MANAGER: "badge-manager",
  ROLE_CHEF: "badge-chef",
  ROLE_WAITER: "badge-waiter",
  ROLE_GUEST: "badge-guest",
};

function RoleBadge({ role }: { role: string }) {
  return (
    <span className={`role-badge ${ROLE_COLORS[role] ?? "badge-guest"}`}>
      {ROLE_LABELS[role] ?? role}
    </span>
  );
}

interface EditRolesModalProps {
  user: UserAdminResponse;
  onSave: (userId: number, roles: string[]) => Promise<void>;
  onClose: () => void;
}

function EditRolesModal({ user, onSave, onClose }: EditRolesModalProps) {
  const [selected, setSelected] = useState<Set<string>>(new Set(user.roles));
  const [saving, setSaving] = useState(false);

  const toggle = (role: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(role) ? next.delete(role) : next.add(role);
      return next;
    });
  };

  const handleSave = async () => {
    if (selected.size === 0) {
      toast.error("User must have at least one role");
      return;
    }
    setSaving(true);
    try {
      await onSave(user.id, Array.from(selected));
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Edit Roles</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="modal-subtitle">{user.email}</p>
        <div className="roles-grid">
          {ALL_ROLES.map((role) => (
            <button
              key={role}
              type="button"
              className={`role-toggle role-toggle--${role.replace("ROLE_", "").toLowerCase()} ${selected.has(role) ? "active" : ""}`}
              onClick={() => toggle(role)}
            >
              {ROLE_LABELS[role]}
            </button>
          ))}
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleSave}
            disabled={saving || selected.size === 0}
          >
            {saving ? "Saving…" : "Save Roles"}
          </button>
        </div>
      </div>
    </div>
  );
}

interface CreateUserModalProps {
  onCreate: (email: string, password: string) => Promise<void>;
  onClose: () => void;
}

function CreateUserModal({ onCreate, onClose }: CreateUserModalProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const handleCreate = async () => {
    if (!email.trim() || !password.trim()) {
      toast.error("Email and password are required");
      return;
    }
    setSaving(true);
    try {
      await onCreate(email.trim(), password);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Create User</h3>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>
        <p className="modal-subtitle">Account will be created as verified</p>
        <div className="create-user-fields">
          <label className="field-label">Email</label>
          <input
            type="email"
            className="field-input"
            placeholder="user@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={saving}
          />
          <label className="field-label">Password</label>
          <input
            type="password"
            className="field-input"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={saving}
            onKeyDown={(e) => e.key === "Enter" && handleCreate()}
          />
        </div>
        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button
            className="btn-primary"
            onClick={handleCreate}
            disabled={saving || !email.trim() || !password.trim()}
          >
            {saving ? "Creating…" : "Create User"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminUsers() {
  const [data, setData] = useState<PageResponse<UserAdminResponse> | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState(""); // debounced value
  const [roleFilter, setRoleFilter] = useState("");
  const [page, setPage] = useState(0);
  const [editingUser, setEditingUser] = useState<UserAdminResponse | null>(
    null,
  );
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const PAGE_SIZE = 20;

  // Debounce search input — fires 400ms after user stops typing
  const handleSearchChange = useCallback((value: string) => {
    setSearchInput(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearch(value);
      setPage(0);
    }, 400);
  }, []);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await apiService.getAdminUsers({
        search,
        role: roleFilter || undefined,
        page,
        size: PAGE_SIZE,
      });
      setData(result);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load users");
    } finally {
      setLoading(false);
    }
  }, [search, roleFilter, page]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleRoleFilterChange = (value: string) => {
    setRoleFilter(value);
    setPage(0);
  };

  const handleSaveRoles = async (userId: number, roles: string[]) => {
    try {
      const updated = await apiService.updateUserRoles(userId, roles);
      setData((prev) =>
        prev
          ? {
              ...prev,
              content: prev.content.map((u) =>
                u.id === updated.id ? updated : u,
              ),
            }
          : prev,
      );
      toast.success("Roles updated successfully");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update roles",
      );
      throw err; // re-throw so modal can reset its loading state
    }
  };

  const handleCreateUser = async (email: string, password: string) => {
    try {
      await apiService.createAdminUser(email, password);
      toast.success(`User "${email}" created successfully`);
      await fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to create user");
      throw err;
    }
  };

  const handleDelete = async (user: UserAdminResponse) => {
    if (
      !window.confirm(
        `Are you sure you want to delete "${user.email}"? This action cannot be undone.`,
      )
    ) {
      return;
    }
    setDeletingId(user.id);
    try {
      await apiService.deleteAdminUser(user.id);
      toast.success(`User "${user.email}" deleted`);
      // Refetch — page might shift if last item on page was deleted
      await fetchUsers();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("ro-RO", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 0;

  const buildPageRange = (): (number | "…")[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i);
    const pages: (number | "…")[] = [0];
    if (currentPage > 2) pages.push("…");
    for (
      let i = Math.max(1, currentPage - 1);
      i <= Math.min(totalPages - 2, currentPage + 1);
      i++
    ) {
      pages.push(i);
    }
    if (currentPage < totalPages - 3) pages.push("…");
    pages.push(totalPages - 1);
    return pages;
  };

  return (
    <div className="admin-users-page">
      <div className="admin-container">
        {/* ── Header ── */}
        <header className="admin-header">
          <div className="admin-header-text">
            <h1>User Management</h1>
            <p className="admin-subtitle">
              {data ? `${data.totalElements} accounts registered` : "Loading…"}
            </p>
          </div>
          <button
            className="btn-primary"
            onClick={() => setShowCreateModal(true)}
          >
            + Add User
          </button>
        </header>

        {/* ── Filters ── */}
        <div className="filters-bar">
          <div className="search-wrapper">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              className="search-input"
              placeholder="Search by email…"
              value={searchInput}
              onChange={(e) => handleSearchChange(e.target.value)}
            />
            {searchInput && (
              <button
                className="search-clear"
                onClick={() => handleSearchChange("")}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>

          <select
            className="role-select"
            value={roleFilter}
            onChange={(e) => handleRoleFilterChange(e.target.value)}
          >
            <option value="">All Roles</option>
            {ALL_ROLES.map((role) => (
              <option key={role} value={role}>
                {ROLE_LABELS[role]}
              </option>
            ))}
          </select>
        </div>

        {/* ── Table ── */}
        <div className="table-wrapper">
          {loading ? (
            <div className="table-loading">
              <div className="spinner" />
              <span>Loading users…</span>
            </div>
          ) : !data || data.content.length === 0 ? (
            <div className="table-empty">
              <span className="empty-icon">👤</span>
              <p>No users found{search ? ` for "${search}"` : ""}.</p>
              {(search || roleFilter) && (
                <button
                  className="btn-secondary"
                  onClick={() => {
                    handleSearchChange("");
                    handleRoleFilterChange("");
                  }}
                >
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <table className="users-table">
              <thead>
                <tr>
                  <th className="col-id">ID</th>
                  <th className="col-email">Email</th>
                  <th className="col-roles">Roles</th>
                  <th className="col-status">Status</th>
                  <th className="col-created">Created At</th>
                  <th className="col-actions">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.content.map((user) => (
                  <tr key={user.id} className="user-row">
                    <td className="col-id">
                      <span className="id-chip">#{user.id}</span>
                    </td>
                    <td className="col-email">
                      <span className="email-text">{user.email}</span>
                    </td>
                    <td className="col-roles">
                      <div className="roles-list">
                        {user.roles.map((role) => (
                          <RoleBadge key={role} role={role} />
                        ))}
                      </div>
                    </td>
                    <td className="col-status">
                      <span
                        className={`status-pill ${user.emailVerified ? "verified" : "unverified"}`}
                      >
                        {user.emailVerified ? "✓ Verified" : "⏳ Unverified"}
                      </span>
                    </td>
                    <td className="col-created">
                      <span className="date-text">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="col-actions">
                      <div className="action-buttons">
                        <button
                          className="btn-edit"
                          onClick={() => setEditingUser(user)}
                          title="Edit roles"
                        >
                          ✏️ Roles
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDelete(user)}
                          disabled={deletingId === user.id}
                          title="Delete user"
                        >
                          {deletingId === user.id ? "…" : "🗑️"}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination ── */}
        {data && data.totalPages > 1 && (
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
                onClick={() => setPage(data.totalPages - 1)}
                disabled={data.last}
                title="Last page"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit Roles Modal ── */}
      {editingUser && (
        <EditRolesModal
          user={editingUser}
          onSave={handleSaveRoles}
          onClose={() => setEditingUser(null)}
        />
      )}

      {/* ── Create User Modal ── */}
      {showCreateModal && (
        <CreateUserModal
          onCreate={handleCreateUser}
          onClose={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
}

export default AdminUsers;
