import React, { ReactNode } from 'react';
import { StyleProp, View, ViewStyle } from 'react-native';

interface GradientComponentProps {
  children?: ReactNode;
  colors?: string[];
  style?: StyleProp<ViewStyle>;
}

const GradientComponent: React.FC<GradientComponentProps> = ({ children, colors = ['#EA7E79', '#F8B97C'], style }) => {
  return <View style={[{ backgroundColor: colors[0] }, style]}>{children}</View>;
};

export default GradientComponent;
