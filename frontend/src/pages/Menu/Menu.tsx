import Section from '../../components/Section'
import './Menu.css'

function Menu() {
  const menuItems = {
    starters: [
      { name: 'Caesar Salad', description: 'Classic romaine with parmesan and croutons', price: '$12' },
      { name: 'French Onion Soup', description: 'Caramelized onions with gruyere cheese', price: '$14' },
      { name: 'Bruschetta', description: 'Toasted bread with tomato, basil, and mozzarella', price: '$10' }
    ],
    mains: [
      { name: 'Grilled Wagyu Steak', description: 'Prime cut wagyu beef with seasonal vegetables', price: '$85' },
      { name: 'Lobster Thermidor', description: 'Classic French preparation with cognac cream sauce', price: '$75' },
      { name: 'Truffle Pasta', description: 'Fresh handmade pasta with black truffle and parmigiano', price: '$45' },
      { name: 'Salmon Wellington', description: 'Fresh salmon wrapped in puff pastry with spinach', price: '$55' }
    ],
    desserts: [
      { name: 'Chocolate Soufflé', description: 'Light and airy with vanilla ice cream', price: '$18' },
      { name: 'Crème Brûlée', description: 'Classic French custard with caramelized sugar', price: '$15' },
      { name: 'Tiramisu', description: 'Italian classic with espresso and mascarpone', price: '$16' }
    ]
  }

  return (
    <div className="page">
      <Section>
        <h1>Our Menu</h1>
        <p className="menu-intro">Discover our selection of carefully crafted dishes</p>

          <div className="menu-category">
            <h2>🥗 Starters</h2>
            <div className="menu-grid">
              {menuItems.starters.map((item, index) => (
                <div key={index} className="menu-card">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="price">{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="menu-category">
            <h2>🍽️ Main Courses</h2>
            <div className="menu-grid">
              {menuItems.mains.map((item, index) => (
                <div key={index} className="menu-card">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="price">{item.price}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="menu-category">
            <h2>🍰 Desserts</h2>
            <div className="menu-grid">
              {menuItems.desserts.map((item, index) => (
                <div key={index} className="menu-card">
                  <h3>{item.name}</h3>
                  <p>{item.description}</p>
                  <span className="price">{item.price}</span>
                </div>
              ))}
            </div>
          </div>
      </Section>
    </div>
  )
}

export default Menu
