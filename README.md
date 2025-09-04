# FreshCart Frontend

A modern e-grocery application built with Next.js 15, Shadcn/UI, and Zustand for state management.

## Features

### Completed

- 🎨 **Modern UI Design** - Clean, responsive design using Shadcn/UI components
- 🛒 **Landing Page** - Hero section, featured products, categories, and promotional content
- 🔐 **Authentication** - Login and signup pages with form validation
- 📱 **Responsive Design** - Mobile-first approach with responsive layouts
- 🎭 **State Management** - Zustand stores for auth and app state
- 🌿 **Fresh Branding** - Green color scheme with leaf logo
- 📝 **TypeScript** - Full type safety with API types defined

### Architecture

```
app/
├── (auth)/           # Authentication pages
│   ├── login/        # Login page
│   └── signup/       # Signup page
├── layout.tsx        # Root layout
└── page.tsx          # Landing page

components/
├── ui/               # Shadcn/UI components
│   ├── button.tsx
│   ├── input.tsx
│   └── card.tsx
├── header.tsx        # Main navigation
├── footer.tsx        # Footer component
└── landing-page.tsx  # Home page content

store/
├── auth.ts           # Authentication state
└── app.ts            # Application state (cart, products, etc.)

lib/
├── utils.ts          # Utility functions
└── api/
    └── client.ts     # API client setup

types/
└── api.ts            # TypeScript types for API
```

## Backend API Integration

The frontend is designed to work with the NestJS backend. Here are the key API endpoints expected:

### Authentication

- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Refresh token

### Products

- `GET /product` - Get all products (with pagination, filtering)
- `GET /product/:id` - Get single product
- `GET /product/featured` - Get featured products
- `GET /product/search` - Search products

### Categories

- `GET /category` - Get all categories
- `GET /category/:id` - Get single category
- `GET /category/:id/products` - Get products by category

### Cart

- `GET /cart` - Get user's cart
- `POST /cart/add` - Add item to cart
- `PATCH /cart/update` - Update cart item quantity
- `POST /cart/remove` - Remove item from cart
- `DELETE /cart/clear` - Clear entire cart

### User Profile & Addresses

- `GET /user/profile` - Get user profile
- `PATCH /user/profile` - Update user profile
- `GET /address` - Get user addresses
- `POST /address` - Create new address
- `PUT /address/:id` - Update address
- `DELETE /address/:id` - Delete address

### Orders

- `GET /order` - Get user orders
- `POST /order` - Create new order
- `GET /order/:id` - Get single order
- `PATCH /order/:id/cancel` - Cancel order

## API Response Format

All API responses follow this structure:

```typescript
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  statusCode: number;
  timestamp: string;
}
```

## State Management

### Auth Store (`useAuthStore`)

- User authentication state
- Login/logout functionality
- User profile data
- JWT token management

### App Store (`useAppStore`)

- Shopping cart state
- Product data
- Category data
- UI state (search, filters, etc.)

## Getting Started

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create `.env.local`:

   ```
   NEXT_PUBLIC_API_URL=http://localhost:3001/api
   ```

3. **Run development server:**

   ```bash
   npm run dev
   ```

4. **Open in browser:**
   Navigate to [http://localhost:3000](http://localhost:3000)

## Next Steps (To be implemented)

1. **Product Pages**

   - Product listing page with filters
   - Individual product detail pages
   - Search functionality

2. **Shopping Cart**

   - Cart sidebar/modal
   - Quantity updates
   - Price calculations

3. **Checkout Process**

   - Address management
   - Payment integration
   - Order confirmation

4. **User Dashboard**

   - Order history
   - Profile management
   - Address book

5. **Backend Integration**

   - Connect to actual API endpoints
   - Error handling
   - Loading states

6. **Additional Features**
   - Wishlist
   - Product reviews
   - Subscription plans
   - Admin dashboard

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Styling:** Tailwind CSS
- **UI Components:** Shadcn/UI
- **State Management:** Zustand
- **Language:** TypeScript
- **Icons:** Lucide React

## Design System

### Colors

- **Primary:** Green (#22c55e) - Fresh, natural
- **Secondary:** Various grays for text and backgrounds
- **Accent:** Used for CTAs and highlights

### Typography

- **Primary:** Geist Sans (modern, clean)
- **Monospace:** Geist Mono (for code/technical content)

### Components

All UI components follow Shadcn/UI patterns with custom theming for the grocery/fresh food aesthetic.
