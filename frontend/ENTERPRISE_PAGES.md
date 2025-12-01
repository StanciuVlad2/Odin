# Enterprise Pages Implementation

## Overview
Am implementat două pagini enterprise cu role-based access control:

### 1. **Guest Dashboard** (`/dashboard`)
Accesibil doar pentru utilizatori cu rol **ROLE_GUEST**

#### Funcționalități:
- **My Orders Section**
  - Afișare comenzi anterioare cu detalii complete
  - Filtrare după status: All, Pending, Completed, Cancelled
  - Informații afișate: items, total, dată, pickup time (dacă există)
  
- **Order Now Button** (🍽️)
  - Comandă imediată pentru livrare
  - Selectare multiple iteme din meniu
  - Adăugare/ștergere cantități
  - Calcul automat total

- **Order for Pickup Button** (📦)
  - Comandă pentru ridicare la restaurant
  - Selectare timp de ridicare cu constraint: **minim 1 oră în viitor**
  - Validare automată pentru timp minim
  - Același sistem de selectare meniu

#### Mock Data
Momentan folosește date mock pentru orders. Pentru integrare cu backend, 
înlocuiește metoda `loadOrders()` cu API call real.

---

### 2. **Worker Dashboard** (`/worker-dashboard`)
Accesibil pentru roluri: **ROLE_WAITER**, **ROLE_CHEF**, **ROLE_MANAGER**, **ROLE_ADMIN**

#### Funcționalități:
- Mesaj simplu informativ pentru staff
- Afișare rol și email utilizator
- Placeholder pentru funcționalități viitoare:
  - Orders Management
  - Analytics
  - Team Coordination

---

## Protected Routes
Am implementat **ProtectedRoute** component care:
- Verifică autentificarea utilizatorului
- Verifică rolurile necesare
- Redirect la `/unauthorized` dacă nu are permisiuni
- Loading state în timpul verificării

---

## Navigation Updates
Navigation bar-ul s-a actualizat să includă:
- **Dashboard Link** - apare doar când user-ul e autentificat
  - Redirect automat la dashboard-ul corect bazat pe rol
- **User Email** - afișare email când e autentificat
- **Logout Button** - pentru deconectare
- **Login Button** - când nu e autentificat

---

## Order Modal Component
Modal complex pentru plasare comenzi cu:
- **Menu Items** - organizate pe categorii
- **Shopping Cart** - adăugare/ștergere items cu cantități
- **Total Calculator** - calcul automat
- **Pickup Time Selector** (pentru Order for Pickup)
  - Input datetime-local
  - Validare: minim 1 oră în viitor
  - Mesaj explicativ pentru utilizator

---

## Structura Fișierelor
```
src/
├── components/
│   ├── ProtectedRoute/
│   │   ├── ProtectedRoute.tsx
│   │   └── index.ts
│   └── OrderModal/
│       ├── OrderModal.tsx
│       ├── OrderModal.css
│       └── index.ts
├── pages/
│   ├── Dashboard/
│   │   ├── Dashboard.tsx
│   │   ├── Dashboard.css
│   │   └── index.ts
│   └── WorkerDashboard/
│       ├── WorkerDashboard.tsx
│       ├── WorkerDashboard.css
│       └── index.ts
```

---

## Cum să testezi

1. **Testare Guest Dashboard:**
   ```bash
   # Login cu cont ROLE_GUEST
   # Navigate to /dashboard
   # Testează filtrare orders
   # Click pe "Order Now" sau "Order for Pickup"
   # Adaugă items și plasează comandă
   ```

2. **Testare Worker Dashboard:**
   ```bash
   # Login cu cont ROLE_WAITER/CHEF/MANAGER/ADMIN
   # Navigate to /worker-dashboard
   # Verifică mesajul și rolul afișat
   ```

3. **Testare Access Control:**
   ```bash
   # Login ca GUEST și încearcă /worker-dashboard -> Unauthorized
   # Login ca WORKER și încearcă /dashboard -> Unauthorized
   ```

---

## TODO pentru Backend Integration

### Orders API
```typescript
// GET /api/orders - fetch user orders
interface OrderResponse {
  id: number
  items: string[]
  total: number
  status: 'pending' | 'completed' | 'cancelled'
  date: string
  pickupTime?: string
}

// POST /api/orders - create new order
interface CreateOrderRequest {
  items: { menuItemId: number, quantity: number }[]
  orderType: 'now' | 'pickup'
  pickupTime?: string // ISO datetime string
}
```

### Menu API
```typescript
// GET /api/menu - fetch menu items
interface MenuItem {
  id: number
  name: string
  price: number
  category: string
  description?: string
  available: boolean
}
```

---

## Styling
- Gradient backgrounds pentru butoane și cards
- Responsive design pentru mobile
- Smooth transitions și hover effects
- Color scheme consistent: verde (#8bc395) și roz (#e08ea8)

---

## Security Features
- Token-based authentication
- Role-based access control
- Protected routes cu verificare pe backend
- Automatic token expiry check
- Secure logout cu token revocation
