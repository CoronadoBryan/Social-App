import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, Linking, ScrollView, StyleSheet, Pressable, Modal, TextInput,
  Animated, Easing, FlatList, BackHandler
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { supabase } from "../../lib/supabase";

const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzkYpsyakcfNh_bPgxuLKe_DfHwrn4KuApB5oVPnVmcRftgjmBpTnDLMTabMXFUfdvl/exec";

export default function Comunidad() {
  const router = useRouter();
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const modalScale = useRef(new Animated.Value(0.95)).current;

  const [modalVisible, setModalVisible] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [link, setLink] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [fecha, setFecha] = useState("");
  const [etiquetas, setEtiquetas] = useState("");
  const [usuario, setUsuario] = useState("");
  const [recursos, setRecursos] = useState([]);
  const [filtroEtiqueta, setFiltroEtiqueta] = useState("");

  const etiquetasDisponibles = [
    { tag: "diseño", color: "#F9D923" },
    { tag: "programacion", color: "#3AB0FF" },
    { tag: "marketing", color: "#FF6E6A" },
    { tag: "ux", color: "#A3F7BF" },
    { tag: "envato", color: "#81C784" },
    { tag: "freepik", color: "#B388FF" },
    { tag: "otros", color: "#B0BEC5" }
  ];

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data?.session) setUsuario(data.session.user.email);
    };
    checkSession();
  }, []);

  useEffect(() => { cargarRecursos(); }, []);

  useEffect(() => {
    if (modalVisible) {
      Animated.spring(modalScale, { toValue: 1, useNativeDriver: true }).start();
    } else {
      Animated.spring(modalScale, { toValue: 0.95, useNativeDriver: true }).start();
    }
  }, [modalVisible]);

  const cargarRecursos = async () => {
    Animated.timing(rotateAnim, {
      toValue: 1, duration: 600, easing: Easing.linear, useNativeDriver: true,
    }).start(() => rotateAnim.setValue(0));
    try {
      const res = await fetch(SCRIPT_URL);
      const data = await res.json();
      setRecursos(data);
    } catch {}
  };

  const handleEnviar = async () => {
    if (!titulo || !link) {
      alert("Completa ambos campos");
      return;
    }
    try {
      const res = await fetch(SCRIPT_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo, url: link, descripcion, fecha, etiquetas, usuario }),
      });
      await res.text();
      alert("¡Recurso enviado!");
      setModalVisible(false);
      setTitulo(""); setLink(""); setDescripcion(""); setFecha(""); setEtiquetas("");
      cargarRecursos();
    } catch {
      alert("Error al enviar recurso");
    }
  };

  const abrirModal = () => {
    setFecha(new Date().toISOString().slice(0, 10));
    setModalVisible(true);
  };

  useEffect(() => {
    const backAction = () => { router.replace("/home"); return true; };
    const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
    return () => backHandler.remove();
  }, [router]);

  const recursosFiltrados = recursos.filter(r => {
    let pasaFiltroEtiqueta = filtroEtiqueta
      ? r.etiquetas?.split(",").map(tag => tag.trim()).includes(filtroEtiqueta)
      : true;
    return pasaFiltroEtiqueta;
  });

  const recursosProgramacion = recursos.filter(r =>
    r.etiquetas?.split(",").map(tag => tag.trim()).includes("programacion")
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardUser}>{item.usuario}</Text>
        <Text style={styles.cardDate}>{item.fecha}</Text>
      </View>
      <Text style={styles.cardTitle}>{item.titulo}</Text>
      {item.descripcion ? (
        <Text style={styles.cardDesc} numberOfLines={3}>{item.descripcion}</Text>
      ) : null}
      <View style={styles.cardTags}>
        {item.etiquetas?.split(",").map((tag, idx) => {
          const found = etiquetasDisponibles.find(e => e.tag === tag.trim());
          return (
            <Text
              key={idx}
              style={[
                styles.cardTag,
                {
                  backgroundColor: found ? found.color : "#ECECEC",
                  color: "#222"
                }
              ]}
            >
              #{tag.trim()}
            </Text>
          );
        })}
      </View>
      <Pressable
        style={styles.cardLinkBtn}
        onPress={() => Linking.openURL(item.url)}
      >
        <Text style={styles.cardLinkBtnText}>Ir al enlace</Text>
      </Pressable>
    </View>
  );

  const renderCarouselItem = ({ item }) => (
    <View style={styles.carouselCard}>
      <View style={styles.carouselHeader}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarText}>
            {item.usuario?.[0]?.toUpperCase() || "U"}
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.carouselUser}>{item.usuario}</Text>
          <Text style={styles.carouselDate}>
            {/* Solo fecha YYYY-MM-DD */}
            {item.fecha?.split("T")[0] || item.fecha}
          </Text>
        </View>
      </View>
      <Text style={styles.carouselTitle} numberOfLines={2}>{item.titulo}</Text>
      {item.descripcion ? (
        <Text style={styles.carouselDesc} numberOfLines={3}>{item.descripcion}</Text>
      ) : null}
      <Pressable
        style={styles.carouselBtn}
        onPress={() => Linking.openURL(item.url)}
      >
        <Text style={styles.carouselBtnText}>Ver recurso</Text>
      </Pressable>
      <View style={styles.carouselTags}>
        {item.etiquetas?.split(",").map((tag, idx) => {
          const found = etiquetasDisponibles.find(e => e.tag === tag.trim());
          return (
            <Text
              key={idx}
              style={[
                styles.carouselTag,
                { backgroundColor: found ? found.color : "#ECECEC" }
              ]}
            >
              #{tag.trim()}
            </Text>
          );
        })}
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.replace("/home")} style={styles.backButton}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Comunidad</Text>
        <View style={{ width: 38 }} />
      </View>

      {/* Subtítulo */}
      <Text style={styles.subtitle}>
        Comparte y descubre recursos útiles de la comunidad.
      </Text>

      {/* Filtro */}
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={filtroEtiqueta}
          onValueChange={setFiltroEtiqueta}
          style={styles.picker}
          dropdownIconColor="#7c3aed"
        >
          <Picker.Item label="Todas las etiquetas" value="" />
          {etiquetasDisponibles.map(({ tag }) => (
            <Picker.Item key={tag} label={`#${tag}`} value={tag} />
          ))}
        </Picker>
      </View>

      {/* Lista de recursos */}
      <FlatList
        data={recursosFiltrados}
        keyExtractor={(_, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No hay recursos aún.</Text>
        }
        ListHeaderComponent={
          <FlatList
            data={recursosProgramacion}
            keyExtractor={(_, idx) => "prog" + idx}
            renderItem={renderCarouselItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.carouselContainer}
            style={{ marginBottom: 8 }}
          />
        }
      />

      {/* Botón flotante */}
      <Pressable style={styles.fab} onPress={abrirModal}>
        <Text style={styles.fabText}>+</Text>
      </Pressable>

      {/* Modal para agregar */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <Animated.View style={[styles.modalContent, { transform: [{ scale: modalScale }] }]}>
            <Text style={styles.modalTitle}>Nuevo recurso</Text>
            <TextInput
              style={styles.input}
              placeholder="Título"
              value={titulo}
              onChangeText={setTitulo}
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={styles.input}
              placeholder="Enlace (https://...)"
              value={link}
              onChangeText={setLink}
              autoCapitalize="none"
              autoCorrect={false}
              placeholderTextColor="#aaa"
            />
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Descripción (opcional)"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              placeholderTextColor="#aaa"
            />

            {/* Etiquetas disponibles */}
            <View style={styles.tagsContainer}>
              {etiquetasDisponibles.map(({ tag, color }) => (
                <Pressable
                  key={tag}
                  onPress={() =>
                    setEtiquetas(prev =>
                      prev.includes(tag)
                        ? prev.split(",").filter(t => t !== tag).join(",")
                        : prev
                        ? prev + "," + tag
                        : tag
                    )
                  }
                  style={[
                    styles.tag,
                    {
                      backgroundColor: etiquetas.includes(tag) ? color : "#ECECEC",
                      borderWidth: etiquetas.includes(tag) ? 0 : 1,
                      borderColor: "#E0E0E0"
                    }
                  ]}
                >
                  <Text style={{ color: "#222", fontWeight: etiquetas.includes(tag) ? "bold" : "normal" }}>
                    #{tag}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable
              style={styles.submitButton}
              onPress={handleEnviar}
            >
              <Text style={styles.submitText}>Publicar recurso</Text>
            </Pressable>

            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.cancelText}>Cancelar</Text>
            </Pressable>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

// Estilos minimalistas y modernos
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f6f7fb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f3f0ff",
    shadowColor: "#000",
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 2,
  },
  backButton: { padding: 8 },
  backText: { color: "#222", fontSize: 24, fontWeight: "bold" },
  title: {
    flex: 1,
    textAlign: "center",
    color: "#222",
    fontWeight: "bold",
    fontSize: 24,
    letterSpacing: 0.5,
  },
  subtitle: {
    textAlign: "center",
    color: "#888",
    fontSize: 17,
    marginVertical: 14,
    fontWeight: "500",
    marginHorizontal: 18,
  },
  pickerContainer: {
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  picker: {
    backgroundColor: "#f3f0ff",
    borderRadius: 12,
    fontSize: 16,
  },
  listContent: { paddingHorizontal: 12, paddingBottom: 100 },
  emptyText: {
    textAlign: "center",
    color: "#bbb",
    marginTop: 40,
    fontSize: 16,
  },
  card: {
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 18,
    borderRadius: 22,
    marginBottom: 18,
    shadowColor: "#222",
    shadowOpacity: 0.09,
    shadowRadius: 18,
    elevation: 4,
    borderWidth: 0.5,
    borderColor: "#eaeaea",
    backdropFilter: "blur(8px)", // solo web, pero da idea de glass
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  cardUser: {
    fontWeight: "bold",
    color: "#888",
    fontSize: 14,
    opacity: 0.9,
  },
  cardDate: { color: "#bbb", fontSize: 12 },
  cardTitle: {
    fontWeight: "bold",
    fontSize: 19,
    marginBottom: 6,
    color: "#222",
    letterSpacing: 0.1,
  },
  cardDesc: { color: "#444", fontSize: 15, marginBottom: 4, opacity: 0.95 },
  cardTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
    marginBottom: 2,
  },
  cardTag: {
    marginRight: 8,
    fontSize: 13,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 2,
    fontWeight: "bold",
    opacity: 0.92,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  cardLinkBtn: {
    marginTop: 12,
    backgroundColor: "#f3f0ff",
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ececec",
  },
  cardLinkBtnText: {
    color: "#222",
    fontWeight: "bold",
    fontSize: 15,
    letterSpacing: 0.2,
  },
  fab: {
    position: "absolute",
    bottom: 28,
    right: 28,
    backgroundColor: "#fff",
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    elevation: 6,
    shadowColor: "#222",
    shadowOpacity: 0.13,
    shadowRadius: 12,
    borderWidth: 1,
    borderColor: "#ececec",
  },
  fabText: {
    color: "#222",
    fontSize: 36,
    fontWeight: "bold",
    marginTop: -2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.13)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    width: "90%",
    padding: 24,
    borderRadius: 22,
    elevation: 8,
    shadowColor: "#222",
    shadowOpacity: 0.09,
    shadowRadius: 18,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#222",
    marginBottom: 18,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#f3f0ff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 16,
    fontSize: 17,
    color: "#222",
    borderWidth: 1,
    borderColor: "#ececec",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 16,
    justifyContent: "center",
  },
  tag: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    borderWidth: 0.5,
    borderColor: "#e0e0e0",
  },
  submitButton: {
    backgroundColor: "#f3f0ff",
    padding: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ececec",
  },
  submitText: { color: "#222", fontWeight: "bold", fontSize: 17 },
  cancelText: { color: "#bbb", textAlign: "center", marginTop: 10, fontSize: 16 },
  carouselContainer: {
    paddingLeft: 12,
    paddingVertical: 12,
    marginBottom: 10,
  },
  carouselCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    marginRight: 18,
    width: 320,
    minHeight: 210, // Aumenta la altura mínima
    shadowColor: "#222",
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 0.5,
    borderColor: "#ececec",
    justifyContent: "flex-start",
    alignItems: "flex-start",
  },
  carouselHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    width: "100%",
  },
  avatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "#f3f0ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    color: "#7c3aed",
    fontWeight: "bold",
    fontSize: 18,
  },
  carouselUser: {
    fontWeight: "bold",
    color: "#888",
    fontSize: 14,
    opacity: 0.9,
  },
  carouselDate: {
    color: "#bbb",
    fontSize: 12,
    marginTop: -2,
  },
  carouselTitle: {
    fontWeight: "bold",
    fontSize: 18,
    color: "#222",
    marginBottom: 4,
    marginTop: 2,
    width: "100%",
  },
  carouselDesc: {
    color: "#444",
    fontSize: 15,
    marginBottom: 10,
    opacity: 0.95,
    width: "100%",
  },
  carouselBtn: {
    backgroundColor: "#3AB0FF",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 18,
    alignItems: "center",
    alignSelf: "flex-start",
    marginBottom: 8,
  },
  carouselBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
  },
  carouselTags: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 2,
  },
  carouselTag: {
    marginRight: 8,
    fontSize: 13,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 2,
    color: "#222",
    fontWeight: "bold",
    opacity: 0.92,
  },
});
