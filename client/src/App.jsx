import { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthModalProvider } from './contexts/AuthModalContext'
import ToastContainer from './components/Toast'
import ConfirmModalContainer from './components/ConfirmModal'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import ProtectedRoute from './components/ProtectedRoute'
import AdminRoute from './components/AdminRoute'

// Lazy-loaded pages
const HomePage = lazy(() => import('./pages/HomePage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const RegisterPage = lazy(() => import('./pages/RegisterPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'))
const CartPage = lazy(() => import('./pages/CartPage'))
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'))
const QuotePage = lazy(() => import('./pages/QuotePage'))
const PaymentResultPage = lazy(() => import('./pages/PaymentResultPage'))
const DemandStatusPage = lazy(() => import('./pages/DemandStatusPage'))
const MyRentalsPage = lazy(() => import('./pages/MyRentalsPage'))
const AboutPage = lazy(() => import('./pages/AboutPage'))
const ContactPage = lazy(() => import('./pages/ContactPage'))
const BlogPage = lazy(() => import('./pages/BlogPage'))
const BlogPostPage = lazy(() => import('./pages/BlogPostPage'))
const ProductsPage = lazy(() => import('./pages/ProductsPage'))
const RentalsPage = lazy(() => import('./pages/RentalsPage'))

// Admin pages
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminRentals = lazy(() => import('./pages/admin/AdminRentals'))
const AdminCategories = lazy(() => import('./pages/admin/AdminCategories'))
const AdminLogin = lazy(() => import('./pages/admin/AdminLogin'))
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'))
const AdminAppearance = lazy(() => import('./pages/admin/AdminAppearance'))
const AdminPageEditor = lazy(() => import('./pages/admin/AdminPageEditor'))
const AdminBlog = lazy(() => import('./pages/admin/AdminBlog'))

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="w-8 h-8 border-2 animate-spin" style={{ borderColor: 'var(--border)', borderTopColor: 'var(--accent)' }} />
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
        <Route path="/catalog" element={<Navigate to="/products" replace />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/rentals" element={<RentalsPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/products/:id/quote" element={<QuotePage />} />

        {/* New pages */}
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/blog" element={<BlogPage />} />
        <Route path="/blog/:slug" element={<BlogPostPage />} />

        {/* Cart — public */}
        <Route path="/cart" element={<CartPage />} />

        {/* Demand status — public */}
        <Route path="/demand-status" element={<DemandStatusPage />} />

        {/* Protected — any role */}
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="/my-rentals" element={<ProtectedRoute><MyRentalsPage /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />
        <Route path="/payment-result" element={<ProtectedRoute><PaymentResultPage /></ProtectedRoute>} />

        {/* Admin routes */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="/admin/products" element={<AdminRoute><AdminProducts /></AdminRoute>} />
        <Route path="/admin/products/new" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
        <Route path="/admin/products/:id/edit" element={<AdminRoute><AdminProductForm /></AdminRoute>} />
        <Route path="/admin/rentals" element={<AdminRoute><AdminRentals /></AdminRoute>} />
        <Route path="/admin/categories" element={<AdminRoute><AdminCategories /></AdminRoute>} />
        <Route path="/admin/appearance" element={<AdminRoute><AdminAppearance /></AdminRoute>} />
        <Route path="/admin/page-editor" element={<AdminRoute><AdminPageEditor /></AdminRoute>} />
        <Route path="/admin/blog" element={<AdminRoute><AdminBlog /></AdminRoute>} />

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
