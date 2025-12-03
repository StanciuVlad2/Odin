import { useState, useEffect } from 'react'
import toast from 'react-hot-toast'
import { apiService } from '../../services/api'
import type { AvailabilityResponse, TimeSlotAvailability, CreateReservationRequest } from '../../services/api'
import './Reservations.css'

const Reservations = () => {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [partySize, setPartySize] = useState<number | undefined>(undefined)
  const [availability, setAvailability] = useState<AvailabilityResponse | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlotAvailability | null>(null)
  const [selectedTableId, setSelectedTableId] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  
  // Form fields
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [notes, setNotes] = useState('')

  const today = new Date().toISOString().split('T')[0]

  useEffect(() => {
    if (selectedDate) {
      checkAvailability()
    }
  }, [selectedDate, partySize])

  const checkAvailability = async () => {
    setLoading(true)
    setSelectedSlot(null)
    setSelectedTableId(null)
    try {
      const response = await apiService.checkAvailability(selectedDate, partySize)
      setAvailability(response)
      if (response.availableSlots.length === 0) {
        toast.error('No available time slots for this date')
      }
    } catch (error) {
      toast.error('Failed to check availability')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  const handleSlotSelection = (slot: TimeSlotAvailability) => {
    setSelectedSlot(slot)
    setSelectedTableId(null)
  }

  const handleTableSelection = (tableId: number) => {
    setSelectedTableId(tableId)
  }

  const handleSubmitReservation = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedSlot || !selectedTableId) {
      toast.error('Please select a time slot and table')
      return
    }

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Name and phone are required')
      return
    }

    const reservationData: CreateReservationRequest = {
      tableId: selectedTableId,
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      customerEmail: customerEmail.trim() || undefined,
      partySize: partySize || 2,
      reservationDate: selectedDate,
      startTime: selectedSlot.startTime,
      notes: notes.trim() || undefined,
    }

    setLoading(true)
    try {
      await apiService.createReservation(reservationData)
      toast.success('Reservation created successfully!')
      
      // Reset form
      setCustomerName('')
      setCustomerPhone('')
      setCustomerEmail('')
      setNotes('')
      setSelectedSlot(null)
      setSelectedTableId(null)
      
      // Refresh availability
      checkAvailability()
    } catch (error: any) {
      toast.error(error.message || 'Failed to create reservation')
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="reservations-page">
      <div className="container">
        <h1 className="page-title">Make a Reservation</h1>

        <div className="reservations-content">
          {/* Date and Party Size Selection */}
          <section className="selection-section">
            <div className="form-group">
              <label htmlFor="date">Select Date</label>
              <input
                type="date"
                id="date"
                min={today}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="partySize">Number of People (Optional)</label>
              <input
                type="number"
                id="partySize"
                min="1"
                max="20"
                value={partySize || ''}
                onChange={(e) => setPartySize(e.target.value ? parseInt(e.target.value) : undefined)}
                placeholder="Filter by party size"
                className="form-input"
              />
            </div>
          </section>

          {/* Available Time Slots */}
          {selectedDate && availability && (
            <section className="time-slots-section">
              <h2>Available Time Slots</h2>
              {loading ? (
                <p>Loading availability...</p>
              ) : availability.availableSlots.length === 0 ? (
                <p className="no-availability">No tables available for this date</p>
              ) : (
                <div className="time-slots-grid">
                  {availability.availableSlots.map((slot) => (
                    <button
                      key={slot.timeSlot}
                      onClick={() => handleSlotSelection(slot)}
                      className={`time-slot-btn ${selectedSlot?.timeSlot === slot.timeSlot ? 'selected' : ''}`}
                    >
                      {slot.startTime} - {slot.endTime}
                    </button>
                  ))}
                </div>
              )}
            </section>
          )}

          {/* Floor Plan */}
          {selectedSlot && (
            <section className="floor-plan-section">
              <h2>Select a Table</h2>
              <div className="floor-plan">
                {selectedSlot.tables.map((table) => (
                  <div
                    key={table.id}
                    onClick={() => table.available && handleTableSelection(table.id)}
                    className={`table-box ${table.available ? 'available' : 'reserved'} ${
                      selectedTableId === table.id ? 'selected' : ''
                    }`}
                    style={{
                      left: `${table.xposition ?? 100}px`,
                      top: `${table.yposition ?? 100}px`,
                      width: `${table.width ?? 100}px`,
                      height: `${table.height ?? 100}px`,
                    }}
                  >
                    <span className="table-number">#{table.tableNumber}</span>
                    <span className="table-capacity">{table.capacity} seats</span>
                  </div>
                ))}
              </div>
              <div className="legend">
                <div className="legend-item">
                  <div className="legend-color available"></div>
                  <span>Available</span>
                </div>
                <div className="legend-item">
                  <div className="legend-color reserved"></div>
                  <span>Reserved</span>
                </div>
              </div>
            </section>
          )}

          {/* Reservation Form */}
          {selectedTableId && (
            <section className="reservation-form-section">
              <h2>Complete Your Reservation</h2>
              <form onSubmit={handleSubmitReservation} className="reservation-form">
                <div className="form-group">
                  <label htmlFor="name">Name *</label>
                  <input
                    type="text"
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="phone">Phone *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    required
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email (Optional)</label>
                  <input
                    type="email"
                    id="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="notes">Special Requests (Optional)</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="form-input"
                  />
                </div>

                <button type="submit" disabled={loading} className="submit-btn">
                  {loading ? 'Creating Reservation...' : 'Confirm Reservation'}
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

export default Reservations
