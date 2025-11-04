import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validar QR desde Supabase
export const validateQR = async (userId, beneficioId, negocioId) => {
    const { data, error } = await supabase.rpc('validate_qr', {
      p_user_id: userId,
      p_beneficio_id: beneficioId,
      p_negocio_id: negocioId
    });
  
    if (error) {
      console.error('Error al validar QR:', error);
      return { success: false, message: error.message };
    }
  
    return { success: true, message: data };
  };

export const supabase = createClient(supabaseUrl, supabaseKey);
