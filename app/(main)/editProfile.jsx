import { StyleSheet, ScrollView, Text, View, Pressable, Alert, Modal } from "react-native";
import { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import ArrowLeftIcon from "../../assets/icons/ArrowLeft";
import { Image } from "expo-image";
import Icon from "../../assets/icons";
import Input from "../../components/Input";
import { updateUser } from "../../services/userService";
import { useAuth } from "../../contexts/AuthContext";
import { getUserImageSrc } from "../../services/imageService";
import { fetchInterests, saveUserInterests } from "../../services/interestService";
import Button from "../../components/Button";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { uploadFile } from "../../services/imageService";
import { supabase } from "../../lib/supabase";

const EditProfile = () => {
  const { user: currentUser, setUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const [user, setUser] = useState({
    name: "",
    phoneNumber: "",
    image: null,
    bio: "",
    address: "",
  });

  const [interests, setInterests] = useState([]);
  const [selectedInterests, setSelectedInterests] = useState([]);
  const [showInterestsModal, setShowInterestsModal] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setUser({
        name: currentUser.name || "",
        phoneNumber: currentUser.phoneNumber || "",
        image: currentUser.image || null,
        bio: currentUser.bio || "",
        address: currentUser.address || "",
      });
    }
  }, [currentUser]);

  useEffect(() => {
    const loadInterests = async () => {
      const allInterests = await fetchInterests();
      setInterests(allInterests);

      // Cargar intereses del usuario
      const { data } = await supabase
        .from("userInterests")
        .select("interestsId")
        .eq("userId", currentUser.id);
      setSelectedInterests(data?.map((i) => i.interestsId) || []);
    };
    if (currentUser?.id) loadInterests();
  }, [currentUser]);

  //para seleccionar una imagen y subirla
  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    });

    if (!result.cancelled) {
      setUser({ ...user, image: result.assets[0] });
    }
  };

  const onSubmit = async () => {
    let userData = { ...user };
    let { name, phoneNumber, image, bio, address } = userData;
    if (!name || !phoneNumber || !bio || !address || !image) {
      Alert.alert("Editar Perfil", "Por favor, completa todos los campos");
      return;
    }

    setLoading(true);

    if (typeof image == 'object') {
      let imagesRes = await uploadFile('profiles', image?.uri, true);
      if (imagesRes.success) userData.image = imagesRes.data;
      else userData.image = null;
    }

    // Actualizar el usuario
    const res = await updateUser(currentUser?.id, userData);

    // --- Guardar intereses ---
    await supabase
      .from("userInterests")
      .delete()
      .eq("userId", currentUser.id);

    if (selectedInterests.length > 0) {
      const { error } = await saveUserInterests(currentUser.id, selectedInterests);
      if (error) {
        Alert.alert("Error", "No se pudieron guardar los intereses:\n" + error.message);
        console.log("Error al guardar intereses:", error);
      }
    }
    // --- Fin guardar intereses ---

    setLoading(false);
    if (res.success) {
      setUserData({ ...currentUser, ...userData });
      // NO navega a ningún lado
      Alert.alert("Perfil actualizado", "Tus datos se guardaron correctamente.");
    }
  };

  let imageSource = user.image && typeof user.image == 'object' ? user.image.uri : getUserImageSrc(user.image);

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Header con icono y título */}
          <View style={styles.headerRow}>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [
                styles.iconButton,
                pressed && styles.iconButtonPressed
              ]}
              android_ripple={{ color: "#16a08522", borderless: true }}
            >
              <ArrowLeftIcon width={26} height={26} color="#16a085" strokeWidth={2.5} />
            </Pressable>
            <Text style={styles.headerTitle}>
              Editar perfil
            </Text>
          </View>

          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image source={imageSource} style={styles.avatar} />
              <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                <Icon name="camera" size={22} strokeWidth={2.5} />
              </Pressable>
            </View>
            <Text style={{
              fontSize: hp(1.7),
              color: theme.colors.textSecondary,
              textAlign: "center",
              marginBottom: 10,
              marginTop: 2,
              letterSpacing: 0.2,
            }}>
              Edita los datos de tu perfil
            </Text>
            <View style={styles.inputGroup}>
              <Input
                icon={<Icon name="user" />}
                placeholder="Nombre"
                value={user.name}
                onChangeText={(value) => setUser({ ...user, name: value })}
                containerStyle={styles.inputModern}
                inputStyle={styles.inputText}
              />
              <Input
                icon={<Icon name="call" />}
                placeholder="Teléfono de contacto"
                value={user.phoneNumber}
                onChangeText={(value) => setUser({ ...user, phoneNumber: value })}
                containerStyle={styles.inputModern}
                inputStyle={styles.inputText}
                keyboardType="phone-pad"
              />
              <Input
                icon={<Icon name="location" />}
                placeholder="Dirección de residencia"
                value={user.address}
                onChangeText={(value) => setUser({ ...user, address: value })}
                containerStyle={styles.inputModern}
                inputStyle={styles.inputText}
              />
              <Input
                placeholder="Escribe algo sobre ti"
                value={user.bio}
                multiline={true}
                containerStyle={[styles.inputModern, styles.bio]}
                inputStyle={styles.inputText}
                onChangeText={(value) => setUser({ ...user, bio: value })}
              />
            </View>

            {/* Selector de intereses */}
            <View style={{ marginBottom: 18 }}>
              <Text style={{
                fontWeight: "bold",
                marginBottom: 8,
                fontSize: hp(2.1),
                color: theme.colors.primaryDark,
                letterSpacing: 0.5
              }}>
                Tus intereses
              </Text>
              <View style={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                marginBottom: 8,
                minHeight: 36,
                alignItems: "center"
              }}>
                {interests.filter((item) => selectedInterests.includes(item.id)).length > 0 ? (
                  interests
                    .filter((item) => selectedInterests.includes(item.id))
                    .map((item) => (
                      <View key={item.id} style={[styles.chip, styles.chipSelected]}>
                        <Text style={[styles.chipText, styles.chipTextSelected]}>{item.name}</Text>
                      </View>
                    ))
                ) : (
                  <Text style={{ color: theme.colors.textSecondary, fontSize: hp(1.7) }}>No tienes intereses seleccionados</Text>
                )}
              </View>
              <Pressable
                onPress={() => setShowInterestsModal(true)}
                style={{
                  alignSelf: "flex-start",
                  paddingVertical: 8,
                  paddingHorizontal: 18,
                  borderRadius: 18,
                  borderWidth: 1,
                  borderColor: theme.colors.primary,
                  backgroundColor: "#fff",
                  flexDirection: "row",
                  alignItems: "center",
                  marginTop: 4,
                  marginLeft: 2,
                  opacity: 0.92,
                }}
              >
                <Icon name="edit" size={16} color={theme.colors.primary} style={{ marginRight: 6 }} />
                <Text style={{
                  color: theme.colors.primary,
                  fontSize: hp(1.7),
                  fontWeight: "500",
                  letterSpacing: 0.2,
                }}>
                  Editar intereses
                </Text>
              </Pressable>
            </View>

            {/* Espacio antes del botón guardar */}
            <View style={{ height: 32 }} />
          </View>
        </ScrollView>
        {/* Botón guardar fijo abajo con espacio */}
        <View style={{ paddingHorizontal: 10, paddingBottom: 18, backgroundColor: "#fff" }}>
          <Button title="Guardar" loading={loading} onPress={onSubmit} />
        </View>
      </View>

      {/* Modal de intereses mejorado */}
      <Modal
        visible={showInterestsModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowInterestsModal(false)}
      >
        <View style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.18)",
          justifyContent: "center",
          alignItems: "center"
        }}>
          <View style={{
            backgroundColor: "#fff",
            borderRadius: 22,
            padding: 26,
            width: "88%",
            maxHeight: "75%",
            shadowColor: "#000",
            shadowOpacity: 0.18,
            shadowRadius: 12,
            elevation: 10
          }}>
            <Text style={{
              fontWeight: "bold",
              fontSize: hp(2.3),
              marginBottom: 18,
              color: theme.colors.primaryDark,
              textAlign: "center"
            }}>
              Selecciona tus intereses
            </Text>
            <ScrollView contentContainerStyle={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingBottom: 12 }}>
              {interests.map((item) => {
                const selected = selectedInterests.includes(item.id);
                return (
                  <Pressable
                    key={item.id}
                    style={[
                      styles.chip,
                      selected && styles.chipSelected,
                      {
                        marginBottom: 8,
                        shadowColor: selected ? theme.colors.primary : "#000",
                        shadowOpacity: selected ? 0.18 : 0.08,
                        shadowRadius: 4,
                        elevation: selected ? 3 : 1,
                        borderWidth: selected ? 2 : 1.5
                      }
                    ]}
                    onPress={() => {
                      setSelectedInterests((prev) =>
                        prev.includes(item.id)
                          ? prev.filter((i) => i !== item.id)
                          : [...prev, item.id]
                      );
                    }}
                  >
                    <Text style={[styles.chipText, selected && styles.chipTextSelected]}>
                      {item.name}
                    </Text>
                  </Pressable>
                );
              })}
            </ScrollView>
            <Button
              title="Listo"
              onPress={() => setShowInterestsModal(false)}
              style={{ marginTop: 18 }}
            />
          </View>
        </View>
      </Modal>
    </ScreenWrapper>
  );
};

