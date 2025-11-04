import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient'; // Asegúrate de que la ruta sea correcta
import IconoMariposaNaranja from '../assets/images/icono_mariposaNaranja.png';

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
        // 1. AUTENTICACIÓN REAL: Iniciar sesión con Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            throw error;
        }

        // 2. AUTORIZACIÓN: Verificar el rol en la tabla 'admins'
        const { data: adminData, error: adminError } = await supabase
            .from('admins')
            .select('rol_admin')
            .eq('user_id', data.user.id)
            .single();

        if (adminError || !adminData) {
            // El login fue exitoso, pero no es un usuario autorizado. Cierra la sesión.
            await supabase.auth.signOut(); 
            throw new Error("Acceso denegado. Este usuario no está registrado como Vendedor/Administrador.");
        }

        // 3. ÉXITO: Conceder acceso
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin/dashboard');

    } catch (err) {
        console.error("Error de autenticación:", err);
        // Manejar errores como "Invalid login credentials"
        setError(err.message || 'Error al intentar iniciar sesión. Verifique sus credenciales.');
    } finally {
        setLoading(false);
    }
  };

  return (
    <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'80vh' }}>
      <form onSubmit={handleLogin} style={{ background:'#fff', padding:'30px', borderRadius:'10px', boxShadow:'0 0 10px rgba(0,0,0,0.1)', display:'flex', flexDirection:"column" }}>
        
        <img style={{width:'100px', alignSelf: 'center'}} className='logo_Admin' src={IconoMariposaNaranja} alt="Logo de Administración" />
        
        <h2 style={{ color:'#1B5E20', marginBottom:'20px', textAlign: 'center'}}>Acceso de Administrador</h2>
        
        <input 
          type="email" 
          placeholder="Correo" 
          value={email} 
          onChange={(e)=>setEmail(e.target.value)}
          style={{ display:'block', margin:'10px 0', padding:'10px', width:'100%', border: '1px solid #ccc', borderRadius: '5px' }} 
          disabled={loading}
        />
        <input 
          type="password" 
          placeholder="Contraseña" 
          value={password} 
          onChange={(e)=>setPassword(e.target.value)}
          style={{ display:'block', margin:'10px 0', padding:'10px', width:'100%', border: '1px solid #ccc', borderRadius: '5px' }} 
          disabled={loading}
        />
        
        {error && <p style={{ color: '#D32F2F', marginTop: '10px', padding: '8px', backgroundColor: '#FFEBEE', borderRadius: '4px', textAlign: 'center' }}>❌ {error}</p>}

        <button 
          type="submit" 
          style={{ background: loading ? '#4CAF50' : '#1B5E20', color:'#fff', border:'none', padding:'10px 20px', borderRadius:'5px', cursor:'pointer', marginTop:'20px' }}
          disabled={loading}
        >
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;