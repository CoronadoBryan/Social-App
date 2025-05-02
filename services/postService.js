import { supabase } from '../lib/supabase';
import { uploadFile } from './imageService';

export const createOrUpdatePost = async (post) => {
  try {
    // Si hay un archivo adjunto, subimos el archivo
    if (post.file && typeof post.file === 'object') {
      let isImage = post?.file?.type === 'image';
      let folderName = isImage ? 'postImages' : 'postVideos';
      let fileResult = await uploadFile(folderName, post?.file?.uri, isImage);

      // Si la subida del archivo falla, retornamos el error
      if (fileResult.success) {
        post.file = fileResult.data; // Asignamos la URL del archivo al post
      } else {
        return fileResult; // Retornamos el error si no se pudo subir el archivo
      }
    }

    // Operación de upsert en Supabase (insertar o actualizar)
    const { data, error } = await supabase
      .from('posts')
      .upsert(post)
      .select()
      .single();

    if (error) {
      console.log("create post error", error);
      return { success: false, error, msg: "Error al crear o actualizar el post" };
    }

    // Retorno en caso de éxito
    return { success: true, data: data, msg: "Post created/updated successfully" };

  } catch (error) {
    console.log(error);
    return { success: false, error, msg: "Error al crear o actualizar el post" };
  }
};


//sirve ara obtener los post limitados a 10 eso quiere decir que 
export const fechPosts = async (limit=10) => {
    try {
        const {data , error} = await supabase
        .from('posts')
        .select(
          `*,
          user:users (id,name,image),
          postLikes(*, user:users(id,name,image))
        `)
        .order('created_at', {ascending: false})
        .limit(limit);

        if(error){
            console.log("fetch post error", error);
            return {success: false, error, msg: "Error al obtener los posts"};
        }

        return {success: true , data :data}
    } catch (error) {
      console.log(error);
      return { success: false, error, msg: "   " };
    }
};
  
export const createPostLike = async (postLike) => {
    try {
      const { data, error } = await supabase
        .from('postLikes')
        .insert(postLike)
        .select()
        .single();

        if(error){
            console.log("postLike error", error);
            return {success: false, error, msg: "Error al obtener los likes del post"};
        }

        return {success: true , data :data}
      
  
    } catch (error) {
      console.log(error);
      return { success: false, error, msg: "   " };
    }
};
export const removePostLike = async (postId,userId) => {
    try {
      const {error} = await supabase
        .from('postLikes')
        .delete()
        .eq('userId', userId)
        .eq('postId', postId);
        

        if(error){
            console.log("remover el like error", error);
            return {success: false, error, msg: "Error remover el like del post"};
        }

        return {success: true }
      
  
    } catch (error) {
      console.log(error);
      return { success: false, error, msg: "   " };
    }
};



export const fetchPostsByUser = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users (id,name,image),
        postLikes(*, user:users(id,name,image))
      `)
      .eq('userId', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.log("fetchPostsByUser error", error);
      return { success: false, error, msg: "Error al obtener los posts del usuario" };
    }

    return { success: true, data };
  } catch (error) {
    console.log(error);
    return { success: false, error, msg: "Error al obtener los posts del usuario" };
  }
};