export default EditProfile;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: wp(4),
  },
  avatarContainer: {
    height: hp(14),
    width: hp(14),
    alignSelf: "center",
  },
  avatar: {
    width: "100%",
    height: "100%",
    borderRadius: theme.radius.xxl * 1.8,
    borderCurve: "continuous",
    borderWidth: 1,
    borderColor: theme.colors.darkLight,
  },
  cameraIcon: {
    position: "absolute",
    bottom: 0,
    right: -10,
    padding: 8,
    borderRadius: 50,
    backgroundColor: "white",
    shadowColor: theme.colors.textLight,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 7,
  },
  form: {
    gap: 18,
    marginTop: 20,
  },
  inputGroup: {
    gap: 14,
    marginBottom: 10,
  },
  inputModern: {
    backgroundColor: "#f6f7fa",
    borderRadius: 16,
    borderWidth: 0,
    paddingHorizontal: 12,
    marginBottom: 0,
    elevation: 0,
  },
  inputText: {
    color: theme.colors.text,
    fontSize: hp(1.8),
    paddingVertical: 10,
  },
  bio: {
    minHeight: hp(10),
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: theme.colors.primary,
    backgroundColor: "#fff",
    marginBottom: 4,
    marginRight: 4,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  chipSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primaryDark,
    shadowColor: theme.colors.primary,
    shadowOpacity: 0.18,
    shadowRadius: 4,
    elevation: 3,
  },
  chipText: {
    color: theme.colors.primary,
    fontWeight: "600",
    fontSize: hp(1.7),
    letterSpacing: 0.2,
  },
  chipTextSelected: {
    color: "#fff",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 10,
  },
  headerTitle: {
    flex: 1,
    fontSize: hp(3),
    fontWeight: "bold",
    color: theme.colors.primaryDark,
    textAlign: "center",
    letterSpacing: 0.5,
  },
});
