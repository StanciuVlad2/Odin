import { useState } from 'react'
import Section from '../../components/Section'
import './Contact.css'

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    date: '',
    time: '',
    guests: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement reservation logic
    console.log('Reservation submitted:', formData)
    alert('Thank you! Your reservation request has been received. We will contact you shortly.')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  return (
    <div className="page">
      <Section>
          <h1>Contact Us</h1>
          
          <div className="contact-content">
            <div className="contact-info">
              <h2>Visit Us</h2>
              
              <div className="info-item">
                <h3>📍 Location</h3>
                <p>123 Culinary Avenue<br />Downtown, City 12345</p>
              </div>
              
              <div className="info-item">
                <h3>📞 Phone</h3>
                <p>(555) 123-4567</p>
              </div>
              
              <div className="info-item">
                <h3>✉️ Email</h3>
                <p>info@odinrestaurant.com</p>
              </div>
              
              <div className="info-item">
                <h3>🕐 Opening Hours</h3>
                <p>
                  Monday - Thursday: 5:00 PM - 10:00 PM<br />
                  Friday - Saturday: 5:00 PM - 11:00 PM<br />
                  Sunday: 4:00 PM - 9:00 PM
                </p>
              </div>

              <div className="info-item">
                <h3>🌐 Follow Us</h3>
                <div className="social-links">
                  <a href="#facebook">Facebook</a>
                  <a href="#instagram">Instagram</a>
                  <a href="#twitter">Twitter</a>
                </div>
              </div>
            </div>

            <div className="contact-form-wrapper">
              <h2>Make a Reservation</h2>
              <form className="reservation-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <input
                    type="text"
                    name="name"
                    placeholder="Your Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <input
                    type="tel"
                    name="phone"
                    placeholder="Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <input
                      type="time"
                      name="time"
                      value={formData.time}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="form-group">
                  <select
                    name="guests"
                    value={formData.guests}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Number of Guests</option>
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4">4 Guests</option>
                    <option value="5">5 Guests</option>
                    <option value="6+">6+ Guests</option>
                  </select>
                </div>
                
                <button type="submit" className="submit-btn">Book Now</button>
              </form>
            </div>
          </div>
      </Section>
    </div>
  )
}

export default Contact
