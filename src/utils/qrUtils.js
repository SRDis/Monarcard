import { supabase } from '../services/supabaseClient';

/**
 * Valida un código QR escaneado y verifica elegibilidad para redención
 * @param {string} qrData - Código QR en formato Base64
 * @param {string} negocioId - ID del negocio que está validando
 * @returns {Object} { valid: boolean, message: string, user?: Object, beneficio?: Object }
 */
export const validateQRCode = async (qrData, negocioId) => {
  try {
    // 🔹 Paso 1: Decodificar QR
    let userId;
    try {
      const decoded = atob(qrData);
      console.log("🔍 DEBUG - QR decodificado:", decoded);
      
      // ✅ Usa "|" como delimitador (formato: UUID|timestamp|token)
      const parts = decoded.split('|');
      
      if (parts.length !== 3) {
        console.error("❌ Formato de QR inválido. Partes:", parts);
        return { valid: false, message: 'QR inválido: formato incorrecto' };
      }
      
      userId = parts[0]; // UUID completo
      
      console.log("🔍 DEBUG - userId extraído:", userId);
      
      if (!userId || userId.length !== 36) {
        return { valid: false, message: 'QR inválido: UUID malformado' };
      }
    } catch (decodeError) {
      console.error("❌ Error decodificando Base64:", decodeError);
      return { valid: false, message: 'QR inválido: no es Base64 válido' };
    }

    // 🔹 Paso 2: Verificar usuario existe
    console.log("🔍 DEBUG - Buscando usuario con ID:", userId);
    
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, nombre, profile_pic, tipo_membresia, fecha_expiracion')
      .eq('id', userId)
      .single();

    console.log("🔍 DEBUG - Resultado búsqueda usuario:", { user, userError });

    if (userError || !user) {
      console.error('❌ Error buscando usuario:', userError);
      return { 
        valid: false, 
        message: `Usuario no encontrado en el sistema (ID: ${userId.substring(0, 8)}...)` 
      };
    }

    // Verificar membresía no expirada
    const hoy = new Date();
    if (user.fecha_expiracion && new Date(user.fecha_expiracion) < hoy) {
      return { 
        valid: false, 
        message: `Membresía expirada el ${new Date(user.fecha_expiracion).toLocaleDateString()}` 
      };
    }

    // 🔹 Paso 3: Verificar QR está registrado (OPCIONAL - No bloqueante)
    const { data: qrRecord } = await supabase
      .from('qr_codes')
      .select('*')
      .eq('qr_data', qrData)
      .eq('estado', 'activo')
      .maybeSingle(); // No falla si no encuentra

    if (qrRecord) {
      console.log("✅ QR encontrado en base de datos:", qrRecord);
    } else {
      console.warn("⚠️ QR no registrado en BD, pero se permite continuar");
    }

    // 🔹 Paso 4: Verificar beneficios del negocio (SIN filtros de fecha/estado)
    console.log("🔍 DEBUG - Buscando beneficios para negocio:", negocioId);
    
    const { data: beneficios, error: beneficioError } = await supabase
      .from('benefits')
      .select('*')
      .eq('negocio_id', negocioId);

    console.log("🔍 DEBUG - Beneficios encontrados:", beneficios);
    console.log("🔍 DEBUG - Error:", beneficioError);

    if (beneficioError) {
      console.error('❌ Error consultando beneficios:', beneficioError);
      return { valid: false, message: 'Error al verificar beneficios disponibles' };
    }

    if (!beneficios || beneficios.length === 0) {
      return { 
        valid: false, 
        message: 'Este negocio no tiene beneficios registrados' 
      };
    }

    // 🔹 Paso 5: Verificar duplicados en últimas 24 horas
    const hace24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: redemptions, error: redemptionError } = await supabase
      .from('redemptions')
      .select('id, fecha_uso')
      .eq('usuario_id', userId)
      .eq('negocio_id', negocioId)
      .gte('fecha_uso', hace24h);

    console.log("🔍 DEBUG - Redenciones recientes:", redemptions);

    if (redemptionError) {
      console.error('❌ Error verificando redenciones:', redemptionError);
      return { valid: false, message: 'Error al verificar historial de redenciones' };
    }

    if (redemptions && redemptions.length > 0) {
      const ultimaRedencion = new Date(redemptions[0].fecha_uso);
      const horasRestantes = Math.ceil((ultimaRedencion.getTime() + 24*60*60*1000 - Date.now()) / (1000*60*60));
      return { 
        valid: false, 
        message: `Beneficio ya usado. Podrá volver a canjearlo en ${horasRestantes} horas.` 
      };
    }

    // ✅ TODO VÁLIDO
    const beneficio = beneficios[0];

    console.log("✅ Validación exitosa:", { user, beneficio });

    return { 
      valid: true, 
      message: 'Usuario verificado correctamente',
      user, 
      beneficio 
    };

  } catch (err) {
    console.error('❌ Error inesperado en validateQRCode:', err);
    return { 
      valid: false, 
      message: 'Error técnico al validar QR. Intente nuevamente.' 
    };
  }
};