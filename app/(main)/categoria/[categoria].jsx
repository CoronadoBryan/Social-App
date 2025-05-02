import React, { useState, useEffect } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView, TextInput, ActivityIndicator, Linking } from 'react-native'
import Icon from '../../../assets/icons'
import { fetchResources } from '../../../utils/fetchResources'
import { useLocalSearchParams } from 'expo-router'
import { useRouter } from 'expo-router'
import HomeHeader from '../../../components/HomeHeader';
import ScreenWrapper from '../../../components/ScreenWrapper'
import { useAuth } from '../../../contexts/AuthContext';


const { width } = Dimensions.get('window')
const CARD_SIZE = width / 2.25

const CategoriaScreen = () => {
  const { categoria } = useLocalSearchParams();
  const { user } = useAuth(); // <--- agrega esto
  const [resources, setResources] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalImage, setModalImage] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    setLoading(true)
    fetchResources().then(all => {
      const filtered = all.filter(r => r.tags?.includes(categoria))
      setResources(filtered)
      setLoading(false)
    })
  }, [categoria])

  // Filtrado por coincidencia de título
  const filteredResources = resources.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase())
  )

  const openImageModal = (imgUrl, desc) => {
    setModalImage({ url: imgUrl, desc })
    setModalVisible(true)
  }

  return (
    <ScreenWrapper bg="white">
      <View style={styles.container}>
    
      <HomeHeader
        user={user}
        router={router}
        title={categoria}
        subtitle={`Recursos de la categoría "${categoria}"`}
        showBack
      />
        {/* Botón regresar visual */}
        <View style={{ marginTop: 10, marginBottom: 2 }}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            alignSelf: 'flex-start',
            paddingVertical: 6,
            paddingHorizontal: 12,
            borderRadius: 20,
            backgroundColor: '#f2f2f2',
            marginLeft: 2,
            marginBottom: 6,
          }}
          activeOpacity={0.7}
        >
          <Icon name="arrowLeft" size={20} color="#27ae60" style={{ marginRight: 6 }} />
          <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 15 }}>Regresar</Text>
        </TouchableOpacity>
      </View>

        <View style={styles.searchBox}>
          <Icon name="search" size={18} color="#aaa" style={styles.searchIcon} />
          <TextInput
            style={styles.search}
            placeholder="Buscar recurso por título..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor="#aaa"
          />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#27ae60" style={{ marginTop: 40 }} />
        ) : filteredResources.length === 0 ? (
          <View style={styles.emptyBox}>
            <Icon name="search" size={48} color="#bbb" />
            <Text style={styles.emptyText}>No se encontraron recursos</Text>
          </View>
        ) : (
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.grid}>
              {filteredResources.map(resource => (
                <TouchableOpacity
                  key={resource._id}
                  style={styles.card}
                  onPress={() => openImageModal(resource.coverImageUrl, resource.description)}
                  activeOpacity={0.85}
                >
                  <Image
                    source={
                      resource.coverImageUrl
                        ? { uri: resource.coverImageUrl }
                        : require('../../../assets/images/icono.png')
                    }
                    style={styles.cardImg}
                  />
                  <Text style={styles.cardText} numberOfLines={2}>{resource.title}</Text>
                  {resource.fileUrl && (
                    <TouchableOpacity
                      style={styles.downloadBtn}
                      onPress={() => Linking.openURL(resource.fileUrl)}
                      activeOpacity={0.85}
                    >
                      <Icon name="share" size={18} color="#fff" style={{ marginRight: 6 }} />
                      <Text style={styles.downloadBtnText}>Descargar</Text>
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        )}

        {/* Modal para imagen y descripción */}
        <Modal
          visible={modalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalBg}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setModalVisible(false)}
            >
              <Icon name="plus" size={32} color="#fff" />
            </TouchableOpacity>
            <View style={styles.modalContent}>
              <ScrollView
                style={{ maxHeight: width * 1, width: width * 0.9 }}
                contentContainerStyle={{ alignItems: 'center', padding: 18 }}
                showsVerticalScrollIndicator={true}
              >
                <Image
                  source={modalImage?.url ? { uri: modalImage.url } : require('../../../assets/images/icono.png')}
                  style={styles.modalImg}
                />
                {modalImage?.desc ? (
                  <View style={styles.descBox}>
                    <Text style={styles.descTitle}>Descripción</Text>
                    <Text style={styles.descText} selectable>{modalImage.desc}</Text>
                  </View>
                ) : null}
              </ScrollView>
            </View>
          </View>
        </Modal>
      </View>
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    paddingHorizontal: 3, // Agrega aire a los costados
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  backBtn: { marginRight: 8, padding: 4 },
  title: { fontSize: 22, fontWeight: 'bold', color: '#27ae60', flex: 1 },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f2f2',
    borderRadius: 10,
    paddingHorizontal: 14,
    marginBottom: 18,
    marginTop: 4,
  },
  searchIcon: { width: 18, height: 18, marginRight: 8, tintColor: '#aaa' },
  search: {
    flex: 1,
    fontSize: 15,
    color: '#222',
    paddingVertical: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center', // Centra las cards
    marginBottom: 18,
    gap: 12, // Espacio entre cards (si tu versión de RN lo soporta)
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: CARD_SIZE,
    marginBottom: 18,
    marginHorizontal: 6, // Aire lateral entre cards
    alignItems: 'center',
    padding: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 }
  },
  cardImg: {
    width: CARD_SIZE - 32,
    height: CARD_SIZE - 32,
    borderRadius: 14,
    marginBottom: 10,
    backgroundColor: '#eaeaea',
    resizeMode: 'cover'
  },
  cardText: {
    color: '#222',
    fontWeight: 'bold',
    fontSize: 15,
    textAlign: 'center',
    marginBottom: 6,
  },
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 2 },
  tag: {
    backgroundColor: '#e0e7ef',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginRight: 6,
    marginBottom: 2
  },
  tagText: { color: '#27ae60', fontSize: 12, fontWeight: '500' },
  emptyBox: { alignItems: 'center', marginTop: 60 },
  emptyText: { color: '#aaa', fontSize: 16, marginTop: 10 },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.92)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  closeBtn: {
    position: 'absolute',
    top: 40,
    right: 30,
    zIndex: 2
  },
  modalContent: {
    backgroundColor: 'rgba(30,30,30,0.98)',
    borderRadius: 18,
    padding: 0,
    maxWidth: width * 0.95,
    maxHeight: width * 1.1,
    alignItems: 'center',
    overflow: 'hidden'
  },
  modalImg: {
    width: width * 0.8,
    height: width * 0.6,
    borderRadius: 14,
    resizeMode: 'contain',
    marginBottom: 18,
    backgroundColor: '#222'
  },
  descBox: {
    backgroundColor: 'rgba(255,255,255,0.07)',
    borderRadius: 10,
    padding: 14,
    width: '100%',
    marginBottom: 8
  },
  descTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'left'
  },
  descText: {
    color: '#eaeaea',
    fontSize: 15,
    textAlign: 'left'
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#27ae60',
    borderRadius: 16,
    paddingVertical: 6,
    paddingHorizontal: 16,
    marginTop: 6,
    alignSelf: 'center',
  },
  downloadBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    letterSpacing: 0.2,
  },
})

export default CategoriaScreen