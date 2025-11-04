import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      return;
    }

    const user = data?.user;
    if (!user) {
      setError('No se pudo obtener el usuario.');
      return;
    }

    // Guardar el usuario autenticado
    localStorage.setItem('user', JSON.stringify(user));

    // Obtener tipo de usuario desde la tabla "users"
    const { data: perfil, error: perfilError } = await supabase
      .from('users')
      .select('tipo_membresia')
      .eq('id', user.id)
      .single();

    if (perfilError || !perfil) {
      setError('No se pudo obtener el tipo de usuario.');
      return;
    }

    const tipo = perfil.tipo_membresia;

    // Redirigir según el tipo
    if (tipo === 'cliente_turista' || tipo === 'cliente_residente') {
      navigate('/dashboard');
    } else if (tipo === 'negocio') {
      navigate('/dashboard-negocio');
    } else {
      setError('Tipo de usuario desconocido.');
    }
  };
  
  // Función para navegar a la página de registro
  const handleSignupNavigation = () => {
    navigate('/signup');
  };

  return (
    <div 
      style={{ 
        textAlign: 'center', 
        marginTop: '40px', 
        marginBottom:'100px', 
        fontFamily: 'Arial, sans-serif', 
        backgroundColor:'#FFFFFF', 
        width:'400px',
        margin: '100px auto', 
        padding: '30px', 
        borderRadius: '8px', 
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)', 
      }}
    >
      <img src='/assets/logo_sinslogan.png' style={{width:'150px'}} alt="Logo Monarcard"></img>
      <h1 style={{ color: '#1B5E20' }}>Inicia sesión</h1>

      <form onSubmit={handleLogin} style={{ marginTop: '30px' }}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', width: '250px', margin: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <br />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', width: '250px', margin: '10px', border: '1px solid #ddd', borderRadius: '4px' }}
        />
        <br />
        <button
          type="submit"
          style={{
            padding: '10px 20px',
            backgroundColor: '#FF6B35',
            color: '#fff',
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer',
            marginTop: '10px',
            fontWeight: 'bold',
            transition: 'background-color 0.3s', 
          }}
        >
          Ingresar
        </button>
      </form>

      {error && <p style={{ color: 'red', marginTop: '15px' }}>{error}</p>}
      
      {/* --- Nueva Sección de Registro --- */}
      <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid #eee' }}>
        <p style={{ color: '#555', fontSize: '0.95em', margin: '0 0 10px 0' }}>
          ¿Aún no estás registrado?
        </p>
        <button
          onClick={handleSignupNavigation}
          style={{
            background: 'none',
            border: 'none',
            color: '', // Color verde para el enlace
            cursor: 'pointer',
            fontSize: '1em',
            fontWeight: 'bold',
          }}
        >
          Adquiere tu Membresía
        </button>
      </div>
    </div>
  );
};

export default Login;