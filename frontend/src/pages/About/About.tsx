import Section from '../../components/Section'
import './About.css'

function About() {
  return (
    <div className="page">
      <Section>
          <h1>About Odin Restaurant</h1>
          
          <div className="about-content">
            <div className="about-text">
              <h2>Our Story</h2>
              <p>
                Since 1995, Odin Restaurant has been a cornerstone of fine dining,
                offering an unforgettable culinary experience. Our master chefs
                combine traditional recipes with modern techniques to create
                dishes that delight all senses.
              </p>
              <p>
                We source only the finest local and international ingredients,
                ensuring every meal is prepared to perfection. Our commitment
                to excellence has earned us recognition as one of the premier
                dining destinations.
              </p>
              <h2>Our Philosophy</h2>
              <p>
                At Odin, we believe that dining is not just about food—it's about
                creating memorable experiences. Every detail, from the ambiance to
                the presentation, is carefully crafted to provide our guests with
                an exceptional journey through taste and elegance.
              </p>
            </div>

            <div className="about-stats">
              <div className="stat">
                <h3>30+</h3>
                <p>Years of Excellence</p>
              </div>
              <div className="stat">
                <h3>150+</h3>
                <p>Menu Items</p>
              </div>
              <div className="stat">
                <h3>50k+</h3>
                <p>Happy Customers</p>
              </div>
              <div className="stat">
                <h3>25+</h3>
                <p>Expert Staff</p>
              </div>
            </div>
          </div>
      </Section>
    </div>
  )
}

export default About
