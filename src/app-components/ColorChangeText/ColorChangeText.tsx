import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface ColorChangingTextProps {
  text: string; // Văn bản để hiển thị
  colors: [string, string]; // Mảng màu cho hiệu ứng
  duration?: number; // Thời gian hoạt động của hiệu ứng (mặc định là 10 giây)
  fontSize?: number; // Cỡ chữ
}

const ColorChangingText: React.FC<ColorChangingTextProps> = ({
  text,
  colors,
  duration = 10000, // Mặc định là 10 giây nếu không có duration
  fontSize = 14, // Giá trị mặc định cho cỡ chữ
}) => {
  const colorAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(colorAnimation, {
          toValue: 1,
          duration: duration,
          useNativeDriver: false,
        }),
        Animated.timing(colorAnimation, {
          toValue: 0,
          duration: 0, // Không có thời gian chuyển tiếp khi quay lại từ đầu
          useNativeDriver: false,
        })
      ])
    ).start();
  }, [colorAnimation, duration]);

  return (
    <View style={styles.container}>
      {text?.split('')?.map((char, index) => {
        const color = colorAnimation.interpolate({
          inputRange: [
            (index - 1) / text.length,
            index / text.length,
            (index + 1) / text.length
          ],
          outputRange: [colors[0], colors[1], colors[0]],
          extrapolate: 'clamp'
        });

        return (
          <Animated.Text key={index} style={{ color, fontSize }}>
            {char}
          </Animated.Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
});

export default ColorChangingText;
