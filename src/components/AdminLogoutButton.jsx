import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient'; 

const AdminLogoutButton = () => {
    const navigate = useNavigate();

    const handleLogout = async () => {
        // Pide confirmación al usuario
        const isConfirmed = window.confirm("¿Estás seguro que deseas cerrar la sesión?");

        if (!isConfirmed) {
            // Si el usuario presiona "Cancelar", la función termina aquí.
            return;
        }
        
        // Si el usuario presiona "Aceptar", procede con el cierre de sesión
        try {
            // 1. Cerrar la sesión en Supabase Auth
            const { error } = await supabase.auth.signOut();

            if (error) {
                console.error("Error al cerrar sesión:", error.message);
                alert("Hubo un error al cerrar la sesión. Intenta de nuevo.");
                return;
            }

            // 2. Limpiar el estado de acceso local
            localStorage.removeItem('isAdmin');

            // 3. Redirigir al usuario a la página de inicio de sesión
            navigate('/admin/login'); 

        } catch (error) {
            console.error("Error inesperado durante el cierre de sesión:", error);
        }
    };

    return (
        <button 
            onClick={handleLogout} 
            // Estilo simple para que sea visible
            style={{ 
                background: '#D32F2F', 
                color: '#fff', 
                padding: '10px 18px', 
                borderRadius: '5px', 
                border: 'none', 
                cursor: 'pointer', 
                fontWeight: 'bold' 
            }}
        >
            🚪 Cerrar Sesión
        </button>
    );
};

export default AdminLogoutButton;