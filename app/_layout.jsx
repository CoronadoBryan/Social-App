// Este componente es el "jefe" de la app. Aquí se decide si el usuario puede entrar o no.

// Importa lo necesario para mostrar pantallas y manejar la sesión
import { View, Text, LogBox } from "react-native";
import React, { useEffect } from "react";
import { router, Stack } from "expo-router";
import { AuthProvider } from "../contexts/AuthContext";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import { getUserData } from "../services/userService";

// Oculta mensajes molestos en la consola
LogBox.ignoreLogs([
  "Warning. TNodeChildrenRenderer",
  "Warning: MemoizedTNodeRenderer",
  "Warning: TRendeEngineProvider",
  "Warning: TNodeChildrenRenderer",
  "Support for defaultProps will be removed from function components",
  "Warning: TNodeChildrenRenderer: Support for defaultProps will be removed from function components",
  "Warning: MemoizedTNodeRenderer: Support for defaultProps will be removed from memo components",
]);

// Este componente envuelve toda la app y le da acceso a la información de si el usuario está logueado o no
const _layout = () => {
  return (
    // Aquí le damos a toda la app la información de si el usuario está logueado o no
    <AuthProvider>
      <MainLayout />
    </AuthProvider>
  );
};

// Aquí se decide a qué pantalla va el usuario según si está logueado o no
const MainLayout = () => {
  const { setAuth, setUserData } = useAuth();

  // Log de sesión cada vez que cambia
  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (data?.session) {
        console.log("✅ Sesión activa:", data.session.user.email);
      } else {
        console.log("❌ Sesión cerrada");
      }
      if (error) {
        console.log("Error al obtener sesión:", error);
      }
    };
    checkSession();
  });

  

  useEffect(() => {
    // Aquí escuchamos si el usuario inicia o cierra sesión
    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log("Cambio de sesión:", session);
      if (session) {
        setAuth(session?.user);
        updateUserData(session.user, session?.user?.email);
        router.replace("/home");
      } else {
        setAuth(null);
        router.replace("/welcome");
      }
    });
    // Cuando esta pantalla ya no se usa, dejamos de escuchar para ahorrar recursos
    return () => {
      listener?.subscription?.unsubscribe?.();
    };
  }, []); // Esto solo se hace una vez cuando inicia la app

  // Esta función busca más información del usuario y la guarda para que la use la app
  const updateUserData = async (user, email) => {
    let res = await getUserData(user?.id);
    if (res.success) setUserData({ ...res.data, email });
  };

  // Aquí se muestran las pantallas de la app, sin el encabezado arriba
  return (
    <Stack
      screenOptions={{
        headerShown: false,
      }}
    />
  );
};

export default _layout;
