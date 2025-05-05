import React, { useEffect, useState } from 'react';
import { View, Text, Image } from 'react-native';
import { getDailyDownloadLimit } from '../services/userService';

const CatPoints = ({ descargasHoy = 0 }) => {
  const [limit, setLimit] = useState(undefined);

  useEffect(() => {
    getDailyDownloadLimit().then(setLimit);
  }, []);

  console.log('CatPoints render:', { descargasHoy, limit });

  if (limit === undefined) return null; // o puedes mostrar un loader

  return (
    <View style={{ width: '100%', alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
      <View style={{
        backgroundColor: '#e0f7e9',
        borderRadius: 14,
        paddingHorizontal: 18,
        paddingVertical: 8,
        minWidth: 160,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
      }}>
        <Image
          source={require('../assets/icons/CatPoint.png')}
          style={{ width: 70, height: 70, marginRight: 4 }}
          resizeMode="contain"
        />
        <Text style={{
          color: '#27ae60',
          fontWeight: 'bold',
          fontSize: 18,
          textAlign: 'center',
          letterSpacing: 0.5,
        }}>
          CatPoints: {limit - descargasHoy}
        </Text>
        <Text style={{
          color: '#27ae60',
          fontSize: 13,
          marginLeft: 6,
          fontWeight: '600'
        }}>
          /{limit}
        </Text>
      </View>
      <Text style={{
        color: '#888',
        fontSize: 13,
        textAlign: 'center',
        marginTop: 2,
        fontWeight: '400'
      }}>
        ¡Usa tus CatPoints para descargar!
      </Text>
    </View>
  );
};

export default CatPoints;