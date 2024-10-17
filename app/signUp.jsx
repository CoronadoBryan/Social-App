import { Pressable, StyleSheet, Text, View, Image, Alert } from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { useRouter } from "expo-router";
import BackButton from "../components/BackButton";
import { StatusBar } from "expo-status-bar";
import { hp, wp } from "../helpers/common";
import { theme } from "../constants/theme";
import Input from "../components/Input";
import Icon from "../assets/icons";
import Button from "../components/Button";
import { supabase } from "../lib/supabase";

const SignUp = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const nameRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!emailRef.current || !passwordRef.current) {
      Alert.alert("Sign Up", "Por favor, completa todos los campos.");
      return;
    }

    let name = nameRef.current.trim(); 
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

     const {data: {session} , error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: 
        { 
          name
         }
      }
    });

    setLoading(false);
    
    // console.log('session :' , session)
    // console.log('error :' , error)

    if (error) {
      Alert.alert("Sign Up", error.message);
    }

    
  
    
  };

  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton />

        {/* Imagen */}
        <Image
          source={require("../assets/images/signUp.png")} // Cambia esta ruta a la ubicación de tu imagen
          style={styles.image}
          resizeMode="contain"
        />

        {/* Welcome */}
        <View>
          <Text style={styles.welcomeText}>Hola,</Text>
          <Text style={styles.welcomeText}>Únete a nosotros</Text>
        </View>

        {/* Formulario de registro */}
        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            Llena los campos para registrarte
          </Text>
          <Input
            icon={<Icon name="user" size={24} strokeWidth={1.6} />}
            placeholder="Tu nombre"
            onChangeText={(value) => (nameRef.current = value)}
          />
          <Input
            icon={<Icon name="mail" size={24} strokeWidth={1.6} />}
            placeholder="Tu correo"
            onChangeText={(value) => (emailRef.current = value)}
          />
          <Input
            icon={<Icon name="lock" size={24} strokeWidth={1.6} />}
            placeholder="Tu contraseña"
            secureTextEntry
            onChangeText={(value) => (passwordRef.current = value)}
          />
          
          {/* Botón */}
          <Button title={"Registrarse"} loading={loading} onPress={onSubmit} />
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
          <Pressable onPress={() => router.push("Login")}>
            <Text style={[styles.footerText, { color: theme.colors.primaryDark, fontWeight: theme.fonts.semibold }]}>
              Iniciar sesión
            </Text>
          </Pressable>
        </View>
      </View>
    </ScreenWrapper>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
    paddingHorizontal: wp(5),
    paddingVertical: hp(8),
    alignItems: "center", // Centra el contenido horizontalmente
  },
  image: {
    width: wp(40),
    height: hp(20),
    marginBottom: hp(2),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
    textAlign: "center",
  },
  form: {
    gap: 25,
    width: "100%", // Asegura que el formulario ocupe el ancho completo
  },
  footerText: {
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  }
});
