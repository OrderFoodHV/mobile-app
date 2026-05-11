import styles_c from '@assets/styles/styles_c';
import { Text} from 'react-native';
import {
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

interface ButtonBasePorps {
  onPress?: () => void;
  title?: string;
  backgroundColor?: string;
  color?: string;
  fontSize?: number;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  fontWeight?: any,
  borderRadiusView?: any
  borderColorView?: any
  borderWidthView?: any
  paddingHorizontal?: number
  paddingVertical?: number
}

const ButtonBase: React.FC<ButtonBasePorps> = ({
  onPress,
  title,
  backgroundColor = '#1890FF',
  color = '#FFFFFF',
  fontSize = 12,
  style,
  disabled,
  fontWeight = '700',
  borderRadiusView = 5,
  borderColorView = 'black',
  borderWidthView = 0,
  paddingHorizontal = 10,
  paddingVertical = 5
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[{ width: '100%' }, style]}
      disabled={disabled}>
      <View
        style={{
          backgroundColor: backgroundColor,
          paddingHorizontal: paddingHorizontal,
          paddingVertical: paddingVertical,
          borderRadius: borderRadiusView,
          borderWidth: borderWidthView,
          borderColor: borderColorView,
          width: '100%',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Text style={{ fontSize: fontSize, fontWeight: fontWeight, color: color }}>
          {title}
        </Text>
      </View>
    </TouchableOpacity>
  );
};
export default ButtonBase;

const styles = StyleSheet.create({
  addToBoard: {
    ...styles_c.row_center,
    paddingVertical: 10,
    backgroundColor: '#D93842',
    borderRadius: 8,
    position: 'absolute',
    bottom: 0,
    width: '100%',
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    marginHorizontal: 5,
    borderRadius: 4,
    backgroundColor: '#FFF',
    paddingHorizontal: 10,
  },
  header: {
    ...styles_c.row_between,
    top: 0,
    paddingHorizontal: 10,
    zIndex: 999,
    height: 45,
    width: '100%',
    paddingVertical: 5,
  },
});
