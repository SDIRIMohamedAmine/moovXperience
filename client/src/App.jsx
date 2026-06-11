import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthModalProvider } from './contexts/AuthModalContext'
import ToastContainer from './components/Toast'
import ConfirmModalContainer from './components/ConfirmModal'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './components/ProtectedRoute'

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const CatalogPage = lazy(() => import('./pages/CatalogPage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const QuotePage = lazy(() => import('./pages/QuotePage'))
const PaymentResultPage = lazy(() => import('./pages/PaymentResultPage'))

// Supplier pages
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const SupplierProductsPage = lazy(() => import('./pages/supplier/SupplierProductsPage'))
const ProductFormPage = lazy(() => import('./pages/supplier/ProductFormPage'))
const OrdersPage = lazy(() => import('./pages/supplier/OrdersPage'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminRentals = lazy(() => import('./pages/admin/AdminRentals'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: '#222', borderTopColor: '#D23AB0' }} />
    </div>
  )
}

function App() {
  return (
    <AuthModalProvider>
    <Suspense fallback={<LoadingFallback />}>
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />

        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>

        {/* Public catalog */}
        <Route path="/catalog" element={<CatalogPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/:id/quote" element={<QuotePage />} />

        {/* Cart — public */}
        <Route path="/cart" element={<CartPage />} />

        {/* Protected — any role */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/payment-result" element={<ProtectedRoute><PaymentResultPage /></ProtectedRoute>} />

        {/* Supplier routes */}
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={['supplier', 'admin']}><DashboardPage /></ProtectedRoute>} />
        <Route path="/supplier/products" element={<ProtectedRoute allowedRoles={['supplier']}><SupplierProductsPage /></ProtectedRoute>} />
        <Route path="/supplier/orders" element={<ProtectedRoute allowedRoles={['supplier']}><OrdersPage /></ProtectedRoute>} />
        <Route path="/supplier/products/new" element={<ProtectedRoute allowedRoles={['supplier']}><ProductFormPage /></ProtectedRoute>} />
        <Route path="/supplier/products/:id/edit" element={<ProtectedRoute allowedRoles={['supplier']}><ProductFormPage /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/admin/products" element={<AdminProducts />} />
        <Route path="/admin/products/new" element={<AdminProductForm />} />
        <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
        <Route path="/admin/rentals" element={<AdminRentals />} />
        <Route path="/admin/categories" element={<AdminCategories />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
    </Suspense>
    <ToastContainer />
    <ConfirmModalContainer />
    </AuthModalProvider>
  )
}

export default App
