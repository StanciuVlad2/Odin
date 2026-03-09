import { useState, useEffect } from 'react';
import Section from '../../components/Section';
import { apiService } from '../../services/api';
import type { MenuItemResponse } from '../../services/api';
import './Menu.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const CATEGORY_LABELS: Record<string, string> = {
  starter: '🥗 Starters',
  main: '🍽️ Main Courses',
  dessert: '🍰 Desserts',
  beverage: '🥤 Beverages',
  pizza: '🍕 Pizzas',
  burger: '🍔 Burgers',
  salad: '🥙 Salads',
  soup: '🍜 Soups',
};

function Menu() {
  const [items, setItems] = useState<MenuItemResponse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiService
      .getMenuItems({ availableOnly: true })
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const grouped = items.reduce<Record<string, MenuItemResponse[]>>((acc, item) => {
    const key = item.category ?? 'other';
    if (!acc[key]) acc[key] = [];
    acc[key].push(item);
    return acc;
  }, {});

  const categoryOrder = ['starter', 'soup', 'salad', 'pizza', 'burger', 'main', 'dessert', 'beverage'];
  const sortedCategories = [
    ...categoryOrder.filter((c) => grouped[c]),
    ...Object.keys(grouped).filter((c) => !categoryOrder.includes(c)),
  ];

  return (
    <div className="page">
      <Section>
        <h1>Our Menu</h1>
        <p className="menu-intro">Discover our selection of carefully crafted dishes</p>

        {loading ? (
          <p className="menu-loading">Loading menu...</p>
        ) : items.length === 0 ? (
          <p className="menu-empty">No menu items available at the moment.</p>
        ) : (
          sortedCategories.map((category) => (
            <div key={category} className="menu-category">
              <h2>{CATEGORY_LABELS[category] ?? `🍴 ${category.charAt(0).toUpperCase() + category.slice(1)}`}</h2>
              <div className="menu-grid">
                {grouped[category].map((item) => (
                  <div key={item.id} className="menu-card">
                    {item.imageUrl && (
                      <img
                        src={item.imageUrl.startsWith('http') ? item.imageUrl : `${API_BASE_URL}${item.imageUrl}`}
                        alt={item.name}
                        className="menu-card-image"
                      />
                    )}
                    <div className="menu-card-body">
                      <h3>{item.name}</h3>
                      {item.description && <p>{item.description}</p>}
                      <span className="price">€{item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))
        )}
      </Section>
    </div>
  );
}

export default Menu;
