import React from 'react';
import {ActivityIndicator, View} from 'react-native';
interface LoadingBaseProps {
  size?: 'large' | 'small';
}

const LoadingBase: React.FC<LoadingBaseProps> = ({size}) => {
  return (
    <View style={{flex: 1, justifyContent: 'center', alignItems: 'center'}}>
      <ActivityIndicator size={size} color="#0000ff" />
    </View>
  );
};
export default LoadingBase;
