import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Pressable,
  Alert,
} from "react-native";
import React, { useRef, useState } from "react";
import ScreenWrapper from "../../components/ScreenWrapper";
import Header from "../../components/Header";
import { hp, wp } from "../../helpers/common";
import { theme } from "../../constants/theme";
import { useAuth } from "../../contexts/AuthContext";
import Avatar from "../../components/Avatar";
import RichTextEditor from "../../components/RichTextEditor";
import { useRouter } from "expo-router";
import Icon from "../../assets/icons";
import Button from "../../components/Button";
import { Image } from "react-native";
import * as ImagePicker from "expo-image-picker"; // Asegúrate de tener este import si usas ImagePicker
import { getSupabaseFileUrl } from "../../services/imageService";
import { Video } from "expo-av";
import { createOrUpdatePost } from "../../services/postService";

const NewPost = () => {
  const { user } = useAuth();
  const bodyRef = useRef("");
  const editorRef = useRef(null);
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);

  const onPick = async (isImage) => {
    let mediaConfig = {
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.7,
    };

    if (!isImage) {
      mediaConfig = {
        mediaTypes: ImagePicker.MediaTypeOptions.Videos,
        allowsEditing: true,
      };
    }

    let result = await ImagePicker.launchImageLibraryAsync(mediaConfig);
    console.log("assets ", result.assets[0]);
    if (!result.canceled) {
      setFile(result.assets[0]);
    }
  };

  const isLocalFile = (file) => {
    if (!file) return null;
    if (typeof file == "object") return true;
  };

  const getFileType = (file) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.type; // Asegúrate de que `file.type` sea la propiedad correcta
    }

    // Si `file` es un string o `file.uri` es la URI, revisa si contiene 'postImage'
    if (typeof file === "string" || file.uri) {
      const filePath = file.uri ? file.uri : file;
      if (filePath.includes("postImage")) {
        return "image";
      }
    }
    return null;
  };

  const getFileUri = (file) => {
    if (!file) return null;
    if (isLocalFile(file)) {
      return file.uri;
    }
    return getSupabaseFileUrl(file)?.uri;
  };

  const onSubmit = async () => {
    if (!bodyRef.current && !file) {
      Alert.alert(
        "Publicación",
        "Por favor, escribe algo o agrega una imagen o video"
      );
      return;
    }
    let data = {
      file,
      body: bodyRef.current,
      userId: user?.id,
    };

    setLoading(true);
    let res = await createOrUpdatePost(data);
    setLoading(false);
    if(res.success){
      bodyRef.current = "";
      editorRef.current?.setContentHTML("");
      router.replace("/home");
    } else {
      Alert.alert("error no se pudo publicar", res.msg);
    }
  };
  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
        <Header title="Crear Publicación" />
        <ScrollView contentContainerStyle={{ gap: 20 }}>
          {/* Avatar del usuario */}
          <View style={styles.header}>
            <Avatar
              uri={user?.image}
              size={hp(6.5)}
              rounded={theme.radius.xxl}
            />
            <View style={{ gap: 2 }}>
              <Text style={styles.username}>{user && user.name}</Text>
              <Text style={styles.publicText}>Público</Text>
            </View>
          </View>

          {/* Editor de texto */}
          <View style={styles.textEditor}>
            <RichTextEditor
              editorRef={editorRef}
              onChange={(body) => (bodyRef.current = body)}
            />
          </View>

          {file && (
            <View style={styles.file}>
              {getFileType(file) == "video" ? (
                <Video
                  source={{ uri: getFileUri(file) }}
                  rate={1.0}
                  volume={1.0}
                  isMuted={false}
                  resizeMode="cover"
                  shouldPlay
                  useNativeControls
                  usePoster
                  isLooping
                  style={{ flex: 1 }}
                />
              ) : (
                <Image
                  source={{ uri: getFileUri(file) }}
                  resuzeMode="cover"
                  style={{ flex: 1 }}
                />
              )}

              <Pressable style={styles.closeIcon} onPress={() => setFile(null)}>
                <Icon name="delete" size={22} color="white" />
              </Pressable>
            </View>
          )}

          {/* Agregar media */}
          <View style={styles.media}>
            <Text style={styles.addImageText}>
              Agrega una media a tu publicación
            </Text>
            <View style={styles.mediaIcons}>
              <TouchableOpacity onPress={() => onPick(true)}>
                <Icon name="image" size={30} color={theme.colors.dark} />
              </TouchableOpacity>
              <TouchableOpacity onPress={() => onPick(false)}>
                <Icon name="video" size={33} color={theme.colors.dark} />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>

        {/* Botón de Publicar */}
        <Button
          buttonStyle={{ height: hp(6.2) }}
          title="Publicar"
          loading={loading}
          hasShadow={true}
          onPress={onSubmit}
        />
      </View>
    </ScreenWrapper>
  );
};

export default NewPost;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginBottom: 30,
    paddingHorizontal: wp(4),
    gap: 15,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  username: {
    fontSize: hp(2.2),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  publicText: {
    fontSize: hp(1.7),
    fontWeight: theme.fonts.medium,
    color: theme.colors.textLight,
  },
  textEditor: {
    // Estilo del editor de texto
  },
  media: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1.5,
    padding: 12,
    paddingHorizontal: 18,
    borderRadius: theme.radius.xxl,
    borderColor: theme.colors.gray,
  },
  mediaIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 15,
  },
  addImageText: {
    fontSize: hp(1.9),
    fontWeight: theme.fonts.semibold,
    color: theme.colors.text,
  },
  file: {
    height: hp(30),
    width: "100%",
    borderRadius: theme.radius.xxl,
    overflow: "hidden",
  },
  closeIcon: {
    position: "absolute",
    top: 10,
    right: 10,
    padding: 8,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    borderRadius: 50,
  },
});
