import React, { FC, useEffect, useRef } from 'react';
import {
  Animated,
  Dimensions,
  Modal,
  PanResponder,
  StyleProp,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';
import sizes from '@assets/styles/sizes';
import styles_c from '@assets/styles/styles_c';

const screenHeight = Dimensions.get('window').height;

export interface ModalCustomProps {
  iconRightTop?: React.ReactNode;
  isAnimated?: boolean;
  showBtn?: boolean;
  isScroll?: boolean;
  isLoading?: boolean;
  isVisible?: boolean;
  onClose?: () => void;
  onConfirm?: () => void;
  children: React.ReactNode;
  titleBtn1?: string;
  titleBtn2?: string;
  style?: StyleProp<ViewStyle>;
  isDisabled?: boolean;
  title?: string;
}

const ModalCustom: FC<ModalCustomProps> = ({
  iconRightTop,
  isAnimated = true,
  showBtn = true,
  isVisible,
  onClose,
  onConfirm,
  children,
  titleBtn1,
  titleBtn2,
  style,
  isDisabled,
  title,
}) => {
  const translateY = useRef(new Animated.Value(screenHeight)).current;

  const closeAnimation = () => {
    Animated.timing(translateY, {
      toValue: screenHeight,
      duration: 250,
      useNativeDriver: true,
    }).start(() => {
      onClose?.();
    });
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: (_, gestureState) => Math.abs(gestureState.dy) > 5,
    onPanResponderMove: (_, gestureState) => {
      if (gestureState.dy > 0) {
        translateY.setValue(gestureState.dy);
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (gestureState.dy > 100) {
        closeAnimation();
        return;
      }
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
      }).start();
    },
  });

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: isVisible ? 0 : screenHeight,
      duration: isAnimated ? 250 : 0,
      useNativeDriver: true,
    }).start();
  }, [isAnimated, isVisible, translateY]);

  return (
    <Modal animationType="fade" transparent visible={!!isVisible} onRequestClose={onClose}>
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.overlayPressable} onPress={onClose} />
        <Animated.View
          {...panResponder.panHandlers}
          style={[styles.modalView, style, { transform: [{ translateY }] }]}
        >
          <TouchableOpacity style={styles.dragHandleWrap} onPress={onClose}>
            <View style={styles.bar} />
          </TouchableOpacity>
          <View
            style={{
              ...styles_c.row_between,
              ...styles_c.border_bottom,
              ...styles_c.view_height_row_bw,
              paddingHorizontal: 16,
            }}
          >
            <View style={{ flex: 1 }} />
            {title ? (
              <View style={{ alignItems: 'center' }}>
                <Text style={{ ...styles_c.font_text_14_600, color: '#1890FF' }}>{title}</Text>
              </View>
            ) : null}
            <View style={{ flex: 1, alignItems: 'flex-end' }}>{iconRightTop}</View>
          </View>
          <View style={{ maxHeight: sizes._screen_height * 0.82 }}>
            {children}
            {showBtn ? (
              <View style={{ ...styles_c.row_between }}>
                {titleBtn1 ? (
                  <View style={styles.viewBtn}>
                    <TouchableOpacity style={[styles.button, styles.outlineButton]} onPress={onClose}>
                      <Text style={styles.outlineButtonText}>{titleBtn1}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
                {titleBtn2 ? (
                  <View style={styles.viewBtn}>
                    <TouchableOpacity
                      disabled={isDisabled}
                      style={[styles.button, styles.primaryButton, isDisabled && styles.disabledButton]}
                      onPress={onConfirm}
                    >
                      <Text style={styles.primaryButtonText}>{titleBtn2}</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            ) : null}
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: '#0000001E',
  },
  overlayPressable: {
    flex: 1,
  },
  modalView: {
    justifyContent: 'flex-end',
    maxHeight: sizes._screen_height * 0.9,
    backgroundColor: 'white',
    borderTopRightRadius: 20,
    borderTopLeftRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  dragHandleWrap: {
    alignItems: 'center',
  },
  bar: {
    marginTop: 8,
    backgroundColor: '#F1F1F1',
    height: sizes._8sdp,
    width: sizes._80sdp,
    borderRadius: 5,
  },
  viewBtn: {
    flex: 1,
    ...styles_c.view_height_center,
    marginVertical: 16,
    marginBottom: 24,
    paddingHorizontal: 16,
    gap: 16,
  },
  button: {
    minHeight: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  outlineButton: {
    borderWidth: 1,
    borderColor: '#1890FF',
    backgroundColor: '#FFFFFF',
  },
  outlineButtonText: {
    color: '#1890FF',
    fontWeight: '600',
  },
  primaryButton: {
    backgroundColor: '#1890FF',
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  disabledButton: {
    opacity: 0.5,
  },
});

export default ModalCustom;
