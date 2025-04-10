import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { useState, useEffect } from "react";
import Login from "./pages/Login";
import Home from "./pages/Home";
import CreateForm from "./pages/CreateForm";
import DetailForm from "./pages/DetailForm";
import SubmitForm from "./pages/SubmitForm";
import PublicForms from "./pages/PublicForms"; // Add this import
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import { AuthProvider } from "./contexts/AuthContext";
import "./index.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100">
          <Navbar />
          <div className="container mx-auto px-4 py-8">
            <Routes>
              <Route path="/login" element={<Login />} />
              {/* Public routes */}
              <Route path="/forms/:slug/submit" element={<SubmitForm />} />
              <Route path="/public-forms" element={<PublicForms />} />
              
              {/* Protected routes */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <Home />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forms/create"
                element={
                  <ProtectedRoute>
                    <CreateForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/forms/:slug"
                element={
                  <ProtectedRoute>
                    <DetailForm />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
