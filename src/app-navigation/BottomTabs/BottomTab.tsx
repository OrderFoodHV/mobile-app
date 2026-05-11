import React from 'react';
import { TouchableWithoutFeedback, View, Text, StyleSheet } from 'react-native';
import styles from './NavigationBottom.styles';
import sizes from '@assets/styles/sizes';

const MAIN_TAB_COLOR = '#3498db';

interface TabProps {
  isActive?: boolean;
  accessibilityLabel?: string;
  icon?: React.ReactNode;
  onPress?: () => void;
  onLongPress?: () => void;
  index?: number;
  name?: string;
}

const BottomTab: React.FC<TabProps> = ({
  isActive,
  accessibilityLabel,
  icon,
  onPress,
  name,
}) => {
  return (
    <TouchableWithoutFeedback
      accessibilityRole="button"
      accessibilityState={isActive ? { selected: true } : {}}
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
    >
      <View style={styles.btnBottom}>
        <View style={tabStyles.indicator}>
          {isActive && (
            <Text style={tabStyles.dot}>•</Text>
          )}
        </View>

        <View style={tabStyles.iconWrapper}>{icon}</View>

        <View style={tabStyles.labelWrapper}>
          <Text style={[tabStyles.label, isActive && tabStyles.labelActive]}>
            {name}
          </Text>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
};

const tabStyles = StyleSheet.create({
  indicator: {
    height: sizes._20sdp,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dot: {
    color: MAIN_TAB_COLOR,
    fontSize: 20,
  },
  iconWrapper: {
    marginBottom: 2,
  },
  labelWrapper: {
    marginBottom: 8,
  },
  label: {
    color: 'black',
    fontSize: sizes._12sdp,
    fontWeight: '500',
  },
  labelActive: {
    color: MAIN_TAB_COLOR,
  },
});

export default BottomTab;