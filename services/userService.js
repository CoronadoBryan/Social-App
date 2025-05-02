import { supabase } from '../lib/supabase';

//todo esto es para hacer la conexion con la base de datos
// y poder hacer las consultas necesarias para el login y el registro

export const getUserData = async (userId) => {

    
     try{
        const {data, error} = await supabase
        .from('users')
        .select()
        .eq('id', userId)
        .single();

        if(error){
            return { success: false , msg: error?.message};
        }
        return { success: true , data};
        
     }catch(error){
        console.log('error :', error);
        return { success: false , msg: error.message};
     }
}

export const updateUser = async (userId, data) => {
  try {
    const { error } = await supabase
      .from('users')
      .update(data)
      .eq('id', userId);

    if (error) {
      console.log('Error actualizando usuario:', error); // <-- Agrega este log
      return { success: false, msg: error?.message };
    }
    console.log('Usuario actualizado correctamente:', data); // <-- Y este log
    return { success: true, data };
  } catch (error) {
    console.log('Error en catch:', error);
    return { success: false, msg: error.message };
  }
};

export const handleOnPress = async (user, setAuth) => {
   console.log('DEBUG: handleOnPress ejecutado');

  console.log('Usuario actual:', user);
  const session = await supabase.auth.getSession();
  console.log('Supabase session:', session);

  const { status } = await Notifications.requestPermissionsAsync();
  if (status !== "granted") {
    alert("No se concedieron permisos para notificaciones");
    return;
  }
  const token = (await Notifications.getExpoPushTokenAsync()).data;

  console.log('DEBUG: user:', user);
  console.log('DEBUG: user.id:', user?.id);
  console.log('DEBUG: token:', token);

  if (user?.id) {
    const result = await updateUser(user.id, { expo_push_token: token });
    console.log('Resultado updateUser:', result);
    // Vuelve a traer el usuario actualizado
    const { data } = await getUserData(user.id);
    setAuth(data); // <-- Esto actualiza el estado local con el token nuevo
    alert("Token guardado en Supabase");
  } else {
    console.log('DEBUG: Usuario no disponible para guardar token');
    alert("Usuario no disponible");
  }
};

