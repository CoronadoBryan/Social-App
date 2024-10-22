
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

    
     try{
        const {error} = await supabase
        .from('users')
        .update(data)
        .eq('id', userId);
        

        if(error){
            return { success: false , msg: error?.message};
        }
        return { success: true , data};
        
     }catch(error){
        console.log('error :', error);
        return { success: false , msg: error.message};
     }
}