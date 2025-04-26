import { supabase } from '../lib/supabase';

// Obtener todos los intereses
export const fetchInterests = async () => {
  const { data, error } = await supabase.from('interests').select('*');
  if (error) return [];
  return data;
};

// Guardar varios intereses seleccionados para un usuario
export const saveUserInterests = async (userId, interestIds) => {
  const inserts = interestIds.map((interestsId) => ({
    userId,
    interestsId, 
  }));
  const { data, error } = await supabase
    .from('userInterests')
    .insert(inserts);
  if (error) return { success: false, error };
  return { success: true, data };
};