import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { AuthProvider } from './context/AuthContext';
import { Header } from './components/common/Header';
import { Breadcrumbs } from './components/common/Breadcrumbs';

import { OfferPage } from './pages/OfferPage';
import { SubCategoryPage } from './pages/SubCategoryPage';
import { ProductPage } from './pages/ProductPage';
import { CartPage } from './pages/CartPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { HomePage } from './pages/HomePage';
import { AccountPage } from './pages/AccountPage';
import { AdminPage } from './pages/AdminPage';

import { TestKalkulackaPage } from './pages/TestKalkulackaPage';

import { Footer } from './components/common/Footer';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Header />
            <Breadcrumbs />
            <main style={{ flex: 1, paddingBottom: '2rem' }}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/ponuka" element={<OfferPage />} />
                <Route path="/konto" element={<AccountPage />} />
                <Route path="/admin" element={<AdminPage />} />
                <Route path="/ponuka/:category" element={<SubCategoryPage />} />
                <Route path="/produkt/:id" element={<ProductPage />} />
                <Route path="/kosik" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/testkalkulacka" element={<TestKalkulackaPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
