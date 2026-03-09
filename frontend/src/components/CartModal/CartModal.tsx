import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext";
import { apiService } from "../../services/api";
import type { ReservationResponse } from "../../services/api";
import "./CartModal.css";

interface CartModalProps {
  onClose: () => void;
}

type OrderType = "pickup" | "table";
type Step = "cart" | "checkout";

function CartModal({ onClose }: CartModalProps) {
  const { items, removeItem, updateQty, clearCart, totalPrice } = useCart();
  const [step, setStep] = useState<Step>("cart");
  const [orderType, setOrderType] = useState<OrderType>("table");
  const [pickupTime, setPickupTime] = useState("");
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [loadingRes, setLoadingRes] = useState(false);
  const [selectedRes, setSelectedRes] = useState<ReservationResponse | null>(
    null,
  );
  const [submitting, setSubmitting] = useState(false);

  const getMinPickupTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  };

  useEffect(() => {
    if (step !== "checkout" || orderType !== "table") return;

    const load = async () => {
      setLoadingRes(true);
      try {
        const all = await apiService.getMyReservations(true);
        const today = new Date().toISOString().slice(0, 10);
        const active = all.filter(
          (r) => r.reservationDate === today && r.status !== "CANCELLED",
        );
        setReservations(active);
        if (active.length === 1) setSelectedRes(active[0]);
        else setSelectedRes(null);
      } catch {
        toast.error("Failed to load reservations");
      } finally {
        setLoadingRes(false);
      }
    };

    load();
  }, [step, orderType]);

  const handleSubmit = async () => {
    if (items.length === 0) return;

    if (orderType === "pickup") {
      if (!pickupTime) {
        toast.error("Please select a pickup time");
        return;
      }
      const selected = new Date(pickupTime);
      const min = new Date();
      min.setHours(min.getHours() + 1);
      if (selected < min) {
        toast.error("Pickup time must be at least 1 hour from now");
        return;
      }
    }

    if (orderType === "table" && !selectedRes) {
      toast.error("Please select a table from your reservations");
      return;
    }

    setSubmitting(true);
    try {
      await apiService.createOrder({
        tableId: orderType === "table" ? selectedRes!.tableId : undefined,
        notes:
          orderType === "pickup"
            ? `Pickup at: ${new Date(pickupTime).toLocaleString("ro-RO")}`
            : undefined,
        items: items.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
        })),
      });
      clearCart();
      toast.success(
        orderType === "pickup"
          ? `Order placed! Pickup at ${new Date(pickupTime).toLocaleString("ro-RO")} 📦`
          : `Order placed for Table ${selectedRes!.tableNumber}! 🍽️`,
      );
      onClose();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to place order",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const canSubmit =
    !submitting &&
    items.length > 0 &&
    (orderType === "pickup" ? !!pickupTime : !!selectedRes);

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cart-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="cart-modal-header">
          <h2>
            {step === "cart" ? "🛒 Your Cart" : "📋 Checkout"}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ×
          </button>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <span className="cart-empty-icon">🛒</span>
            <p>Your cart is empty</p>
            <button className="btn-secondary" onClick={onClose}>
              Browse Menu
            </button>
          </div>
        ) : step === "cart" ? (
          /* ── Step 1: Cart ── */
          <>
            <div className="cart-items-list">
              {items.map((item) => (
                <div key={item.menuItemId} className="cart-line">
                  <div className="cart-line-info">
                    <span className="cart-line-name">{item.name}</span>
                    <span className="cart-line-unit">
                      €{item.price.toFixed(2)} / buc
                    </span>
                  </div>
                  <div className="cart-line-controls">
                    <button
                      className="qty-btn"
                      onClick={() =>
                        updateQty(item.menuItemId, item.quantity - 1)
                      }
                    >
                      −
                    </button>
                    <span className="qty-value">{item.quantity}</span>
                    <button
                      className="qty-btn"
                      onClick={() =>
                        updateQty(item.menuItemId, item.quantity + 1)
                      }
                    >
                      +
                    </button>
                    <button
                      className="cart-remove"
                      onClick={() => removeItem(item.menuItemId)}
                      title="Remove"
                    >
                      🗑
                    </button>
                    <span className="cart-line-subtotal">
                      €{(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-total-row">
              <span>Total</span>
              <span className="cart-total-amount">
                €{totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="cart-footer-actions">
              <button className="btn-secondary" onClick={onClose}>
                Continue shopping
              </button>
              <button
                className="btn-primary"
                onClick={() => setStep("checkout")}
              >
                Checkout →
              </button>
            </div>
          </>
        ) : (
          /* ── Step 2: Checkout ── */
          <>
            {/* Order type toggle */}
            <div className="checkout-section">
              <p className="checkout-label">How do you want to receive it?</p>
              <div className="order-type-toggle">
                <button
                  className={`order-type-btn ${orderType === "table" ? "active" : ""}`}
                  onClick={() => setOrderType("table")}
                >
                  🍽️ At your table
                </button>
                <button
                  className={`order-type-btn ${orderType === "pickup" ? "active" : ""}`}
                  onClick={() => setOrderType("pickup")}
                >
                  📦 Pick-up
                </button>
              </div>
            </div>

            {/* Pickup time */}
            {orderType === "pickup" && (
              <div className="checkout-section">
                <label className="checkout-field-label">
                  Pickup time{" "}
                  <span className="checkout-field-hint">
                    (minimum 1 hour from now)
                  </span>
                </label>
                <input
                  type="datetime-local"
                  className="checkout-datetime"
                  value={pickupTime}
                  min={getMinPickupTime()}
                  onChange={(e) => setPickupTime(e.target.value)}
                />
              </div>
            )}

            {/* Reservation picker */}
            {orderType === "table" && (
              <div className="checkout-section">
                <label className="checkout-field-label">
                  Your reservation today
                </label>
                {loadingRes ? (
                  <p className="res-loading">Loading…</p>
                ) : reservations.length === 0 ? (
                  <div className="no-reservations">
                    <p>No active reservations found for today.</p>
                    <a
                      href="/reservations"
                      className="res-link"
                      onClick={onClose}
                    >
                      Make a reservation →
                    </a>
                  </div>
                ) : (
                  <div className="res-cards">
                    {reservations.map((r) => (
                      <button
                        key={r.id}
                        className={`res-card ${selectedRes?.id === r.id ? "selected" : ""}`}
                        onClick={() => setSelectedRes(r)}
                      >
                        <span className="res-table">
                          Table {r.tableNumber}
                        </span>
                        <span className="res-time">
                          {r.startTime} – {r.endTime}
                        </span>
                        <span className="res-party">{r.partySize} guests</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Order summary */}
            <div className="checkout-summary">
              <span>{items.reduce((s, i) => s + i.quantity, 0)} items</span>
              <span className="cart-total-amount">
                €{totalPrice.toFixed(2)}
              </span>
            </div>

            <div className="cart-footer-actions">
              <button className="btn-secondary" onClick={() => setStep("cart")}>
                ← Back
              </button>
              <button
                className="btn-primary"
                onClick={handleSubmit}
                disabled={!canSubmit}
              >
                {submitting ? "Placing…" : "Place Order"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default CartModal;
