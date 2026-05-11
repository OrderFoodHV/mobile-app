import React, { ReactNode, memo, useState } from "react";
import { TouchableOpacity, View, StyleSheet, Text } from "react-native"


interface SwitchCustomProps {
  widthOuter: number
  heightOuter: number
  widthInner: number
  heightInner: number
  isOnColor?: string
  isOffColor?: string
}

const SwitchCustom: React.FC<SwitchCustomProps> = (
  {
    widthOuter,
    heightOuter,
    widthInner,
    heightInner,
    isOnColor = '#75B8F5',
    isOffColor = 'gray'
  }) => {

  const [isOn, setIsOn] = useState(false)

  const toggleSwitch = () => {
    setIsOn(!isOn)
  }
  return (
    <View>
      <TouchableOpacity
        activeOpacity={1}
        onPress={toggleSwitch}
        style={[
          styles.outter,
          {
            width: widthOuter,
            height: heightOuter
          },
          isOn
            ? { justifyContent: 'flex-end', backgroundColor: isOnColor }
            : { justifyContent: 'flex-start', backgroundColor: isOffColor }
        ]} >
        <View
          style={[
            styles.inner,
            {
              width: widthInner,
              height: heightInner
            }
          ]}
        />
      </TouchableOpacity>
    </View>
  )
}
const styles = StyleSheet.create({
  outter: {
    backgroundColor: 'gray',
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 2
  },
  inner: {
    backgroundColor: 'white',
    borderRadius: 15,
    elevation: 8,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 2
  }
});
export default memo(SwitchCustom)