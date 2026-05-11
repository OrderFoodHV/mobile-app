import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import colors from '@assets/colors/global_colors';

type CheckBoxCustomProps = {
  checked?: boolean;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
};

const CheckBoxCustom: React.FC<CheckBoxCustomProps> = ({ checked = false, onPress, containerStyle }) => {
  return (
    <Pressable onPress={onPress} style={[styles.container, containerStyle]}>
      <View style={[styles.box, checked && styles.boxChecked]}>
        {checked ? <Ionicons name="checkmark" size={14} color="#fff" /> : null}
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  box: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#C7CDD4',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  boxChecked: {
    backgroundColor: colors.blue_primary,
    borderColor: colors.blue_primary,
  },
});

export default CheckBoxCustom;
