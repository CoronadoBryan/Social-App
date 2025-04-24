import { supabase } from '../lib/supabase';

// Obtener comentarios de un post
export const fetchComments = async (postId) => {
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:userId(name, image)')
    .eq('postId', postId)
    .order('created_at', { ascending: true });
  if (error) return { success: false, error };
  return { success: true, data };
};

//para ver los comentarios en el post
const loadComments = async () => {
    setLoading(true);
    const res = await fetchComments(postId);
    console.log('Comentarios:', res); // <-- Agrega esto
    if (res.success) setComments(res.data);
    setLoading(false);
  };

// Crear un nuevo comentario
export const createComment = async ({ postId, userId, text }) => {
  const { data, error } = await supabase
    .from('comments')
    .insert([{ postId, userId, text }]);
  if (error) return { success: false, error };
  return { success: true, data };
};