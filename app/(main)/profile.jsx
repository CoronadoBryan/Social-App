import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import { wp, hp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { supabase } from "../../lib/supabase";
import Avatar from "../../components/Avatar";

const Profile = () => {
  const { user, setAuth } = useAuth(); // Obtener el usuario autenticado

  const router = useRouter(); // Obtener el enrutador

  const onLogout = async () => {
    setAuth(null);
    const { error } = await supabase.auth.signOut();
    if (error) {
      Alert.alert("Cerrar sesión", error.message);
    }
  };

  const handleLogout = async () => {
    Alert.alert("Cerrar sesión", "¿Estás seguro de que deseas cerrar sesión?", [
      {
        text: "Cancelar",
        onPress: () => console.log("Acción cancelada"),
        style: "cancel",
      },
      {
        text: "Cerrar sesión",
        onPress: async () => onLogout(),
        style: "destructive",
      },
    ]);
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScreenWrapper bg="white">
        <UserHeader user={user} router={router} handleLogout={handleLogout} />
      </ScreenWrapper>
    </GestureHandlerRootView>
  );
};

const UserHeader = ({ user, router, handleLogout }) => {
  return (
    <View style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}>
      <View>
        <Header title="Profile" mb={35} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" color={theme.colors.rose} />
        </TouchableOpacity>
      </View>
      <View style={styles.container}>
        <View style={styles.avatarContainer}>
          <Avatar uri={user?.user_metadata?.image} size={hp(12)} rounded={theme.radius.xxl} />
          <Pressable style={styles.editIcon} onPress={() => router.push("editProfile")}>
            <Icon name="edit" strokeWidth={2.5} size={20} />
          </Pressable>
        </View>
        <View style={{ alignItems: 'center', marginTop: 10 }}>
          <Text style={styles.userName}>{user && user.name}</Text>
          <Text style={styles.infoText}>{user && user.address}</Text>
        </View>

        <View style={{gap:10}}>
          <View style={styles.info}>
            <Icon name="mail" size={20} color={theme.colors.textLight} />
            <Text style={styles.infoText}>
              {user  && user.email}
            </Text>
          </View>

          {
            user && user.phoneNumber && (
              <View style={styles.info}>
                <Icon name="call" size={20} color={theme.colors.textLight} />
                <Text style={styles.infoText}>
                  {user  && user.phoneNumber}
                </Text>
              </View>
            )
          }
          {
            user && user.bio && (
              <Text style={styles.infoText}>{user.bio}</Text>
            )
          }


          
        </View>


      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  avatarContainer: {
    alignSelf: "center",
    marginBottom: 10,
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: -12,
    padding: 7,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  userName: {
    fontSize: hp(3),
    fontWeight: "500",
    color: theme.colors.textDark,
  },
  logoutButton: {
    position: "absolute",
    padding: 8,
    right: 0,
    top: 5,
    borderRadius: theme.radius.sm,
    backgroundColor: "#fee2e2",
  },
});
