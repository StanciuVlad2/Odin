# Odin Restaurant - Documentație Implementare

## 📋 Structura Proiectului

```
src/
├── components/                    # Componente reutilizabile
│   ├── Navigation/               # Folder pentru Navigation component
│   │   ├── Navigation.tsx       # Component de navigare
│   │   ├── Navigation.css       # Stiluri pentru Navigation
│   │   └── index.ts             # Export default pentru import simplu
│   └── AuthModal/               # Folder pentru AuthModal component
│       ├── AuthModal.tsx        # Modal pentru Login/Register
│       ├── AuthModal.css        # Stiluri pentru AuthModal
│       └── index.ts             # Export default
├── pages/                        # Pagini principale ale aplicației
│   ├── Home/                    # Folder pentru Home page
│   │   ├── Home.tsx            # Pagina principală
│   │   ├── Home.css            # Stiluri pentru Home
│   │   └── index.ts            # Export default
│   ├── About/                   # Folder pentru About page
│   │   ├── About.tsx           # Pagina despre restaurant
│   │   ├── About.css           # Stiluri pentru About
│   │   └── index.ts            # Export default
│   ├── Menu/                    # Folder pentru Menu page
│   │   ├── Menu.tsx            # Pagina cu meniul
│   │   ├── Menu.css            # Stiluri pentru Menu
│   │   └── index.ts            # Export default
│   ├── Services/                # Folder pentru Services page
│   │   ├── Services.tsx        # Pagina cu servicii
│   │   ├── Services.css        # Stiluri pentru Services
│   │   └── index.ts            # Export default
│   └── Contact/                 # Folder pentru Contact page
│       ├── Contact.tsx         # Pagina de contact
│       ├── Contact.css         # Stiluri pentru Contact
│       └── index.ts            # Export default
├── App.tsx                      # Router setup și Layout component
├── App.css                      # Stiluri globale (layout, footer)
└── main.tsx                     # Entry point
```

**Organizare Modulară (Feature-First Structure):**
- ✅ Fiecare componentă/pagină are propriul folder
- ✅ Fiecare folder conține: `.tsx`, `.css`, și `index.ts`
- ✅ `index.ts` permite import simplu: `import Home from './pages/Home'`
- ✅ `App.css` conține doar stiluri globale (*, body, .app, .container, .page, .footer)
- ✅ Separare clară și scalabilă pentru viitor

## 🚀 Tehnologii Utilizate

- **React 18** - Library pentru UI
- **TypeScript** - Type safety
- **React Router DOM v6** - Navigare între pagini
- **Vite** - Build tool rapid

## 🎯 Funcționalități Implementate

### 1. **Routing cu React Router**
- Structură cu Layout persistent (Navigation + Footer)
- 5 rute principale: `/`, `/about`, `/menu`, `/services`, `/contact`
- Navigare smooth între pagini folosind `<Link>` components

### 2. **Navigation Component** (`src/components/Navigation.tsx`)
- Fixed navbar care rămâne vizibil la scroll
- Links către toate paginile
- Buton "Account" care deschide AuthModal
- Responsive design

### 3. **AuthModal Component** (`src/components/AuthModal.tsx`)
- Modal overlay pentru Login/Register
- Tabs pentru switch între Login și Register
- Formulare separate pentru fiecare mod
- Props: `onClose` pentru închidere

### 4. **Home Page** (`src/pages/Home.tsx`)
- **Hero Section**: Banner mare cu call-to-action "Reserve a Table"
- **Features Section**: 4 carduri cu punctele forte (Master Chefs, Fresh Ingredients, Award Winning, Fine Wines)
- Design modern cu gradient background

### 5. **About Page** (`src/pages/About.tsx`)
- Istorie și filosofia restaurantului
- Secțiune cu statistici (Ani de experiență, Iteme în meniu, Clienți fericiți, Staff)
- Layout în 2 coloane (text + statistici)

