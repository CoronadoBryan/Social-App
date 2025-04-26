import React from "react";
import { View, Text, Pressable, StyleSheet, Modal, TouchableWithoutFeedback, Linking } from "react-native";
import Icon from "../assets/icons";

const MenuModal = ({ visible, onClose, onAction }) => (

    
  <Modal
    visible={visible}
    transparent
    animationType="fade"
    onRequestClose={onClose}
  >
    <TouchableWithoutFeedback onPress={onClose}>
      <View style={styles.overlay}>
        {/* X centrada arriba */}
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeText}>×</Text>
        </Pressable>
        <TouchableWithoutFeedback>
          <View style={styles.menuModal}>
            {/* Opciones del menú */}
            <View style={styles.menuRow}>
              <Pressable style={[styles.menuBox, { backgroundColor: "#ffe066" }]} onPress={() => onAction("explorar")}>
                <Icon name="explorar" size={32} color="#222" />
                <Text style={styles.menuLabel}>Explorar</Text>
              </Pressable>
              <Pressable style={[styles.menuBox, { backgroundColor: "#fff" }]} onPress={() => onAction("perfil")}>
                <Icon name="github" size={32} color="#222" />
                <Text style={styles.menuLabel}>Colaborar</Text>
              </Pressable>
            </View>
            <View style={styles.menuRow}>
              <Pressable style={[styles.menuBox, { backgroundColor: "#ff8787" }]} onPress={() => onAction("agregar")}>
                <Icon name="share" size={32} color="#222" />
                <Text style={styles.menuLabel}>Compartir</Text>
              </Pressable>
              <Pressable style={[styles.menuBox, { backgroundColor: "#b2f2bb" }]} onPress={() => onAction("favoritos")}>
                <Icon name="donarYape" size={32} color="#222" />
                <Text style={styles.menuLabel}>Donar</Text>
              </Pressable>
            </View>
            {/* <View style={styles.menuRow}>
              <Pressable style={[styles.menuBox, { backgroundColor: "#a5d8ff" }]} onPress={() => onAction("colaboradores")}>
                <Icon name="user" size={32} color="#222" />
                <Text style={styles.menuLabel}>Colaboradores</Text>
              </Pressable>
              <Pressable style={[styles.menuBox, { backgroundColor: "#ffd6a5" }]} onPress={() => onAction("informacion")}>
                <Icon name="user" size={32} color="#222" />
                <Text style={styles.menuLabel}>Información</Text>
              </Pressable>
            </View>
            <View style={styles.menuRow}>
              <Pressable style={[styles.menuBox, { backgroundColor: "#e0aaff" }]} onPress={() => onAction("comunidad")}>
                <Icon name="comunidad" size={32} color="#222" />
                <Text style={styles.menuLabel}>Comunidad</Text>
              </Pressable>
              <Pressable style={[styles.menuBox, { backgroundColor: "#fff" }]} onPress={() => onAction("recientes")}>
                <Icon name="search" size={32} color="#222" />
                <Text style={styles.menuLabel}>Recientes</Text>
              </Pressable>
            </View> */}
          </View>
        </TouchableWithoutFeedback>
      </View>
    </TouchableWithoutFeedback>
  </Modal>
);

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.73)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    position: "absolute",
    top: 140,
    alignSelf: "center",
    zIndex: 20,
    backgroundColor: "#fff",
    borderRadius: 70,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    elevation: 4,
  },
  closeText: {
    fontSize: 28,
    color: "#222",
    fontWeight: "bold",
    lineHeight: 28,
  },
  menuModal: {
    backgroundColor: "#222",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    minWidth: 320,
    marginTop: 40,
  },
  menuRow: {
    flexDirection: "row",
    marginBottom: 12,
    marginTop: 0,
  },
  menuBox: {
    width: 110,
    height: 90,
    borderRadius: 18,
    marginHorizontal: 8,
    justifyContent: "center",
    alignItems: "center",
    elevation: 2,
  },
  menuLabel: {
    marginTop: 8,
    color: "#222",
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
  },
});

export default MenuModal;