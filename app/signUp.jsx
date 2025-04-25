import { Pressable, StyleSheet, Text, View, Image, Alert, KeyboardAvoidingView, Platform, ScrollView } from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../components/ScreenWrapper";
import { useRouter } from "expo-router";
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
    if (!emailRef.current || !passwordRef.current || !nameRef.current) {
      Alert.alert("Registro", "Por favor, completa todos los campos.");
      return;
    }

    let name = nameRef.current.trim();
    let email = emailRef.current.trim();
    let password = passwordRef.current.trim();

    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name }
      }
    });

    setLoading(false);

    if (error) {
      Alert.alert("Registro", error.message);
    }
  };

  return (
    <ScreenWrapper bg="#fff">
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.bgDecor}>
            <View style={styles.circle1} />
            <View style={styles.circle2} />
            <View style={styles.circle3} />
          </View>
          <View style={styles.container}>
            {/* Encabezado */}
            <View style={styles.header}>
              <Text style={styles.title}>¡Crea tu cuenta!</Text>
              <Text style={styles.subtitle}>
                Llena los campos para unirte a la comunidad.
              </Text>
            </View>
            {/* Formulario de registro */}
            <View style={styles.form}>
              <Input
                icon={<Icon name="user" size={22} strokeWidth={1.6} />}
                placeholder="Nombre completo"
                onChangeText={(value) => (nameRef.current = value)}
              />
              <Input
                icon={<Icon name="mail" size={22} strokeWidth={1.6} />}
                placeholder="Correo electrónico"
                onChangeText={(value) => (emailRef.current = value)}
                keyboardType="email-address"
                autoCapitalize="none"
              />
              <Input
                icon={<Icon name="lock" size={22} strokeWidth={1.6} />}
                placeholder="Contraseña"
                secureTextEntry
                onChangeText={(value) => (passwordRef.current = value)}
              />
              <Button title={"Registrarse"} loading={loading} onPress={onSubmit} />
            </View>
            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>¿Ya tienes una cuenta?</Text>
              <Pressable onPress={() => router.push("Login")}>
                <Text style={styles.footerLink}>Iniciar sesión</Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenWrapper>
  );
};

export default SignUp;

const styles = StyleSheet.create({
  bgDecor: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 0,
    justifyContent: "center",
    alignItems: "center",
  },
  circle1: {
    position: "absolute",
    top: -hp(10),
    left: -wp(20),
    width: wp(70),
    height: wp(70),
    borderRadius: wp(35),
    backgroundColor: theme.colors.primary + "22",
  },
  circle2: {
    position: "absolute",
    bottom: -hp(10),
    right: -wp(25),
    width: wp(60),
    height: wp(60),
    borderRadius: wp(30),
    backgroundColor: theme.colors.primaryDark + "18",
  },
  circle3: {
    position: "absolute",
    top: hp(30),
    right: -wp(10),
    width: wp(30),
    height: wp(30),
    borderRadius: wp(15),
    backgroundColor: theme.colors.primary + "10",
  },
  container: {
    flex: 1,
    gap: 18,
    paddingHorizontal: wp(7),
    paddingVertical: hp(8),
    alignItems: "center",
    zIndex: 1,
    justifyContent: "center",
  },
  header: {
    marginBottom: hp(4),
    alignItems: "center",
  },
  title: {
    fontSize: hp(3.5),
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: hp(0.7),
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: hp(1.8),
    color: theme.colors.textSecondary,
    textAlign: "center",
    marginHorizontal: wp(2),
    fontWeight: "500",
  },
  form: {
    gap: 22,
    width: "100%",
    marginBottom: hp(4),
  },
  footer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: hp(2),
    gap: 6,
  },
  footerText: {
    color: theme.colors.textSecondary,
    fontSize: hp(1.7),
  },
  footerLink: {
    color: theme.colors.primaryDark,
    fontWeight: "bold",
    fontSize: hp(1.7),
    marginLeft: 4,
    textDecorationLine: "underline",
  },
});
