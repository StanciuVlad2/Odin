import { useState } from 'react'
import './OrderModal.css'

interface OrderModalProps {
  orderType: 'now' | 'pickup'
  onClose: () => void
  onOrderPlaced: () => void
}

interface MenuItem {
  id: number
  name: string
  price: number
  category: string
}

interface CartItem extends MenuItem {
  quantity: number
}

function OrderModal({ orderType, onClose, onOrderPlaced }: OrderModalProps) {
  const [selectedItems, setSelectedItems] = useState<CartItem[]>([])
  const [pickupTime, setPickupTime] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Mock menu items - replace with API call later
  const menuItems: MenuItem[] = [
    { id: 1, name: 'Pizza Margherita', price: 18.50, category: 'Pizza' },
    { id: 2, name: 'Pasta Carbonara', price: 16.00, category: 'Pasta' },
    { id: 3, name: 'Caesar Salad', price: 12.00, category: 'Salads' },
    { id: 4, name: 'Grilled Chicken', price: 20.00, category: 'Mains' },
    { id: 5, name: 'Tiramisu', price: 8.50, category: 'Desserts' },
    { id: 6, name: 'Espresso', price: 4.00, category: 'Beverages' },
  ]

  const addToCart = (item: MenuItem) => {
    const existingItem = selectedItems.find(i => i.id === item.id)
    if (existingItem) {
      setSelectedItems(selectedItems.map(i => 
        i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
      ))
    } else {
      setSelectedItems([...selectedItems, { ...item, quantity: 1 }])
    }
  }

  const removeFromCart = (itemId: number) => {
    const existingItem = selectedItems.find(i => i.id === itemId)
    if (existingItem && existingItem.quantity > 1) {
      setSelectedItems(selectedItems.map(i => 
        i.id === itemId ? { ...i, quantity: i.quantity - 1 } : i
      ))
    } else {
      setSelectedItems(selectedItems.filter(i => i.id !== itemId))
    }
  }

  const getTotal = () => {
    return selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }

  const getMinPickupTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    return now.toISOString().slice(0, 16)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (selectedItems.length === 0) {
      setError('Please select at least one item')
      return
    }

    if (orderType === 'pickup') {
      if (!pickupTime) {
        setError('Please select a pickup time')
        return
      }

      const selectedTime = new Date(pickupTime)
      const minTime = new Date()
      minTime.setHours(minTime.getHours() + 1)

      if (selectedTime < minTime) {
        setError('Pickup time must be at least 1 hour from now')
        return
      }
    }

    setLoading(true)

    try {
      // TODO: Implement API call to place order
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      alert(`Order placed successfully! ${orderType === 'pickup' ? 'Pickup time: ' + new Date(pickupTime).toLocaleString('ro-RO') : 'Your order will be ready soon!'}`)
      onOrderPlaced()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = []
    }
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, MenuItem[]>)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="order-modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <h2 className="modal-title">
          {orderType === 'now' ? '🍽️ Order Now' : '📦 Order for Pickup'}
        </h2>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="order-sections">
            {/* Menu Items */}
            <div className="menu-section">
              <h3>Select Items</h3>
              <div className="menu-items">
                {Object.entries(groupedItems).map(([category, items]) => (
                  <div key={category} className="menu-category">
                    <h4>{category}</h4>
                    {items.map(item => (
                      <div key={item.id} className="menu-item">
                        <div className="item-info">
                          <span className="item-name">{item.name}</span>
                          <span className="item-price">${item.price.toFixed(2)}</span>
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
            </div>

            {/* Cart */}
            <div className="cart-section">
              <h3>Your Order</h3>
              {selectedItems.length === 0 ? (
                <p className="empty-cart">No items selected</p>
              ) : (
                <div className="cart-items">
                  {selectedItems.map(item => (
                    <div key={item.id} className="cart-item">
                      <div className="cart-item-info">
                        <span className="cart-item-name">{item.name}</span>
                        <span className="cart-item-qty">x{item.quantity}</span>
                      </div>
                      <div className="cart-item-actions">
                        <span className="cart-item-price">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                        <button
                          type="button"
                          className="remove-btn"
                          onClick={() => removeFromCart(item.id)}
                        >
                          −
                        </button>
                      </div>
                    </div>
                  ))}
                  <div className="cart-total">
                    <span>Total:</span>
                    <span className="total-amount">${getTotal().toFixed(2)}</span>
                  </div>
                </div>
              )}

              {orderType === 'pickup' && (
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
                disabled={loading || selectedItems.length === 0}
              >
                {loading ? 'Placing Order...' : 'Place Order'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}

export default OrderModal
