import React, { useState, useEffect, useRef } from 'react'
import { View, Text, Image, StyleSheet, TouchableOpacity, Dimensions, Modal, ScrollView, TextInput, ActivityIndicator, Linking, FlatList, Animated } from 'react-native'
import Icon from '../../../assets/icons'
import { fetchResources } from '../../../utils/fetchResources'
import { useLocalSearchParams } from 'expo-router'
import { useRouter } from 'expo-router'
import HomeHeader from '../../../components/HomeHeader'
import ScreenWrapper from '../../../components/ScreenWrapper'
import { useAuth } from '../../../contexts/AuthContext'
import CatPoints from '../../../components/CatPoints'
import { canDownloadResource, getUserData, getDailyDownloadLimit } from '../../../services/userService'

const { width } = Dimensions.get('window')
const CARD_SIZE = width / 2.25

const CategoriaScreen = () => {
  const { categoria } = useLocalSearchParams()
  const { user, setAuth } = useAuth()
  const [resources, setResources] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [modalImage, setModalImage] = useState(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [attrModal, setAttrModal] = useState({ visible: false, attributes: [], title: '' })
  const [confirmModal, setConfirmModal] = useState({ visible: false, url: null })
  const router = useRouter()
  const [descargasHoy, setDescargasHoy] = useState(user?.downloads_today || 0)
  const [limit, setLimit] = useState(undefined) // <--- NUEVO

  // Animación para el header
  const headerAnim = useRef(new Animated.Value(1)).current

  useEffect(() => {
    setDescargasHoy(user?.downloads_today || 0)
  }, [user?.downloads_today])

  useEffect(() => {
    setLoading(true)
    fetchResources().then(all => {
      const filtered = all.filter(r => r.tags?.includes(categoria))
      setResources(filtered)
      setLoading(false)
    })
  }, [categoria])

  useEffect(() => {
    getDailyDownloadLimit().then(setLimit)
  }, [])

  // Animar el header cuando cambia headerVisible
  useEffect(() => {
    Animated.timing(headerAnim, {
      toValue: headerVisible ? 1 : 0,
      duration: 350,
      useNativeDriver: true,
    }).start()
  }, [headerVisible])

  const filteredResources = resources.filter(r =>
    r.title?.toLowerCase().includes(search.toLowerCase()) ||
    r.description?.toLowerCase().includes(search.toLowerCase()) ||
    r.tags?.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
  )

  const openImageModal = (imgUrl, desc) => {
    setModalImage({ url: imgUrl, desc })
    setModalVisible(true)
  }

  // Nueva lógica: mostrar modal de confirmación antes de descargar
  const handleDownload = (fileUrl) => {
    setConfirmModal({ visible: true, url: fileUrl })
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

        <Animated.View
          style={{
            opacity: headerAnim,
            transform: [
              {
                translateY: headerAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-30, 0],
                }),
              },
            ],
          }}
        >
          {headerVisible && (
            <>
              {user && !user.is_premium && (
                <CatPoints descargasHoy={descargasHoy} />
              )}
              <View style={{ marginTop: 10, marginBottom: 6, alignItems: 'center', paddingHorizontal: 8 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                    color: '#27ae60',
                    textAlign: 'center',
                    marginBottom: 2,
                  }}
                  numberOfLines={2}
                  ellipsizeMode="tail"
                >
                  {categoria}
                </Text>
                <Text
                  style={{
                    color: '#888',
                    fontSize: 13,
                    fontWeight: '600',
                    textAlign: 'center',
                    marginBottom: 0,
                  }}
                >
                  {filteredResources.length} recurso{filteredResources.length === 1 ? '' : 's'}
                </Text>
              </View>
            </>
          )}
        </Animated.View>

        <TouchableOpacity
          onPress={() => setHeaderVisible(v => !v)}
          style={{
            alignSelf: 'center',
            marginBottom: headerVisible ? 0 : 10,
            marginTop: 2,
            padding: 6,
            borderRadius: 20,
            backgroundColor: '#f2f2f2'
          }}
        >
          <Icon
            name={headerVisible ? 'arriba' : 'abajo'}
            size={22}
            color="#27ae60"
          />
        </TouchableOpacity>

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
          <FlatList
            data={filteredResources}
            keyExtractor={resource => resource._id}
            numColumns={2}
            contentContainerStyle={styles.grid}
            showsVerticalScrollIndicator={false}
            renderItem={({ item: resource }) => (
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
                {resource.fileUrl && limit !== undefined && (
                  <TouchableOpacity
                    style={[
                      styles.downloadBtn,
                      (user && user.downloads_today >= limit && !user.is_premium) && { backgroundColor: '#ccc' }
                    ]}
                    onPress={() => {
                      if (user && user.downloads_today >= limit && !user.is_premium) {
                        alert(`Ya terminaste tus ${limit} descargas diarias`);
                        return;
                      }
                      handleDownload(resource.fileUrl)
                    }}
                    activeOpacity={0.85}
                    disabled={user && user.downloads_today >= limit && !user.is_premium}
                  >
                    <Icon name="share" size={18} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.downloadBtnText}>
                      {user && user.downloads_today >= limit && !user.is_premium ? 'Límite diario' : 'Descargar'}
                    </Text>
                  </TouchableOpacity>
                )}
                {resource.attributes && resource.attributes.length > 0 && (
                  <TouchableOpacity
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginTop: 8,
                      backgroundColor: '#f2f2f2',
                      borderRadius: 20,
                      paddingVertical: 8,
                      paddingHorizontal: 16,
                      alignSelf: 'center'
                    }}
                    onPress={() => setAttrModal({ visible: true, attributes: resource.attributes, title: resource.title })}
                    activeOpacity={0.85}
                  >
                    <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 15 }}>Ver info</Text>
                  </TouchableOpacity>
                )}
              </TouchableOpacity>
            )}
          />
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

        {/* Modal de atributos técnicos */}
        <Modal
          visible={attrModal.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setAttrModal({ visible: false, attributes: [], title: '' })}
        >
          <View style={styles.modalBg}>
            <View style={[styles.modalContent, { padding: 24, minWidth: 280, maxWidth: 340 }]}>
              <Text style={{ fontWeight: 'bold', fontSize: 17, color: '#27ae60', marginBottom: 12 }}>
                {attrModal.title}
              </Text>
              {attrModal.attributes
                .sort((a, b) => a.key.localeCompare(b.key))
                .map(attr => (
                  <View key={attr._key || attr.key} style={{ flexDirection: 'row', marginBottom: 6 }}>
                    <Text style={{ color: '#3b5998', fontWeight: 'bold', fontSize: 14, marginRight: 6 }}>
                      {attr.key}:
                    </Text>
                    <Text style={{ color: '#444', fontSize: 14, flexShrink: 1 }}>
                      {attr.value}
                    </Text>
                  </View>
                ))}
              <TouchableOpacity
                style={{
                  marginTop: 18,
                  alignSelf: 'center',
                  backgroundColor: '#27ae60',
                  borderRadius: 12,
                  paddingVertical: 8,
                  paddingHorizontal: 28
                }}
                onPress={() => setAttrModal({ visible: false, attributes: [], title: '' })}
                activeOpacity={0.8}
              >
                <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 15 }}>Cerrar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Modal de confirmación de descarga */}
        <Modal
          visible={confirmModal.visible}
          transparent
          animationType="fade"
          onRequestClose={() => setConfirmModal({ visible: false, url: null })}
        >
          <View style={styles.modalBg}>
            <View style={[styles.modalContent, { backgroundColor: '#fff', padding: 28, maxWidth: 320 }]}>
              <Icon name="share" size={38} color="#27ae60" style={{ marginBottom: 12 }} />
              <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#27ae60', marginBottom: 8 }}>
                ¿Descargar recurso?
              </Text>
              <Text style={{ color: '#444', fontSize: 15, textAlign: 'center', marginBottom: 18 }}>
                ¿Quieres descargar este recurso ahora?
                {"\n"}
                <Text style={{ color: '#e67e22', fontWeight: 'bold' }}>
                  Al presionar "Descargar", se contará como una descarga, asi sea por accidente.
                </Text>
              </Text>
              <View style={{ flexDirection: 'row', gap: 18 }}>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#27ae60',
                    borderRadius: 14,
                    paddingVertical: 8,
                    paddingHorizontal: 24,
                    marginRight: 8
                  }}
                  onPress={async () => {
                    setConfirmModal({ visible: false, url: null });
                    const result = await canDownloadResource(user.id);
                    if (!result.allowed) {
                      alert(result.msg);
                      return;
                    }
                    if (confirmModal.url) {
                      Linking.openURL(confirmModal.url);
                      const { data } = await getUserData(user.id);
                      setAuth(data);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#fff', fontWeight: 'bold', fontSize: 16 }}>Descargar</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    backgroundColor: '#f2f2f2',
                    borderRadius: 14,
                    paddingVertical: 8,
                    paddingHorizontal: 24,
                  }}
                  onPress={() => setConfirmModal({ visible: false, url: null })}
                  activeOpacity={0.8}
                >
                  <Text style={{ color: '#27ae60', fontWeight: 'bold', fontSize: 16 }}>Cancelar</Text>
                </TouchableOpacity>
              </View>
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
    paddingHorizontal: 3,
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
    justifyContent: 'center',
    marginBottom: 18,
    gap: 12,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: CARD_SIZE,
    marginBottom: 18,
    marginHorizontal: 6,
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