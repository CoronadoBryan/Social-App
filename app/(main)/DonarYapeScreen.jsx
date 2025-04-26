import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

const qrImage = require("../../assets/images/yape-qr.jpeg");
const logoImage = require("../../assets/images/yape-logo.png");

const DonarYapeScreen = () => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>←</Text>
      </TouchableOpacity>
      <Image source={logoImage} style={styles.logo} resizeMode="contain" />
      <Text style={styles.title}>Colabora con Catwise</Text>
      <Text style={styles.desc}>
        Tu donación ayuda a mantener y mejorar la app. <Text style={{ color: "#7c3aed", fontWeight: "bold" }}>¡Gracias por tu apoyo!</Text>
      </Text>
      <Image source={qrImage} style={styles.qr} resizeMode="contain" />
      <Text style={styles.steps}>
        1. Escanea el QR con Yape{"\n"}
        2. O captura pantalla y en Yape usa <Text style={{ fontWeight: "bold" }}>"Importar imagen"</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fafaff",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  backButton: {
    position: "absolute",
    top: 38,
    left: 18,
    zIndex: 10,
    padding: 2,
  },
  backButtonText: {
    fontSize: 32,
    color: "#7c3aed",
    fontWeight: "bold",
  },
  logo: {
    width: 70,
    height: 70,
    marginBottom: 18,
    marginTop: 10,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 10,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  desc: {
    fontSize: 18,
    color: "#444",
    textAlign: "center",
    marginBottom: 28,
    lineHeight: 26,
    maxWidth: 320,
  },
  qr: {
    width: 210,
    height: 210,
    marginBottom: 22,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: "#e9d8fd",
    backgroundColor: "#fff",
    alignSelf: "center",
  },
  steps: {
    fontSize: 17,
    color: "#7c3aed",
    textAlign: "center",
    fontWeight: "600",
    marginTop: 0,
    lineHeight: 26,
    maxWidth: 320,
    marginBottom: 10,
  },
});

export default DonarYapeScreen;