import { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import OrderModal from '../../components/OrderModal/OrderModal'
import './Dashboard.css'

interface Order {
  id: number
  items: string[]
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  date: string
  pickupTime?: string
}

function Dashboard() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderType, setOrderType] = useState<'now' | 'pickup'>('now')
  const [userEmail, setUserEmail] = useState<string>('')

  useEffect(() => {
    loadUserInfo()
    loadOrders()
  }, [])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter))
    }
  }, [statusFilter, orders])

  const loadUserInfo = async () => {
    try {
      const data = await apiService.me()
      setUserEmail(data.email || '')
    } catch (err) {
      console.error('Failed to load user info:', err)
    }
  }

  const loadOrders = async () => {
    // TODO: Implement API call to fetch orders
    // For now, using mock data
    const mockOrders: Order[] = [
      {
        id: 1,
        items: ['Pizza Margherita', 'Pasta Carbonara'],
        total: 45.50,
        status: 'completed',
        date: '2025-11-28T18:30:00',
      },
      {
        id: 2,
        items: ['Caesar Salad', 'Grilled Chicken'],
        total: 32.00,
        status: 'pending',
        date: '2025-11-30T12:15:00',
        pickupTime: '2025-11-30T13:30:00',
      },
      {
        id: 3,
        items: ['Tiramisu', 'Espresso'],
        total: 12.50,
        status: 'completed',
        date: '2025-11-25T16:45:00',
      },
    ]
    setOrders(mockOrders)
  }

  const handleOrderNow = () => {
    setOrderType('now')
    setShowOrderModal(true)
  }

  const handleOrderPickup = () => {
    setOrderType('pickup')
    setShowOrderModal(true)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ro-RO', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="dashboard">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <h1>Welcome, {userEmail}!</h1>
          <p className="subtitle">Manage your orders and place new ones</p>
        </header>

        <div className="order-actions">
          <button className="order-btn order-now-btn" onClick={handleOrderNow}>
            🍽️ Order Now
          </button>
          <button className="order-btn order-pickup-btn" onClick={handleOrderPickup}>
            📦 Order for Pickup
          </button>
        </div>

        <section className="my-orders">
          <div className="orders-header">
            <h2>My Orders</h2>
            <div className="filter-controls">
              <label>Filter by status:</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
                className="status-filter"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="no-orders">
              <p>No orders found.</p>
            </div>
          ) : (
            <div className="orders-list">
              {filteredOrders.map(order => (
                <div key={order.id} className={`order-card ${order.status}`}>
                  <div className="order-header">
                    <span className="order-id">Order #{order.id}</span>
                    <span className={`order-status status-${order.status}`}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <span key={idx} className="order-item">{item}</span>
                    ))}
                  </div>
                  <div className="order-footer">
                    <span className="order-date">{formatDate(order.date)}</span>
                    {order.pickupTime && (
                      <span className="pickup-time">
                        Pickup: {formatDate(order.pickupTime)}
                      </span>
                    )}
                    <span className="order-total">${order.total.toFixed(2)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {showOrderModal && (
        <OrderModal
          orderType={orderType}
          onClose={() => setShowOrderModal(false)}
          onOrderPlaced={() => {
            setShowOrderModal(false)
            loadOrders()
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
