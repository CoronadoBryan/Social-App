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

// Ejemplo de función para validar descargas diarias
export const canDownloadResource = async (userId) => {
  const today = new Date().toISOString().slice(0, 10);
  const { success, data: user } = await getUserData(userId);
  if (!success) return { allowed: false, msg: "Error obteniendo usuario" };

  // Obtén el límite desde la BD
  const DAILY_DOWNLOAD_LIMIT = await getDailyDownloadLimit();

  if (user.is_premium) {
    return { allowed: true };
  }
  if (user.downloads_date !== today) {
    await updateUser(userId, { downloads_today: 0, downloads_date: today });
    user.downloads_today = 0;
    user.downloads_date = today;
  }
  if (user.downloads_today >= DAILY_DOWNLOAD_LIMIT) {
    return { allowed: false, msg: `Límite de ${DAILY_DOWNLOAD_LIMIT} descargas por día alcanzado` };
  }
  await updateUser(userId, {
    downloads_today: user.downloads_today + 1,
    downloads_date: today,
  });
  return { allowed: true, DAILY_DOWNLOAD_LIMIT };
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

export const getDailyDownloadLimit = async () => {
  try {
    const { data, error } = await supabase
      .from('config')
      .select('value')
      .eq('key', 'daily_download_limit')
      .single();
    if (error) {
      // Valor por defecto si hay error
      return 5;
    }
    return parseInt(data.value, 10);
  } catch {
    return 5;
  }
};

export const getMinAppVersion = async () => {
  const { data, error } = await supabase
    .from('config')
    .select('value')
    .eq('key', 'min_app_version')
    .single();
  console.log('getMinAppVersion - data:', data, 'error:', error); // <-- LOG AGREGADO
  return data?.value || "1.0.0"; // Valor por defecto si no hay dato
};

