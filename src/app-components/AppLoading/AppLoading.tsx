import React from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';

interface AppLoadingProps {
  loading: boolean;
}

const AppLoading: React.FC<AppLoadingProps> = ({ loading }) => {
  return (
    <Modal transparent visible={loading} animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  content: {
    width: 72,
    height: 72,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default AppLoading;
