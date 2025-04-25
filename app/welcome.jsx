import { ImageBackground, StyleSheet, Text, View, Pressable, Modal, Linking } from 'react-native'
import React, { useState } from 'react'
import ScreenWrapper from '../components/ScreenWrapper'
import { StatusBar } from 'expo-status-bar'
import { wp, hp } from '../helpers/common'
import { theme } from '../constants/theme'
import { useRouter } from 'expo-router'
import { AntDesign, FontAwesome } from '@expo/vector-icons'

const Welcome = () => {
  const router = useRouter()
  const [modalVisible, setModalVisible] = useState(false)

  const openLink = (url) => {
    Linking.openURL(url)
    setModalVisible(false)
  }

  return (
    <ScreenWrapper>
      <StatusBar style="light" />
      <ImageBackground
        source={require("../assets/images/welcome-bg.png")}
        style={styles.bg}
        resizeMode="cover"
      >
        <View style={styles.contentWrapper}>
          <View style={styles.contentBox}>
            <Text style={styles.appName}>Catwise</Text>
            <Text style={styles.slogan}>
              Comparte recursos, resuelve dudas y potencia tu aprendizaje en programación y diseño.
              Únete a la comunidad, crece y ayuda a otros a crecer.
            </Text>
            <View style={styles.buttonGroup}>
              <Pressable
                style={({ pressed }) => [
                  styles.flatButton,
                  pressed && { backgroundColor: "#fff2" }
                ]}
                onPress={() => router.push("Login")}
              >
                <Text style={styles.flatButtonText}>Iniciar Sesión</Text>
              </Pressable>
              <Pressable
                style={({ pressed }) => [
                  styles.flatButtonOutline,
                  pressed && { backgroundColor: "#fff1" }
                ]}
                onPress={() => router.push("signUp")}
              >
                <Text style={styles.flatButtonOutlineText}>Registrarse</Text>
              </Pressable>
            </View>
          </View>
        </View>
        {/* Botón grande "Síguenos" abajo */}
        <View style={styles.followContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.followButton,
              pressed && { opacity: 0.8 }
            ]}
            onPress={() => setModalVisible(true)}
          >
            <AntDesign name="heart" size={22} color="#fff" style={{ marginRight: 8 }} />
            <Text style={styles.followButtonText}>Síguenos</Text>
          </Pressable>
        </View>
        {/* Modal moderno */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="slide"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>¡Síguenos en nuestras redes!</Text>
              <Pressable
                style={styles.modalButton}
                onPress={() => setModalVisible(false)}
              >
                <AntDesign name="github" size={24} color="#222" />
                <Text style={styles.modalButtonText}>GitHub (pronto)</Text>
              </Pressable>
              <Pressable
                style={styles.modalButton}
                onPress={() => openLink('https://wa.me/51901064562')}
              >
                <FontAwesome name="whatsapp" size={24} color="#25D366" />
                <Text style={styles.modalButtonText}>WhatsApp</Text>
              </Pressable>
              <Pressable
                style={styles.closeModal}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeModalText}>Cerrar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ImageBackground>
    </ScreenWrapper>
  )
}

export default Welcome

const styles = StyleSheet.create({
  bg: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  contentWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
  },
  contentBox: {
    backgroundColor: 'rgba(20,20,20,0.32)', // Más suave y menos opaco
    borderRadius: 32,
    paddingVertical: hp(5),
    paddingHorizontal: wp(7),
    marginHorizontal: wp(4),
    width: '90%',
    alignItems: 'center',
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 16,
    elevation: 6,
  },
  appName: {
    fontSize: hp(4.5),
    fontWeight: '800',
    color: "#fff",
    letterSpacing: 2,
    marginBottom: hp(1.5),
    textTransform: 'uppercase',
    textShadowColor: "#000a",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 10,
  },
  slogan: {
    fontSize: hp(2.2),
    color: "#fff",
    textAlign: 'center',
    fontWeight: '500',
    marginBottom: hp(6),
    marginHorizontal: wp(2),
    letterSpacing: 0.3,
    opacity: 0.96,
    textShadowColor: "#0008",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
  buttonGroup: {
    width: '100%',
    gap: hp(1.5),
  },
  flatButton: {
    width: '100%',
    paddingVertical: hp(1.5),
    borderRadius: 16,
    backgroundColor: "#fff",
    alignItems: 'center',
  },
  flatButtonText: {
    fontSize: hp(2.1),
    fontWeight: '600',
    color: theme.colors.primary,
    letterSpacing: 0.5,
  },
  flatButtonOutline: {
    width: '100%',
    paddingVertical: hp(1.5),
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: "#fff",
    alignItems: 'center',
    backgroundColor: "transparent",
  },
  flatButtonOutlineText: {
    fontSize: hp(2.1),
    fontWeight: '600',
    color: "#fff",
    letterSpacing: 0.5,
  },
  followContainer: {
    width: '100%',
    alignItems: 'center',
    position: 'absolute',
    bottom: hp(4),
    left: 0,
    backgroundColor: 'transparent',
  },
  followButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    paddingVertical: hp(1.2),
    paddingHorizontal: wp(10),
    borderRadius: 24,
    elevation: 4,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  followButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(2.1),
    letterSpacing: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "#000a",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    padding: 28,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
  },
  modalTitle: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: theme.colors.primary,
    marginBottom: 18,
  },
  modalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f7f7f7",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 24,
    marginVertical: 8,
    width: "100%",
    justifyContent: "center",
    gap: 12,
  },
  modalButtonText: {
    fontSize: hp(2),
    color: "#222",
    fontWeight: "600",
  },
  closeModal: {
    marginTop: 18,
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
  },
  closeModalText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: hp(2),
  },
});
