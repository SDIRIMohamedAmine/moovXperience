import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from './layouts/MainLayout'
import AuthLayout from './layouts/AuthLayout'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import ProfilePage from './pages/ProfilePage'
import CatalogPage from './pages/CatalogPage'
import ProductDetailPage from './pages/ProductDetailPage'
import SupplierProductsPage from './pages/supplier/SupplierProductsPage'
import ProductFormPage from './pages/supplier/ProductFormPage'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
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

        {/* Protected routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        {/* Supplier routes */}
        <Route
          path="/supplier/products"
          element={
            <ProtectedRoute allowedRoles={['supplier']}>
              <SupplierProductsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/products/new"
          element={
            <ProtectedRoute allowedRoles={['supplier']}>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/supplier/products/:id/edit"
          element={
            <ProtectedRoute allowedRoles={['supplier']}>
              <ProductFormPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}

export default App
