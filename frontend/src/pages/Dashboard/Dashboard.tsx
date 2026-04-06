import { useState, useEffect } from 'react'
import { apiService } from '../../services/api'
import type { OrderResponse } from '../../services/api'
import OrderModal from '../../components/OrderModal/OrderModal'
import FeedbackModal from '../../components/FeedbackModal/FeedbackModal'
import './Dashboard.css'

function Dashboard() {
  const [orders, setOrders] = useState<OrderResponse[]>([])
  const [filteredOrders, setFilteredOrders] = useState<OrderResponse[]>([])
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [orderType, setOrderType] = useState<'now' | 'pickup'>('now')
  const [userEmail, setUserEmail] = useState<string>('')
  const [feedbackOrderId, setFeedbackOrderId] = useState<number | null>(null)
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<Set<number>>(new Set())

  useEffect(() => {
    loadUserInfo()
    loadOrders()
  }, [])

  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredOrders(orders)
    } else {
      setFilteredOrders(orders.filter(order => order.status === statusFilter.toUpperCase()))
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
    try {
      const data = await apiService.getMyOrders()
      setOrders(data)

      const completedOrders = data.filter(o => o.status === 'COMPLETED')
      const submitted = new Set<number>()
      await Promise.all(
        completedOrders.map(async (order) => {
          try {
            const exists = await apiService.feedbackExistsForOrder(order.id)
            if (exists) submitted.add(order.id)
          } catch { /* ignore */ }
        })
      )
      setFeedbackSubmitted(submitted)
    } catch (err) {
      console.error('Failed to load orders:', err)
    }
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
              <option value="PENDING">Pending</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
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
                <div key={order.id} className={`order-card ${order.status.toLowerCase()}`}>
                  <div className="order-header">
                    <span className="order-id">Order #{order.id}</span>
                    <span className={`order-status status-${order.status.toLowerCase()}`}>
                      {order.status.charAt(0) + order.status.slice(1).toLowerCase()}
                    </span>
                  </div>
                  <div className="order-items">
                    {order.items.map((item) => (
                      <span key={item.id} className="order-item">
                        {item.quantity}× {item.menuItemName}
                      </span>
                    ))}
                  </div>
                  <div className="order-footer">
                    <span className="order-date">{formatDate(order.createdAt)}</span>
                    {order.notes && (
                      <span className="pickup-time">Note: {order.notes}</span>
                    )}
                    <span className="order-total">${order.totalPrice.toFixed(2)}</span>
                  </div>
                  {order.status === 'COMPLETED' && (
                    <div className="order-feedback-action">
                      {feedbackSubmitted.has(order.id) ? (
                        <span className="feedback-submitted-badge">Feedback Submitted</span>
                      ) : (
                        <button
                          className="btn-feedback"
                          onClick={() => setFeedbackOrderId(order.id)}
                        >
                          Leave Feedback
                        </button>
                      )}
                    </div>
                  )}
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

      {feedbackOrderId !== null && (
        <FeedbackModal
          orderId={feedbackOrderId}
          onClose={() => setFeedbackOrderId(null)}
          onSubmitted={() => {
            setFeedbackSubmitted(prev => new Set(prev).add(feedbackOrderId))
            setFeedbackOrderId(null)
          }}
        />
      )}
    </div>
  )
}

export default Dashboard
