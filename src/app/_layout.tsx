import { View } from 'react-native'
import React from 'react'
import { Slot, usePathname } from 'expo-router'
import Toast from "react-native-toast-message";
import '../../global.css'
import { AuthProvider } from '@/context/authContext';

const _layout = () => {

  const pathName = usePathname();
  console.log("Current Path:", pathName);

  return (
    <AuthProvider>
      <View style={{ flex: 1 }}>
        <Slot /> 
        <Toast />  
      </View>
    </AuthProvider>
  )
}

export default _layout