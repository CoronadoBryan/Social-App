import { StyleSheet, Text, View } from "react-native";
import React from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";
import Header from "../../components/Header";
import { wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Icon from "../../assets/icons";
import { TouchableOpacity } from "react-native-gesture-handler";
import { GestureHandlerRootView } from "react-native-gesture-handler";

const Profile = () => {
  const { user, setAuth } = useAuth(); // Obtener el usuario autenticado
  const router = useRouter(); // Obtener el enrutador
  const handleLogout = async () => {};

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
    <View
      style={{ flex: 1, backgroundColor: "white", paddingHorizontal: wp(4) }}
    >
      <View>
        <Header title="profile" showBackButton={true} />
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Icon name="logout" color={theme.colors.rose} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default Profile;

const styles = StyleSheet.create({});
