import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
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
import { useRef, useState } from "react";

const Login = () => {
  const router = useRouter();
  const emailRef = useRef("");
  const passwordRef = useRef("");
  const [loading, setLoading] = useState(false);

  const onSubmit= async () => {
    if(!emailRef.current || !passwordRef.current){
      alert("Por favor llene todos los campos")
      return;
    }

    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();
    setLoading(true);
    const {error} = await supabase.auth.signInWithPassword({
      email,
      password
    });

    setLoading(false);

    console.log('error', error);
    if(error){
      Alert.alert("Login", error.message);
    }

  }
  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        <BackButton />

        {/* welcome */}
        <View>
          <Text style={styles.welcomeText}>Hola,</Text>
          <Text style={styles.welcomeText}>Welcome Back</Text>
        </View>

        {/* Formulario de login */}

        <View style={styles.form}>
          <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
            logueate pata continuar
          </Text>
          <Input
            icon={<Icon name="mail" size={24} strokeWidth={1.6} />}
            placeholder="tu correo"
            onChangeText={(value=> emailRef.current = value)}
          />
          <Input
            icon={<Icon name="lock" size={24} strokeWidth={1.6} />}
            placeholder="tu contraseña"
            secureTextEntry
            onChangeText={(value=> passwordRef.current = value)}
          />
          <Text style={styles.forgoPassword}>
            ¿Olvidaste tu contraseña?
          </Text>
          {/* boton */}

          <Button title={"Login"} loading={loading} onPress={onSubmit} />
        </View>

        {/* footer */}

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            ¿No tienes una cuenta?
          </Text>
          <Pressable onPress={()=> router.push("signUp")}>
            <Text style={[styles.footerText , {color: theme.colors.primaryDark , fontWeight: theme.fonts.semibold}]} >Sing Up</Text>
          </Pressable>

        </View>
      </View>
    </ScreenWrapper>
  );
};

export default Login;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 15,
    paddingHorizontal: wp(5),
  },
  welcomeText: {
    fontSize: hp(4),
    fontWeight: theme.fonts.bold,
    color: theme.colors.text,
  },
  form: {
    gap: 25,
  },

  forgoPassword: {
    fontWeight: theme.fonts.semibold,
    textAlign: "right",
    color: theme.colors.text,
  },

  footerText:{
    textAlign: "center",
    color: theme.colors.text,
    fontSize: hp(1.6),
  }
});
