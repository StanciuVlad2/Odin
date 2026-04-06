import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { apiService } from "../../services/api";
import type { OrderResponse, MenuItemResponse, FeedbackResponse } from "../../services/api";
import "./Orders.css";

type StatusFilter = "ALL" | "PENDING" | "COMPLETED" | "CANCELLED";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "badge-pending",
  COMPLETED: "badge-completed",
  CANCELLED: "badge-cancelled",
};

function Orders() {
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<StatusFilter>("ALL");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  // Create order form state
  const [showCreate, setShowCreate] = useState(false);
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [orderItems, setOrderItems] = useState<
    { menuItemId: string; quantity: number }[]
  >([]);
  const [tableId, setTableId] = useState("");
  const [notes, setNotes] = useState("");
  const [creating, setCreating] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState<Record<number, FeedbackResponse>>({});

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiService.getOrders(
        filter === "ALL" ? undefined : filter,
      );
      setOrders(data);
    } catch {
      toast.error("Failed to load orders");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const loadMenuItems = async () => {
    try {
      const data = await apiService.getMenuItems({ availableOnly: true });
      setMenuItems(data);
    } catch {
      toast.error("Failed to load menu items");
    }
  };

  const openCreate = async () => {
    await loadMenuItems();
    setOrderItems([{ menuItemId: "", quantity: 1 }]);
    setTableId("");
    setNotes("");
    setShowCreate(true);
  };

  const addOrderItem = () => {
    setOrderItems((prev) => [...prev, { menuItemId: "", quantity: 1 }]);
  };

  const removeOrderItem = (idx: number) => {
    setOrderItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateOrderItem = (
    idx: number,
    field: "menuItemId" | "quantity",
    value: string | number,
  ) => {
    setOrderItems((prev) => {
      const updated = [...prev];
      updated[idx] = { ...updated[idx], [field]: value };
      return updated;
    });
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = orderItems.filter((i) => i.menuItemId);
    if (validItems.length === 0) {
      toast.error("Add at least one item");
      return;
    }
    setCreating(true);
    try {
      await apiService.createOrder({
        tableId: tableId ? parseInt(tableId) : undefined,
        notes: notes || undefined,
        items: validItems,
      });
      toast.success("Order created!");
      setShowCreate(false);
      load();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to create order",
      );
    } finally {
      setCreating(false);
    }
  };

  const loadFeedback = async (orderId: number) => {
    if (feedbackMap[orderId] !== undefined) return;
    try {
      const feedback = await apiService.getFeedbackByOrderId(orderId);
      setFeedbackMap((prev) => ({ ...prev, [orderId]: feedback }));
    } catch {
      // No feedback for this order — that's fine
    }
  };

  const handleExpand = (orderId: number, status: string) => {
    const newId = expandedId === orderId ? null : orderId;
    setExpandedId(newId);
    if (newId !== null && status === "COMPLETED") {
      loadFeedback(orderId);
    }
  };

  const formatFoodQuality = (val: string) => {
    return val.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const handleStatusUpdate = async (orderId: number, newStatus: string) => {
    setUpdatingId(orderId);
    try {
      await apiService.updateOrderStatus(orderId, newStatus);
      toast.success(`Order marked as ${newStatus.toLowerCase()}`);
      load();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error ? err.message : "Failed to update status",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="orders-page">
      <div className="orders-header">
        <div>
          <h1>Orders</h1>
          <p className="orders-subtitle">Manage and track restaurant orders</p>
        </div>
        <button className="btn-primary" onClick={openCreate}>
          + New Order
        </button>
      </div>

      <div className="orders-filters">
        {(["ALL", "PENDING", "COMPLETED", "CANCELLED"] as StatusFilter[]).map(
          (s) => (
            <button
              key={s}
              className={`filter-btn ${filter === s ? "active" : ""}`}
              onClick={() => setFilter(s)}
            >
              {s}
            </button>
          ),
        )}
      </div>

      {loading ? (
        <div className="orders-loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">
          No orders found for the selected filter.
        </div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order.id} className="order-card">
              <div className="order-card-header">
                <div className="order-meta">
                  <span className="order-id">Order #{order.id}</span>
                  {order.tableId && (
                    <span className="order-table">Table {order.tableId}</span>
                  )}
                  <span
                    className={`badge ${STATUS_COLORS[order.status] || ""}`}
                  >
                    {order.status}
                  </span>
                </div>
                <div className="order-right">
                  <span className="order-total">
                    €{order.totalPrice.toFixed(2)}
                  </span>
                  <span className="order-date">
                    {new Date(order.createdAt).toLocaleString("ro-RO", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>

              {order.notes && <p className="order-notes">📝 {order.notes}</p>}

              <div className="order-expand">
                <button
                  className="btn-toggle"
                  onClick={() => handleExpand(order.id, order.status)}
                >
                  {expandedId === order.id
                    ? "▲ Hide items"
                    : `▼ ${order.items.length} item${order.items.length !== 1 ? "s" : ""}`}
                </button>
              </div>

              {expandedId === order.id && (
                <>
                  <table className="order-items-table">
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Qty</th>
                        <th>Unit Price</th>
                        <th>Subtotal</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item) => (
                        <tr key={item.id}>
                          <td>{item.menuItemName}</td>
                          <td>{item.quantity}</td>
                          <td>€{item.unitPrice.toFixed(2)}</td>
                          <td>€{item.subtotal.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {order.status === "COMPLETED" && feedbackMap[order.id] && (
                    <div className="feedback-display">
                      <h4>Customer Feedback</h4>
                      <div className="feedback-details">
                        <span className="feedback-detail-label">Food Quality:</span>
                        <span className="feedback-detail-value">
                          {formatFoodQuality(feedbackMap[order.id].foodQualityRating)}
                        </span>
                        <span className="feedback-detail-label">Service Speed:</span>
                        <span className="feedback-detail-value">
                          {formatFoodQuality(feedbackMap[order.id].serviceSpeedRating)}
                        </span>
                        <span className="feedback-detail-label">Would Recommend:</span>
                        <span className="feedback-detail-value">
                          {feedbackMap[order.id].wouldRecommend ? "Yes" : "No"}
                        </span>
                        <span className="feedback-detail-label">By:</span>
                        <span className="feedback-detail-value">
                          {feedbackMap[order.id].userEmail}
                        </span>
                      </div>
                      {feedbackMap[order.id].comment && (
                        <p className="feedback-comment">
                          "{feedbackMap[order.id].comment}"
                        </p>
                      )}
                      <p className="feedback-meta">
                        Submitted {new Date(feedbackMap[order.id].createdAt).toLocaleString("ro-RO")}
                      </p>
                    </div>
                  )}
                </>
              )}

              {order.status === "PENDING" && (
                <div className="order-actions">
                  <button
                    className="btn-complete"
                    disabled={updatingId === order.id}
                    onClick={() => handleStatusUpdate(order.id, "COMPLETED")}
                  >
                    {updatingId === order.id ? "..." : "✓ Complete"}
                  </button>
                  <button
                    className="btn-cancel-order"
                    disabled={updatingId === order.id}
                    onClick={() => handleStatusUpdate(order.id, "CANCELLED")}
                  >
                    ✕ Cancel
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Order Modal */}
      {showCreate && (
        <div className="modal-overlay" onClick={() => setShowCreate(false)}>
          <div
            className="modal-box modal-large"
            onClick={(e) => e.stopPropagation()}
          >
            <h2>New Order</h2>
            <form onSubmit={handleCreate} className="create-order-form">
              <div className="form-row">
                <label>
                  Table (optional)
                  <input
                    type="number"
                    min="1"
                    value={tableId}
                    onChange={(e) => setTableId(e.target.value)}
                    placeholder="Table number"
                  />
                </label>
                <label>
                  Notes
                  <input
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Special requests..."
                  />
                </label>
              </div>

              <div className="order-items-editor">
                <div className="order-items-editor-header">
                  <h3>Items</h3>
                  <button
                    type="button"
                    className="btn-add-ingredient"
                    onClick={addOrderItem}
                  >
                    + Add Item
                  </button>
                </div>
                {orderItems.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <select
                      value={item.menuItemId}
                      onChange={(e) =>
                        updateOrderItem(idx, "menuItemId", e.target.value)
                      }
                      required
                    >
                      <option value="">Select dish</option>
                      {menuItems.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name} — €{m.price.toFixed(2)}
                        </option>
                      ))}
                    </select>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) =>
                        updateOrderItem(
                          idx,
                          "quantity",
                          parseInt(e.target.value) || 1,
                        )
                      }
                    />
                    {orderItems.length > 1 && (
                      <button
                        type="button"
                        className="btn-remove"
                        onClick={() => removeOrderItem(idx)}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => setShowCreate(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={creating}
                >
                  {creating ? "Creating..." : "Create Order"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Orders;
