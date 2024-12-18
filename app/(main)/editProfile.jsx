import { StyleSheet, ScrollView, Text, View, Pressable } from "react-native";
import { useEffect, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import Header from "../../components/Header";
import { Image } from "expo-image";
import Icon from "../../assets/icons";
import Input from "../../components/Input";
import { Alert } from "react-native";
import { updateUser } from "../../services/userService";

import { useAuth } from "../../contexts/AuthContext";
import { getUserImageSrc } from "../../services/imageService";
import Button from "../../components/Button";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { uploadFile } from "../../services/imageService";

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


  //para seleccionar una imagen y subirla
  const onPickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      madiaTypes: ImagePicker.MediaTypeOptions.Images,
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

    if( typeof image == 'object'){
      let imagesRes = await uploadFile('profiles', image?.uri, true);
      if(imagesRes.success)userData.image = imagesRes.data;
      else userData.image= null;
      
    }



    //actualizar el usuario

    const res = await updateUser(currentUser?.id, userData);
    setLoading(false);
    if (res.success) {
      setUserData({...currentUser, ...userData});
      router.back();
    }
  };

  let imageSource = user.image && typeof user.image == 'object'? user.image.uri: getUserImageSrc(user.image);

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <ScrollView style={{ flex: 1 }}>
          <Header title="Editar Perfil" />
          {/* formulario para editar */}

          <View style={styles.form}>
            <View style={styles.avatarContainer}>
              <Image source={imageSource} style={styles.avatar} />
              <Pressable style={styles.cameraIcon} onPress={onPickImage}>
                <Icon name="camera" size={20} strokeWidth={2.5} />
              </Pressable>
            </View>
            <Text style={{ fontSize: hp(1.5), color: theme.colors.text }}>
              edita los datos de tu perfil
            </Text>
            <Input
              icon={<Icon name="user" />}
              placeholder="Nombre"
              value={user.name}
              onChangeText={(value) => setUser({ ...user, name: value })}
            />
            <Input
              icon={<Icon name="call" />}
              placeholder="telefono de contacto"
              value={user.phoneNumber}
              onChangeText={(value) => setUser({ ...user, phoneNumber: value })}
            />
            <Input
              icon={<Icon name="location" />}
              placeholder="Dirección de residencia"
              value={user.address}
              onChangeText={(value) => setUser({ ...user, address: value })}
            />
            <Input
              placeholder="escrito sobre ti"
              value={user.bio}
              multiline={true} //sirve para que el input sea de varias lineas
              containerStyle={styles.bio}
              onChangeText={(value) => setUser({ ...user, bio: value })}
            />

            <Button title="Guardar" loading={loading} onPress={onSubmit} />
          </View>
        </ScrollView>
      </View>
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
  input: {
    flexDirection: "row",
    borderWidth: 0.4,
    borderColor: theme.colors.text,
    borderRadius: theme.radius.xxl,
    borderCurve: "continuous",
    paddingHorizontal: 20,
    borderRadius: theme.radius.xxl,
    gap: 15,
  },
  bio: {
    flexDirection: "row",
    height: hp(15),
    alignItems: "flex-start",
    paddingVertical: 15,
  },
});
