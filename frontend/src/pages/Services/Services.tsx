import Section from '../../components/Section'
import './Services.css'

function Services() {
  return (
    <div className="page">
      <Section>
          <h1>Our Services</h1>
          <p className="services-intro">
            Beyond exceptional dining, we offer a range of premium services to make your experience unforgettable
          </p>

          <div className="services-grid">
            <div className="service-card large">
              <span className="service-icon">🎉</span>
              <h3>Private Events</h3>
              <p>
                Host your special occasions in our elegant private dining rooms. 
                Perfect for birthdays, anniversaries, corporate events, and celebrations. 
                Our event coordinators will work with you to create a customized menu 
                and ambiance for your gathering.
              </p>
              <ul>
                <li>Capacity: Up to 50 guests</li>
                <li>Custom menu planning</li>
                <li>Dedicated event coordinator</li>
                <li>Audio/visual equipment available</li>
              </ul>
            </div>

            <div className="service-card large">
              <span className="service-icon">👨‍🍳</span>
              <h3>Chef's Table Experience</h3>
              <p>
                An exclusive dining experience where you sit at a special table in our kitchen, 
                watching our executive chef prepare a multi-course tasting menu designed 
                specifically for you. Limited to 6 guests per evening.
              </p>
              <ul>
                <li>8-course tasting menu</li>
                <li>Wine pairing included</li>
                <li>Interactive with chef</li>
                <li>Advance reservation required</li>
              </ul>
            </div>

            <div className="service-card">
              <span className="service-icon">🚚</span>
              <h3>Catering Services</h3>
              <p>
                Bring Odin's excellence to your venue. Our catering team delivers 
                restaurant-quality food for your off-site events.
              </p>
            </div>

            <div className="service-card">
              <span className="service-icon">🍷</span>
              <h3>Wine Pairing</h3>
              <p>
                Our sommelier curates perfect wine selections to complement 
                your meal, enhancing every flavor.
              </p>
            </div>

            <div className="service-card">
              <span className="service-icon">🎓</span>
              <h3>Cooking Classes</h3>
              <p>
                Learn from our master chefs in hands-on cooking workshops. 
                Classes available monthly for all skill levels.
              </p>
            </div>

            <div className="service-card">
              <span className="service-icon">🎁</span>
              <h3>Gift Certificates</h3>
              <p>
                Share the gift of exceptional dining. Available in any denomination 
                and redeemable for dining or services.
              </p>
            </div>
          </div>
      </Section>
    </div>
  )
}

export default Services
