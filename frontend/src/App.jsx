import { BrowserRouter, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Footer from "./components/Footer";
import { ToastProvider } from "./context/ToastContext";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ProfilePage from "./pages/ProfilePage";
import MyBookingsPage from "./pages/MyBookingsPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import FieldDetailPage from "./pages/FieldDetailPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentCancelledPage from "./pages/PaymentCancelledPage";
import TournamentsPage from "./pages/TournamentsPage";
import TournamentDetailPage from "./pages/TournamentDetailPage";

import "./App.css";
import "./styles/reviews.css";

function App() {
  return (
    <ToastProvider>
      <BrowserRouter>
        {/* Navbar apare pe toate paginile */}
        <Navbar />

        {/* page-content limitează lățimea conținutului, lăsând navbar full-width */}
        <div className="page-content">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />

            {/* Pagina detalii teren cu slot picker - accesibilă fără autentificare */}
            <Route path="/field/:id" element={<FieldDetailPage />} />

            {/* Paginile de turnee - accesibile fără autentificare */}
            <Route path="/tournaments" element={<TournamentsPage />} />
            <Route path="/tournaments/:id" element={<TournamentDetailPage />} />

            {/* Rute protejate - verifică token-ul */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <ProfilePage />
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <MyBookingsPage />
                </ProtectedRoute>
              }
            />

            {/* Edge case: paginile de plată NU sunt protejate
              Stripe redirectează la ele - userul poate nu mai e "logat" după redirect */}
            <Route path="/payment-success" element={<PaymentSuccessPage />} />
            <Route
              path="/payment-cancelled"
              element={<PaymentCancelledPage />}
            />

            {/* Edge case: ruta admin e protejată dublu — token valid + rol admin */}
            <Route
              path="/admin"
              element={
                <AdminRoute>
                  <AdminDashboardPage />
                </AdminRoute>
              }
            />
          </Routes>
        </div>

        {/* Footer pe toate paginile */}
        <Footer />
      </BrowserRouter>
    </ToastProvider>
  );
}

export default App;
