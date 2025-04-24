import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import { wp, hp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { TouchableOpacity } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "../../lib/supabase";
import Avatar from "../../components/Avatar";

const Profile = () => {
  const { user, setAuth } = useAuth();
  const router = useRouter();

  const onLogout = async () => {
    setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Cerrar sesión", error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      { text: "Cancelar", style: "cancel" },
      { text: "Cerrar sesión", onPress: async () => onLogout(), style: "destructive" },
    ]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenWrapper bg="#f7f7f7" noPaddingTop>
        <UserHeader user={user} router={router} handleLogout={handleLogout} />
      </ScreenWrapper>
    </GestureHandlerRootView>
  );
};

const UserHeader = ({ user, router, handleLogout }) => {
  return (
    <View style={{ flex: 1 }}>
      {/* Header decorativo */}
      <View style={styles.headerBg}>
        {/* Ejemplo de círculos decorativos */}
        <View style={styles.circle1} />
        <View style={styles.circle2} />
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Text style={{ fontSize: 22, color: "white" }}>←</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Text style={{ fontSize: 20, color: theme.colors.rose }}>⎋</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.avatarWrapper}>
          <Avatar
            uri={user?.image}
            size={hp(13)}
            rounded={theme.radius.xxl}
            style={styles.avatarShadow}
          />
          <Pressable style={styles.editIcon} onPress={() => router.push("editProfile")}>
            <Text style={{ fontSize: 18, color: theme.colors.primaryDark }}>✎</Text>
          </Pressable>
        </View>
        <Text style={styles.userName}>{user?.name}</Text>
        {user?.bio && (
          <Text style={styles.userBio}>{user.bio}</Text>
        )}
        {/* Estadísticas */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Posts</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Seguidores</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statNumber}>0</Text>
            <Text style={styles.statLabel}>Siguiendo</Text>
          </View>
        </View>
      </View>

      {/* Card de opciones */}
      <View style={styles.optionsCard}>
        <Text style={styles.sectionTitle}>Resumen de cuenta</Text>
        <OptionItem emoji="👤" label="Mi Perfil" onPress={() => router.push("editProfile")} />
        <OptionItem emoji="✉️" label={user?.email} disabled />
        {user?.address && <OptionItem emoji="📍" label={user.address} disabled />}
        {user?.phoneNumber && <OptionItem emoji="📱" label={user.phoneNumber} disabled />}

        
        {/* Puedes agregar más opciones aquí */}
        <OptionItem emoji="🔒" label="Cambiar contraseña" onPress={() => {}} />
        <OptionItem emoji="🌐" label="Idioma" onPress={() => {}} />
      </View>
      {/* Footer motivacional */}
      <View style={styles.footerMsg}>
        <Text style={{ color: theme.colors.textLight, fontSize: hp(1.7), textAlign: "center" }}>
          ¡Gracias por ser parte de nuestra comunidad!
        </Text>
      </View>
    </View>
  );
};

const OptionItem = ({ emoji, label, onPress, disabled }) => (
  <TouchableOpacity
    onPress={onPress}
    disabled={disabled}
    style={[styles.optionRow, disabled && { opacity: 0.7 }]}
  >
    <Text style={styles.optionEmoji}>{emoji}</Text>
    <Text style={styles.optionLabel}>{label}</Text>
    {!disabled && <Text style={{ color: theme.colors.textLight, fontSize: 18 }}>›</Text>}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  headerBg: {
    backgroundColor: theme.colors.primaryDark,
    borderBottomLeftRadius: 32,
    borderBottomRightRadius: 32,
    paddingBottom: 28,
    alignItems: "center",
    paddingTop: 40,
    position: "relative",
    width: "100%",
    overflow: "hidden",
  },
  circle1: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#1e293b22",
    top: 10,
    left: -40,
  },
  circle2: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#fff2",
    top: 60,
    right: -30,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
    paddingHorizontal: 18,
    marginBottom: 0,
    marginTop: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.08)",
  },
  logoutButton: {
    padding: 8,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.10)",
  },
  avatarWrapper: {
    marginTop: 8,
    marginBottom: 8,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarShadow: {
    borderWidth: 3,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    elevation: 8,
    backgroundColor: "#fff",
  },
  editIcon: {
    position: "absolute",
    bottom: 8,
    right: -8,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.primaryDark,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
  userName: {
    fontSize: hp(2.5),
    fontWeight: "bold",
    color: "white",
    marginTop: 8,
    textAlign: "center",
    letterSpacing: 0.2,
  },
  userBio: {
    color: "#e0e0e0",
    fontSize: hp(1.7),
    textAlign: "center",
    marginTop: 4,
    marginBottom: 2,
    marginHorizontal: 20,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 14,
    marginBottom: 2,
    width: "100%",
    paddingHorizontal: 30,
  },
  statBox: {
    alignItems: "center",
  },
  statNumber: {
    fontWeight: "bold",
    fontSize: hp(2.1),
    color: "white",
  },
  statLabel: {
    fontSize: hp(1.5),
    color: "#e0e0e0",
  },
  optionsCard: {
    backgroundColor: "white",
    borderRadius: 24,
    marginTop: -22,
    marginHorizontal: 12,
    paddingVertical: 18,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: hp(2),
    color: theme.colors.textDark,
    marginBottom: 10,
    marginLeft: 2,
  },
  optionRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingHorizontal: 2,
  },
  optionEmoji: {
    width: 36,
    textAlign: "center",
    fontSize: 20,
    marginRight: 10,
  },
  optionLabel: {
    flex: 1,
    fontSize: hp(2),
    color: theme.colors.textDark,
  },
  footerMsg: {
    marginTop: 30,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default Profile;