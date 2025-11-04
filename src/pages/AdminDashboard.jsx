import React, { useEffect, useState, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog'; 
import QuickRegisterForm from '../components/QuickRegisterForm'; // 📌 Importación del formulario unificado
import * as XLSX from 'xlsx';


// --- ESTILOS AUXILIARES ---

const sectionStyle = {
  marginTop: '40px',
  padding: '20px',
  border: '1px solid #ddd',
  borderRadius: '8px',
  backgroundColor: '#fff',
};

const cardStyle = {
  background:'#F5F5F5', flex:'1', padding:'15px', borderRadius:'10px',
  textAlign:'center', boxShadow:'0 0 5px rgba(0,0,0,0.1)', minWidth:'200px',
  height:'auto'
};

const tableStyle = {
  width: '100%', borderCollapse: 'collapse', marginTop: '15px'
};

const thStyle = {
  backgroundColor: '#1B5E20', color: 'white', padding: '12px', textAlign: 'left', border: '1px solid #ddd'
};

const tdStyle = {
  padding: '10px', border: '1px solid #eee',
};

const trEvenStyle = {
  backgroundColor: '#f9f9f9'
};

const exportButtonStyle = (format) => ({
  background: format === 'excel' ? '#0E783A' : '#1B5E20', 
  color: '#fff', 
  border: 'none', 
  padding: '8px 15px', 
  borderRadius: '5px', 
  cursor: 'pointer', 
  fontWeight: 'bold'
});

const selectStyle = {
    padding: '8px 15px',
    borderRadius: '5px',
    border: '1px solid #1B5E20',
    backgroundColor: '#fff',
    color: '#1B5E20',
    cursor: 'pointer',
    fontWeight: 'bold',
};

// --- COMPONENTE PRINCIPAL ---

const AdminDashboard = () => {
  const navigate = useNavigate();
  // 📌 Añadimos 'ventas' a las estadísticas y el estado para el modal de registro
  const [stats, setStats] = useState({ usuarios: 0, negocios: 0, beneficios: 0, redenciones: 0, ventas: 0 });
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false); // 📌 NUEVO ESTADO
  const [redemptions, setRedemptions] = useState([]);
  const [timeFilter, setTimeFilter] = useState('mes'); 
  const [loadingRedemptions, setLoadingRedemptions] = useState(false);

  // Opciones para el <select>
  const filterOptions = [
    { value: 'mes', label: 'Último Mes' },
    { value: 'bimestre', label: 'Último Bimestre' },
    { value: 'trimestre', label: 'Último Trimestre' },
    { value: 'semestre', label: 'Último Semestre' },
    { value: 'año', label: 'Último Año' },
  ];

  // Lógica para calcular la fecha de inicio del filtro (sin cambios)
  const calculateStartDate = (filter) => {
    const today = new Date();
    const startDate = new Date();
    
    switch (filter) {
      case 'bimestre': startDate.setMonth(today.getMonth() - 2); break;
      case 'trimestre': startDate.setMonth(today.getMonth() - 3); break;
      case 'semestre': startDate.setMonth(today.getMonth() - 6); break;
      case 'año': startDate.setFullYear(today.getFullYear() - 1); break;
      case 'mes': 
      default: startDate.setMonth(today.getMonth() - 1); break;
    }
    return startDate.toISOString().split('T')[0];
  };

  // Función para obtener las redenciones (sin cambios)
  const fetchRedemptions = useCallback(async (filter) => {
    setLoadingRedemptions(true);
    const startDate = calculateStartDate(filter);
    
    try {
      const { data, error } = await supabase
        .from('redemptions')
        .select(`
          usuario_id, 
          beneficio_id, 
          negocio_id, 
          fecha_uso,
          users(nombre, apellido), 
          benefits(nombre_beneficio),
          businesses(nombre_negocio)
        `)
        .gte('fecha_uso', startDate)
        .order('fecha_uso', { ascending: false });

      if (error) throw error;
      setRedemptions(data || []);
    } catch (error) {
      console.error('Error al obtener redenciones:', error.message);
      setRedemptions([]);
    } finally {
      setLoadingRedemptions(false);
    }
  }, []);

  // 📌 Función para obtener todas las estadísticas, incluyendo 'sales'
  const fetchStats = useCallback(async () => {
    const [{ count: u }, { count: b }, { count: f }, { count: r }, { count: s }] = await Promise.all([
      supabase.from('users').select('*', { count: 'exact', head: true }),
      supabase.from('businesses').select('*', { count: 'exact', head: true }),
      supabase.from('benefits').select('*', { count: 'exact', head: true }),
      supabase.from('redemptions').select('*', { count: 'exact', head: true }),
      supabase.from('sales').select('*', { count: 'exact', head: true }) // Consulta a la tabla 'sales'
    ]);
    setStats({ usuarios: u || 0, negocios: b || 0, beneficios: f || 0, redenciones: r || 0, ventas: s || 0 });
  }, []);

  // useEffect principal para cargar stats y redenciones iniciales
  useEffect(() => {
    fetchStats();
    fetchRedemptions(timeFilter); 
  }, [fetchRedemptions, timeFilter, fetchStats]); 

  // --- MANEJO DE CIERRE DE SESIÓN (sin cambios) ---
  const performLogout = () => {
    localStorage.removeItem('isAdmin');
    navigate('/admin/login');
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false); 
    performLogout();          
  };

  const handleCancelLogout = () => {
    setShowLogoutModal(false); 
  };
  
  // 📌 Handler para refrescar las estadísticas después de un registro/venta exitosa
  const handleEntityRegistered = () => {
      setShowRegisterModal(false);
      fetchStats(); // Refrescar los contadores
  };


  // --- MANEJO DE EXPORTACIÓN (sin cambios) ---
  const formatRedemptionsForExport = (data) => {
    return data.map(item => ({
      'ID Usuario': item.usuario_id,
      'Nombre Usuario': item.users?.nombre + ' ' + item.users?.apellido,
      'ID Beneficio': item.beneficio_id,
      'Beneficio': item.benefits?.nombre_beneficio || 'N/A',
      'ID Negocio': item.negocio_id,
      'Negocio': item.businesses?.nombre_negocio || 'N/A',
      'Fecha de Uso': new Date(item.fecha_uso).toLocaleDateString(),
    }));
  };

  const handleExport = (format) => {
    const dataToExport = formatRedemptionsForExport(redemptions);
    
    if (dataToExport.length === 0) {
        alert("No hay datos para exportar en el período seleccionado.");
        return;
    }

    if (format === 'excel') {
      const ws = XLSX.utils.json_to_sheet(dataToExport);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Redenciones");
      XLSX.writeFile(wb, "Redenciones_Monarcard.xlsx");
    } else if (format === 'print') {
      // ... (Lógica de impresión)
      const printWindow = window.open('', '_blank');
      const tableHtml = dataToExport.reduce((acc, item) => {
          return acc + `<tr>${Object.values(item).map(val => `<td>${val}</td>`).join('')}</tr>`;
      }, '<tbody>') + '</tbody>';

      const headerHtml = `<thead><tr>${Object.keys(dataToExport[0]).map(key => `<th>${key}</th>`).join('')}</tr></thead>`;
      
      printWindow.document.write(`
        <html>
          <head>
            <title>Reporte de Redenciones</title>
            <style>
              table {width: 100%; border-collapse: collapse;} 
              th, td {border: 1px solid black; padding: 8px; text-align: left;} 
              h1 {color:#1B5E20;}
            </style>
          </head>
          <body>
            <h1>Reporte de Redenciones</h1>
            <table>${headerHtml}${tableHtml}</table>
          </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };


  // --- RENDERIZADO ---
  return (
    <div style={{ padding:'30px', fontFamily:'Arial' }}>
      <div className='cont_tituloAdmin' style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h1 style={{ color:'#1B5E20' }}>Panel Administrativo</h1>
        <div style={{ display: 'flex', gap: '10px' }}> 
            <button 
              onClick={() => setShowRegisterModal(true)} // 📌 BOTÓN DE REGISTRO RÁPIDO
              style={{ 
                background:'#1B5E20', color:'#fff', border:'none', 
                padding:'8px 15px', borderRadius:'5px', cursor: 'pointer', 
                fontWeight: 'bold', minWidth: '200px' 
              }}>
              ➕ Registrar Entidad
            </button>
            <button 
              onClick={handleLogoutClick} 
              style={{ background:'#FF6B35', color:'#fff', border:'none', padding:'8px 52px', borderRadius:'5px', cursor: 'pointer' }}>
              Salir
            </button>
        </div>
      </div>
      
      {/* Sección de Estadísticas Principales */}
      <div style={{ display:'flex', gap:'20px', marginTop:'30px', flexWrap:'wrap' }}>
        <div style={cardStyle}><h2>{stats.usuarios}</h2><p>Usuarios</p></div>
        <div style={cardStyle}><h2>{stats.negocios}</h2><p>Negocios</p></div>
        <div style={cardStyle}><h2>{stats.beneficios}</h2><p>Beneficios</p></div>
        <div style={cardStyle}><h2>{stats.redenciones}</h2><p>Redenciones Totales</p></div>
        <div style={cardStyle}><h2>{stats.ventas}</h2><p>Ventas (Efectivo)</p></div> {/* 📌 NUEVA CARD */}
      </div>
      
      {/* --- SECCIÓN DE REDENCIONES --- */}
      <div style={sectionStyle}>
        <h2 style={{ color:'#1B5E20', borderBottom: '2px solid #eee', paddingBottom: '10px' }}>
          Reporte de Redenciones
        </h2>
        
        {/* Filtros de Tiempo y Botones de Exportación (sin cambios) */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '10px' }}>
          <select
            value={timeFilter}
            onChange={(e) => {
              const newFilter = e.target.value;
              setTimeFilter(newFilter);
              fetchRedemptions(newFilter);
            }}
            style={selectStyle}
          >
            {filterOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={() => handleExport('excel')}
              style={exportButtonStyle('excel')}
            >
              ⬇️ Descargar Excel
            </button>
            <button
              onClick={() => handleExport('print')}
              style={exportButtonStyle('print')}
            >
              🖨️ Imprimir Reporte
            </button>
          </div>
        </div>

        {/* Tabla de Redenciones (sin cambios) */}
        {loadingRedemptions ? (
          <p style={{ textAlign: 'center' }}>Cargando redenciones...</p>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Fecha Uso</th>
                <th style={thStyle}>Usuario (ID)</th>
                <th style={thStyle}>Beneficio (ID)</th>
                <th style={thStyle}>Negocio (ID)</th>
              </tr>
            </thead>
            <tbody>
              {redemptions.length > 0 ? (
                redemptions.map((red, index) => (
                  <tr key={index} style={index % 2 === 0 ? trEvenStyle : {}}>
                    <td style={tdStyle}>{new Date(red.fecha_uso).toLocaleDateString()}</td>
                    <td style={tdStyle}>{red.users?.nombre} {red.users?.apellido} ({red.usuario_id})</td>
                    <td style={tdStyle}>{red.benefits?.nombre_beneficio || red.beneficio_id}</td>
                    <td style={tdStyle}>{red.businesses?.nombre_negocio || red.negocio_id}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', padding: '20px' }}>
                    No hay redenciones en el período seleccionado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

      </div>
      
      {/* 📌 MODAL DE REGISTRO CON CORRECCIÓN DE SCROLL VERTICAL */}
      {showRegisterModal && (
        <div style={{ 
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', 
            justifyContent: 'center', alignItems: 'center' 
        }}>
            <div style={{ 
                backgroundColor: '#fff', 
                padding: '30px', 
                borderRadius: '10px', 
                maxWidth: '500px', 
                width: '90%',
                
                // 🔑 CORRECCIÓN CLAVE: Limita la altura del modal y permite el desplazamiento
                maxHeight: '90vh', 
                overflowY: 'auto', 
                
            }}>
                <QuickRegisterForm // Usamos el formulario unificado
                    onClose={() => setShowRegisterModal(false)}
                    onEntityRegistered={handleEntityRegistered} // Refresca las estadísticas
                />
            </div>
        </div>
      )}
      
      {/* Modal de Cierre de Sesión (sin cambios) */}
      {showLogoutModal && (
        <ConfirmDialog
          message="¿Estás seguro de que quieres cerrar la sesión de administrador?"
          onConfirm={handleConfirmLogout}
          onCancel={handleCancelLogout}
        />
      )}
    </div>
  );
};

export default AdminDashboard;