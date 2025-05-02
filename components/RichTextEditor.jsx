import AsyncStorage from "@react-native-async-storage/async-storage";
import { StyleSheet, Text, View, Modal, TextInput, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import React, { useState } from "react";
import { theme } from "../constants/theme";
import { actions, RichToolbar } from "react-native-pell-rich-editor";
import { RichEditor } from "react-native-pell-rich-editor";
import { generatePost } from "../utils/cohere";
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // Asegúrate de tener instalada esta librería

const MAX_GENERATIONS = 5;

async function canGenerateToday() {
  const today = new Date().toISOString().slice(0, 10);
  const data = JSON.parse(await AsyncStorage.getItem("ai_generations") || "{}");
  if (data.date !== today) {
    await AsyncStorage.setItem("ai_generations", JSON.stringify({ date: today, count: 0 }));
    return true;
  }
  return data.count < MAX_GENERATIONS;
}

async function incrementGeneration() {
  const today = new Date().toISOString().slice(0, 10);
  const data = JSON.parse(await AsyncStorage.getItem("ai_generations") || "{}");
  const count = data.date === today ? (data.count || 0) + 1 : 1;
  await AsyncStorage.setItem("ai_generations", JSON.stringify({ date: today, count }));
}

const quickPrompts = [
  "Recursos gratuitos para programar",
  "Tips para ser más productivo",
  "Cómo organizar el tiempo de estudio",
  "Errores comunes en entrevistas técnicas",
];

const RichTextEditor = ({ editorRef, onChange }) => {
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [generationsLeft, setGenerationsLeft] = useState(MAX_GENERATIONS);

  // Actualiza el contador al abrir el modal
  const checkGenerations = async () => {
    const today = new Date().toISOString().slice(0, 10);
    const data = JSON.parse(await AsyncStorage.getItem("ai_generations") || "{}");
    if (data.date === today) {
      setGenerationsLeft(Math.max(0, MAX_GENERATIONS - (data.count || 0)));
    } else {
      setGenerationsLeft(MAX_GENERATIONS);
    }
    setModalVisible(true);
  };

  const handleAIGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    try {
      if (!(await canGenerateToday())) {
        Alert.alert("Límite alcanzado", "Solo puedes generar 5 posts con IA por día.");
        setLoading(false);
        return;
      }
      const aiText = await generatePost(
        `Redacta un post breve (máximo 6 líneas) en español para una app de compartir conocimientos y recursos.
        El post debe comenzar con "Comunidad de Catwise" o una frase similar que mencione la comunidad de Catwise.
        El tema es: ${prompt}.
        Si el tema requiere recomendaciones, tips o recursos, preséntalos en listas con viñetas (<ul><li></li></ul>) o listas numeradas (<ol><li></li></ol>).
        Si corresponde, incluye enlaces útiles usando <a href="URL">texto</a>.
        Si es una explicación, usa párrafos claros y separados con <br>.
        Usa HTML básico para listas, negritas (<b>), encabezados (<h2>), enlaces (<a>), y separa los párrafos con <br>.
        Hazlo claro, ordenado y fácil de leer. No pidas comentarios ni interacción, solo entrega el contenido solicitado.`
      );
      if (aiText) {
        let cleanText = aiText.replace(/<(?!\/?(ul|ol|li|b|strong|i|h1|h2|h3|h4|br|p)\b)[^>]*>/gi, "");
        editorRef.current?.setContentHTML(cleanText);
        onChange(cleanText);
        await incrementGeneration();
        setGenerationsLeft(generationsLeft - 1);
      } else {
        Alert.alert("Error", "No se pudo generar el texto.");
      }
    } catch {
      Alert.alert("Error", "No se pudo generar el texto.");
    }
    setLoading(false);
    setModalVisible(false);
    setPrompt("");
  };

  return (
    <View style={{ minHeight: 320 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <TouchableOpacity
          style={styles.iaButton}
          onPress={checkGenerations}
          activeOpacity={0.8}
        >
          <Icon name="robot-excited-outline" size={22} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.iaButtonText}>Generar con IA</Text>
        </TouchableOpacity>
        <Text style={{
          marginLeft: 10,
          color: generationsLeft > 0 ? theme.colors.primary : "#d32f2f",
          fontWeight: "bold",
          fontSize: 15,
          backgroundColor: "#f3f3f3",
          paddingHorizontal: 10,
          paddingVertical: 6,
          borderRadius: 14,
        }}>
          {`${generationsLeft} disponibles`}
        </Text>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Icon name="robot-excited-outline" size={36} color={theme.colors.primary} style={{ alignSelf: "center", marginBottom: 8 }} />
            <Text style={styles.modalTitle}>Genera tu post con IA</Text>
            {/* Contador visible para el usuario */}
            <Text style={{ color: theme.colors.primary, textAlign: "center", marginBottom: 10, fontWeight: "bold" }}>
              {`Generaciones IA hoy: ${MAX_GENERATIONS - generationsLeft}/${MAX_GENERATIONS} (${generationsLeft} disponibles)`}
            </Text>
            {/* Atajos rápidos */}
            <View style={{ flexDirection: "row", flexWrap: "wrap", marginBottom: 10 }}>
              {quickPrompts.map((s, i) => (
                <TouchableOpacity
                  key={i}
                  style={{
                    backgroundColor: "#eee",
                    borderRadius: 12,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                    marginRight: 6,
                    marginBottom: 6,
                  }}
                  onPress={() => setPrompt(s)}
                  disabled={loading}
                >
                  <Text style={{ color: theme.colors.primary, fontSize: 13 }}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
            <TextInput
              style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
              placeholder="¿Sobre qué tema quieres tu post?"
              value={prompt}
              onChangeText={setPrompt}
              editable={!loading}
              multiline
              returnKeyType="done"
              blurOnSubmit
            />
            <View style={{ flexDirection: "row", justifyContent: "flex-end", marginTop: 18 }}>
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={() => setModalVisible(false)}
                disabled={loading}
              >
                <Text style={{ color: theme.colors.textDark }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.generateBtn, (!prompt || loading || generationsLeft <= 0) && { opacity: 0.6 }]}
                onPress={handleAIGenerate}
                disabled={loading || !prompt || generationsLeft <= 0}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Icon name="lightbulb-on-outline" size={18} color="#fff" style={{ marginRight: 5 }} />
                    <Text style={{ color: "#fff", fontWeight: "bold" }}>Generar</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <RichToolbar
        actions={[
          actions.insertLink,
          actions.setBold,
          actions.setItalic,
          actions.setStrikethrough,
          actions.removeFormat,
          actions.insertOrderedList,
          actions.blockquote,
          actions.alignLeft,
          actions.alignCenter,
          actions.alignRight,
          actions.code,
          actions.line,
          actions.heading1,
          actions.heading4,
        ]}
        iconMap={{
          [actions.heading1]: ({ tinColor }) => <Text style={{ color: tinColor }}>H1</Text>,
          [actions.heading4]: ({ tinColor }) => <Text style={{ color: tinColor }}>H4</Text>
        }}
        style={styles.richBar}
        flatContainerStyle={styles.listStyle}
        selectIconTint={theme.colors.primary} // <-- Verde cuando está activo
        selectedIconTint={theme.colors.primary} // <-- Verde cuando está activo (algunas versiones usan esta prop)
        editor={editorRef}
        disabled={false}
      />
      <RichEditor
        ref={editorRef}
        containerStyle={styles.rich}
        editorStyle={styles.containerStyle}
        placeholder={"Start typing here..."}
        onChange={onChange}
      />
    </View>
  );
};

export default RichTextEditor;

const styles = StyleSheet.create({
  iaButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    borderRadius: 22,
    paddingVertical: 10,
    paddingHorizontal: 18,
    alignSelf: "flex-start",
    marginBottom: 10,
    elevation: 2,
  },
  iaButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    letterSpacing: 0.2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    width: "88%",
    elevation: 6,
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 18,
    textAlign: "center",
    marginBottom: 6,
    color: theme.colors.primary,
  },
  modalDesc: {
    fontSize: 14,
    color: "#555",
    textAlign: "center",
    marginBottom: 14,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#eee",
  },
  generateBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 8,
  },
  richBar: {
    borderTopRightRadius: theme.radius.xxl,
    borderTopLeftRadius: theme.radius.xxl,
    backgroundColor: theme.colors.gray,
  },
  rich: {
    minHeight: 240,
    flex: 1,
    borderWidth: 1.5,
    borderTopColorWidth: 0,
    borderBottomLeftRadius: theme.radius.xxl,
    borderBottomRightRadius: theme.radius.xxl,
    borderColor: theme.colors.gray,
    padding: 5,
  },
  contentStyle: {
    color: theme.colors.textDark,
    placeholderColor: 'gray',
  },
  flatStyle: {
    paddingHorizontal: 8,
    gap: 3,
  },
});
