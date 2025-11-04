import { supabase } from '../services/supabaseClient';

export const validateQRCode = async (qrData, negocioId) => {
  try {
    // Decodificar QR
    const decoded = atob(qrData);
    const [userId, timestamp, token] = decoded.split('-');

    // 1️⃣ Verificar usuario existe y membresía activa
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !user) return { valid: false, message: 'Usuario no encontrado' };

    const hoy = new Date();
    if (new Date(user.fecha_expiracion) < hoy) {
      return { valid: false, message: 'Membresía expirada' };
    }

    // 2️⃣ Verificar beneficios disponibles del negocio
    const { data: beneficios, error: beneficioError } = await supabase
      .from('benefits')
      .select('*')
      .eq('negocio_id', negocioId)
      .gte('fecha_vigencia_inicio', hoy.toISOString()) // Vigencia inicio <= hoy
      .lte('fecha_vigencia_fin', hoy.toISOString());   // Vigencia fin >= hoy

    if (beneficioError || beneficios.length === 0) {
      return { valid: false, message: 'No hay beneficios disponibles' };
    }

    // 3️⃣ Verificar duplicados en 24h
    const { data: redemptions, error: redemptionError } = await supabase
      .from('redemptions')
      .select('*')
      .eq('usuario_id', userId)
      .eq('negocio_id', negocioId)
      .gte('fecha_uso', new Date(Date.now() - 24*60*60*1000).toISOString());

    if (redemptions.length > 0) {
      return { valid: false, message: 'Beneficio ya redimido en las últimas 24h' };
    }

    // 4️⃣ Elegir primer beneficio disponible para registrar
    const beneficio = beneficios[0];

    return { valid: true, user, beneficio };
  } catch (err) {
    console.error('Error validación QR:', err);
    return { valid: false, message: 'Error al validar QR' };
  }
};
