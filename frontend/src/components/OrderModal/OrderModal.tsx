import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { apiService } from "../../services/api";
import type { MenuItemResponse } from "../../services/api";
import "./OrderModal.css";

interface OrderModalProps {
  orderType: "now" | "pickup";
  onClose: () => void;
  onOrderPlaced: () => void;
}

interface CartItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
}

const CATEGORY_LABELS: Record<string, string> = {
  starter: "🥗 Starters",
  main: "🍽️ Main Courses",
  dessert: "🍰 Desserts",
  beverage: "🥤 Beverages",
  pizza: "🍕 Pizzas",
  burger: "🍔 Burgers",
  salad: "🥙 Salads",
  soup: "🍜 Soups",
};

function OrderModal({ orderType, onClose, onOrderPlaced }: OrderModalProps) {
  const [menuItems, setMenuItems] = useState<MenuItemResponse[]>([]);
  const [menuLoading, setMenuLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [pickupTime, setPickupTime] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    apiService
      .getMenuItems({ availableOnly: true })
      .then(setMenuItems)
      .catch(() => toast.error("Failed to load menu"))
      .finally(() => setMenuLoading(false));
  }, []);

  const addToCart = (item: MenuItemResponse) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === item.id);
      if (existing) {
        return prev.map((i) =>
          i.menuItemId === item.id ? { ...i, quantity: i.quantity + 1 } : i,
        );
      }
      return [
        ...prev,
        {
          menuItemId: item.id,
          name: item.name,
          price: item.price,
          quantity: 1,
        },
      ];
    });
  };

  const removeFromCart = (menuItemId: string) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItemId);
      if (existing && existing.quantity > 1) {
        return prev.map((i) =>
          i.menuItemId === menuItemId ? { ...i, quantity: i.quantity - 1 } : i,
        );
      }
      return prev.filter((i) => i.menuItemId !== menuItemId);
    });
  };

  const getTotal = () => cart.reduce((sum, i) => sum + i.price * i.quantity, 0);

  const getMinPickupTime = () => {
    const d = new Date();
    d.setHours(d.getHours() + 1);
    return d.toISOString().slice(0, 16);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (cart.length === 0) {
      toast.error("Please select at least one item");
      return;
    }

    if (orderType === "pickup") {
      if (!pickupTime) {
        toast.error("Please select a pickup time");
        return;
      }
      if (new Date(pickupTime) < new Date(getMinPickupTime())) {
        toast.error("Pickup time must be at least 1 hour from now");
        return;
      }
    }

    setSubmitting(true);
    try {
      await apiService.createOrder({
        notes:
          orderType === "pickup"
            ? `Pickup at: ${new Date(pickupTime).toLocaleString("ro-RO")}`
            : undefined,
        items: cart.map((i) => ({
          menuItemId: i.menuItemId,
          quantity: i.quantity,
        })),
      });
      toast.success(
        orderType === "pickup"
          ? `Order placed! Pickup at ${new Date(pickupTime).toLocaleString("ro-RO")} 📦`
          : "Order placed! Your food will be ready soon 🍽️",
        { duration: 4000 },
      );
      onOrderPlaced();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to place order");
    } finally {
      setSubmitting(false);
    }
  };

  const grouped = menuItems.reduce<Record<string, MenuItemResponse[]>>(
    (acc, item) => {
      const key = item.category ?? "other";
      if (!acc[key]) acc[key] = [];
      acc[key].push(item);
      return acc;
    },
    {},
  );

  const categoryOrder = [
    "starter",
    "soup",
    "salad",
    "pizza",
    "burger",
    "main",
    "dessert",
    "beverage",
  ];
  const sortedCategories = [
    ...categoryOrder.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !categoryOrder.includes(c)),
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>
          ×
        </button>

        <h2 className="modal-title">
          {orderType === "now" ? "🍽️ Order Now" : "📦 Order for Pickup"}
        </h2>

        <form onSubmit={handleSubmit}>
          <div className="order-sections">
            {/* Menu Items */}
            <div className="menu-section">
              <h3>Select Items</h3>
              {menuLoading ? (
                <p className="empty-cart">Loading menu…</p>
              ) : (
                <div className="menu-items">
                  {sortedCategories.map((category) => (
                    <div key={category} className="menu-category">
                      <h4>
                        {CATEGORY_LABELS[category] ??
                          `🍴 ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                      </h4>
                      {grouped[category].map((item) => (
                        <div key={item.id} className="menu-item">
                          <div className="item-info">
                            <span className="item-name">{item.name}</span>
                            <span className="item-price">
                              €{item.price.toFixed(2)}
                            </span>
                          </div>
                          <button
                            type="button"
                            className="add-btn"
                            onClick={() => addToCart(item)}
                          >
                            +
                          </button>
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart */}
            <div className="cart-section">
              <h3>Your Order</h3>
              {cart.length === 0 ? (
                <p className="empty-cart">No items selected</p>
              ) : (
                <div className="cart-items">
                  {cart.map((item) => (
                    <div key={item.menuItemId} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-qty">×{item.quantity}</span>
                      </div>
                      <div className="cart-item-actions">
                        <span className="cart-item-price">
                          €{(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeFromCart(item.menuItemId)}
                        >
                          −
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="cart-total">
                    <span>Total:</span>
                    <span className="total-amount">
                      €{getTotal().toFixed(2)}
                    </span>
                  </div>
                </div>
              )}

              {orderType === "pickup" && (
                <div className="pickup-time-section">
                  <label htmlFor="pickupTime">Pickup Time:</label>
                  <input
                    type="datetime-local"
                    id="pickupTime"
                    value={pickupTime}
                    onChange={(e) => setPickupTime(e.target.value)}
                    min={getMinPickupTime()}
                    required
                  />
                  <p className="time-note">Minimum 1 hour from now</p>
                </div>
              )}

              <button
                type="submit"
                className="submit-order-btn"
                disabled={submitting || cart.length === 0}
              >
                {submitting ? "Placing Order…" : "Place Order"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default OrderModal;
