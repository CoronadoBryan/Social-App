import * as Notifications from 'expo-notifications';
import { useEffect } from "react";
import { createContext } from "react";
import { useContext, useState } from "react";
import React from "react";
import { updateUser } from '../services/userService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  const setAuth = (authUser) => {
    setUser(authUser);
  };

  const setUserData = (userData) => {
    setUser({ ...userData });
  };

  useEffect(() => {
    const registerForPushNotifications = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        alert('No se concedieron permisos para notificaciones');
        return;
      }
      const token = (await Notifications.getExpoPushTokenAsync()).data;
      console.log('Expo Push Token:', token);

      if (user?.id) {
        console.log('Guardando token para usuario:', user.id);
        await updateUser(user.id, { expo_push_token: token });
      } else {
        console.log('Usuario no disponible, no se guarda token');
      }
    };

    registerForPushNotifications();
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, setAuth, setUserData }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
