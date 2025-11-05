import React, { useEffect } from 'react'; // Importamos useEffect
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'; // Importamos useLocation

import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardCliente from './pages/DashboardCliente';
import DashboardNegocio from './pages/DashboardNegocio';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import MonarcardLandingPage from './pages/LandingPage';
import Navbar from './components/Navbar';
import AliadosLanding from './pages/AliadosLanding';
import BeneficiosListaCompleta from "./pages/BeneficiosListaCompleta"
import AboutUs from './pages/AboutUs';
import './styles/global.css';


// --- 🚀 NUEVO COMPONENTE: ScrollToTop ---
const ScrollToTop = () => {
  // Obtiene el objeto de ubicación actual
  const { pathname } = useLocation();

  useEffect(() => {
    // Al cambiar 'pathname' (es decir, al cambiar de ruta), 
    // desplazamos la ventana al inicio de la página.
    window.scrollTo(0, 0);
  }, [pathname]); // Se ejecuta cada vez que la ruta cambia

  return null; // Este componente no renderiza nada visible
};
// ------------------------------------------


ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      {/* 💡 APLICACIÓN DEL COMPONENTE */}
      <ScrollToTop />
      
      <Navbar />
      <Routes>
        {/* La ruta raíz (/) ahora carga la MonarcardLandingPage */}
        <Route path="/" element={<MonarcardLandingPage />} /> 
        
        {/* Mantienes /home por si se utiliza específicamente */}
        <Route path="/home" element={<MonarcardLandingPage />} /> 
        {/* ---------------------------------------------------- */}

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/dashboard" element={<DashboardCliente />} />
        <Route path="/dashboard-negocio" element={<DashboardNegocio />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/aliados" element={<AliadosLanding />} />
        <Route path="/beneficios-completos" element={<BeneficiosListaCompleta />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);