### 6. **Menu Page** (`src/pages/Menu.tsx`)
- Meniu organizat pe categorii: Starters, Main Courses, Desserts
- Fiecare item are: nume, descriere, preț
- Grid layout responsive
- Design cu carduri pentru fiecare preparat

### 7. **Services Page** (`src/pages/Services.tsx`)
- 6 servicii prezentate în carduri
- 2 servicii principale (Private Events, Chef's Table) - carduri mari cu detalii
- 4 servicii secundare (Catering, Wine Pairing, Cooking Classes, Gift Certificates)
- Liste cu bullet points pentru serviciile mari

### 8. **Contact Page** (`src/pages/Contact.tsx`)
- **Informații de contact**: Locație, Telefon, Email, Program
- **Formular de rezervare** cu:
  - Date personale (nume, email, telefon)
  - Data și ora rezervării
  - Număr de persoane
  - Validare și submit handler
- Layout în 2 coloane (info + formular)

## 🎨 Styling și Design

### Paletă de Culori
- **Primary**: `#e67e22` (portocaliu) - butoane, accente
- **Secondary**: `#2c3e50` (albastru închis) - text, headere
- **Background**: `#f8f9fa` (gri deschis)
- **Gradient**: `#667eea` → `#764ba2` (violet) pentru hero

### Design Patterns
- **Cards**: Box-shadow și hover effects pentru interactivitate
- **Grid Layouts**: Responsive cu `grid-template-columns: repeat(auto-fit, minmax(...))`
- **Fixed Navigation**: Navbar transparent cu blur effect
- **Modal Overlay**: Dark background cu modal centrat

### Responsive Design
- Breakpoint la 768px
- Stack layout pe mobile (coloane → rânduri)
- Navigation menu ascuns pe mobile (TODO: implementare hamburger menu)

## 📝 Flow-ul Aplicației

1. **User intră pe site** → Vede Hero section (Home)
2. **Navigare** → Folosește navbar pentru a explora paginile
3. **Account** → Click pe buton Account → Se deschide modal Login/Register
4. **Menu** → Explorează meniul organizat pe categorii
5. **Services** → Descoperă serviciile disponibile
6. **Contact** → Face o rezervare prin formular

## 🔄 State Management

- **Local State cu useState**:
  - `Navigation.tsx`: `showAuthModal` - controlează vizibilitatea modalului
  - `AuthModal.tsx`: `authMode` - switch între 'login' și 'register'
  - `Contact.tsx`: `formData` - datele din formularul de rezervare

## 🚧 TODO pentru Viitor

1. **Backend Integration**:
   - Conectare la API pentru autentificare
   - Submit rezervări la server
   - Fetch meniu dinamic din database

2. **Enhanced Features**:
   - Protected routes pentru user dashboard
   - Context API pentru user authentication state
   - Shopping cart pentru comenzi online
   - Image gallery pentru preparate

3. **Mobile Menu**:
   - Hamburger menu pentru mobile responsive
   - Sidebar navigation

4. **Form Validation**:
   - React Hook Form pentru formulare complexe
   - Error messages și field validation

## 🎓 Concepte React Utilizate

- ✅ **Functional Components**
- ✅ **React Hooks** (useState)
- ✅ **React Router v6** (BrowserRouter, Routes, Route, Link, Outlet)
- ✅ **Component Composition** (Layout pattern)
- ✅ **Props** (AuthModal onClose)
- ✅ **Event Handlers** (onClick, onSubmit, onChange)
- ✅ **Conditional Rendering** (authMode === 'login' ? ... : ...)
- ✅ **Lists & Keys** (.map() pentru menu items)

## 🏃 Cum să Rulezi

```bash
# Instalare dependențe
npm install

# Development server
npm run dev

# Build pentru producție
npm run build
```

## 📦 Dependințe Instalate

- `react` - ^18.x
- `react-dom` - ^18.x
- `react-router-dom` - ^6.x
- `typescript` - ^5.x
- `vite` - ^5.x
