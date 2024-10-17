import { Image, Pressable, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { wp, hp } from '../helpers/common'
import { theme } from '../constants/theme'
import Button from '../components/Button'
import { useRouter } from 'expo-router';

const Welcome = () => {
    const router = useRouter();
  return (
    <ScreenWrapper bg="white">
      <StatusBar style="dark" />
      <View style={styles.container}>
        {/* Imagen de bienvenida */}
        <Image
          style={styles.welcomeImage}
          resizeMode="contain"
          source={require("../assets/images/welcome.png")}
        />
        {/* Título de la app */}
        <View style={styles.textContainer}>
          <Text style={styles.title}>Amigu App</Text>
          <Text style={styles.punchline}>
            Simplifica tus conexiones. Inspírate, comparte y descubre.
          </Text>
        </View>
        {/* Footer con botón */}
        <View style={styles.footer}>
          <Button
            title="Comenzar"
            buttonStyle={{ width: '100%', paddingVertical: hp(1.2) }}
            onPress={() => router.push("signUp")}
          />
          <View style={styles.bottomTextContainer}>
            <Text style={styles.alreadyAccountText}>
              ¿Ya tienes una cuenta?
            </Text>
            <Pressable onPress={() => router.push("Login")}>
              <Text style={styles.loginLinkText}>
                Iniciar Sesión
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: "white",
    paddingHorizontal: wp(5),
    paddingVertical: hp(3),
  },
  welcomeImage: {
    height: hp(25),
    width: wp(50),
    marginBottom: hp(3),
  },
  textContainer: {
    alignItems: 'center',
    marginBottom: hp(5),
  },
  title: {
    color: theme.colors.primary,
    fontSize: hp(5),
    fontWeight: theme.fonts.bold,
    textAlign: 'center',
    marginBottom: hp(10),
  },
  punchline: {
    textAlign: 'center',
    fontSize: hp(1.9),
    color: theme.colors.textSecondary,
    paddingHorizontal: wp(8),
    lineHeight: hp(2.5),
  },
  footer: {
    width: '100%',
    alignItems: 'center',
    paddingHorizontal: wp(4),
  },
  bottomTextContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: hp(2),
  },
  alreadyAccountText: {
    color: theme.colors.textSecondary,
    fontSize: hp(1.6),
    marginRight: wp(1),
  },
  loginLinkText: {
    color: theme.colors.primary,
    fontSize: hp(1.6),
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});
