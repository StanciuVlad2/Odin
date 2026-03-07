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
                <p>odin.dining@gmail.com</p>
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
          </div>
      </Section>
    </div>
  )
}

export default Contact
