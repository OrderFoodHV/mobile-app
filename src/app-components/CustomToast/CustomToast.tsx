import React, {useState, useEffect, FC} from 'react';
import {Modal, View, Text, StyleSheet, Animated} from 'react-native';

export interface CustomToastPros {
  isVisible: boolean;
  message: string;
}
const CustomToast: FC<CustomToastPros> = ({isVisible, message}) => {
  const [fadeAnim] = useState(new Animated.Value(0)); // ban đầu opacity là 0

  useEffect(() => {
    // Animation cho toast xuất hiện và biến mất
    if (isVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1, // từ trong suốt đến không trong suốt
        duration: 500, // thời gian chuyển đổi
        useNativeDriver: true, // sử dụng native driver cho hiệu suất tốt hơn
      }).start(() => {
        // Sau khi xuất hiện, chờ một khoảng thời gian rồi biến mất
        setTimeout(() => {
          Animated.timing(fadeAnim, {
            toValue: 0, // từ không trong suốt trở lại trong suốt
            duration: 500,
            useNativeDriver: true,
          }).start();
        }, 2000); // toast sẽ hiển thị trong 2 giây
      });
    }
  }, [isVisible, fadeAnim]);

  return (
    <Animated.View
      style={[
        styles.toast,
        {
          opacity: fadeAnim, // Áp dụng animated opacity
        },
      ]}>
      <Text style={styles.text}>{message}</Text>
    </Animated.View>
  );
};

export default CustomToast;
const styles = StyleSheet.create({
  toast: {
    position: 'absolute',
    bottom: '10%',
    left: '10%',
    right: '10%',
    backgroundColor: '#41B870',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    zIndex: 99999, // Đảm bảo toast hiển thị trên cùng
  },
  text: {
    color: '#fff',
  },
});
