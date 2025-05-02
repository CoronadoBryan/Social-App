import React, { useEffect, useState } from 'react'
import { View, Text, Image, Button, Linking, ScrollView } from 'react-native'
import { fetchResources } from '../utils/fetchResources'

const Recursos = () => {
  const [resources, setResources] = useState([])

  useEffect(() => {
    console.log('Probando fetchResources...')
    fetchResources().then(data => {
      console.log('Respuesta de fetchResources:', data)
      setResources(data) // <-- ¡Agrega esta línea!
    })
  }, [])

  useEffect(() => {
    console.log('Estado de resources actualizado:', resources)
  }, [resources])

  return (
    <ScrollView>
      {resources.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 40 }}>No hay recursos disponibles.</Text>
      ) : (
        resources.map(resource => (
          <View key={resource._id} style={{ margin: 16 }}>
            <Text style={{ fontWeight: 'bold', fontSize: 18 }}>{resource.title}</Text>
            <Text>{resource.description}</Text>
            {resource.coverImageUrl && (
              <Image
                source={{ uri: resource.coverImageUrl }}
                style={{ width: 200, height: 120, marginVertical: 8 }}
                resizeMode="cover"
              />
            )}
            {resource.fileUrl && (
              <Button title="Descargar archivo" onPress={() => Linking.openURL(resource.fileUrl)} />
            )}
            <Text style={{ color: '#888' }}>Etiquetas: {resource.tags?.join(', ')}</Text>
          </View>
        ))
      )}
    </ScrollView>
  )
}

export default Recursos