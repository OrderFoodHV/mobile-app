import React from "react";
import { useNavigationServices } from "@app-helper/navigateToScreens";
import colors from "@assets/colors/global_colors";
import sizes from "@assets/styles/sizes";
import styles_c from "@assets/styles/styles_c";
import { Ionicons } from '@expo/vector-icons';
import { StyleProp, Text, TouchableOpacity, View, ViewProps, ViewStyle } from "react-native";

interface HeaderCustomProps {
  title: any
  rightIcon?: React.ReactNode
  isShowLeftButton?: boolean
  containerStyle?: StyleProp<ViewStyle>
  onPressLeft?: any
}
const HeaderCustom: React.FC<HeaderCustomProps> = ({ title, rightIcon, onPressLeft, isShowLeftButton = true, containerStyle }) => {
  const { goToBack } = useNavigationServices()
  return (
    <View style={[{ 
      height: 56, 
      flexDirection: 'row', 
      alignItems: 'center', 
      justifyContent: 'center', 
      position: 'relative',
      backgroundColor: colors.blue_primary,
      paddingHorizontal: 16,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    }, containerStyle]}>
      {isShowLeftButton && (
        <TouchableOpacity 
          onPress={onPressLeft ? onPressLeft : goToBack} 
          style={{ position: 'absolute', left: 16, padding: 4, zIndex: 10 }}
        >
          <Ionicons name="arrow-back-outline" size={24} color="#FFF" />
        </TouchableOpacity>
      )}
      
      <Text style={{ 
        fontSize: 18, 
        fontWeight: '700', 
        color: '#FFF',
        textAlign: 'center'
      }}>{title}</Text>

      {rightIcon && (
        <View style={{ position: 'absolute', right: 16, zIndex: 10 }}>
          {rightIcon}
        </View>
      )}
    </View>
  )
}
export default HeaderCustom