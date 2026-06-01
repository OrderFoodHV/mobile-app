import React from 'react';
import {
  StyleSheet,
  ScrollView,
  StyleProp,
  ViewStyle,
  View,
  SafeAreaView,
} from 'react-native';

interface Props {
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  [key: string]: any;
}

const Container: React.FC<Props> = ({ children, style, ...props }) => {
  return (
    <SafeAreaView style={styles.container}>
      <View {...props} style={[{ width: '100%', height: '100%' }, style]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const Header: React.FC<Props> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.header, style]} {...props}>
      {children}
    </View>
  );
};

interface ContentProps {
  scrollEnabled?: boolean;
  children?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  [key: string]: any;
}

const Content: React.FC<ContentProps> = ({ scrollEnabled = true, style, children, ...props }) => {
  return (
    <View style={[styles.content, style]} {...props}>
      <ScrollView
        scrollEnabled={scrollEnabled}
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </View>
  );
};

const Footer: React.FC<Props> = ({ children, style, ...props }) => {
  return (
    <View style={[styles.footer, style]} {...props}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop:40
  },
  content: {
    flex: 1,
    width: '100%',
  },
  header: {
    width: '100%',
  },
  footer: {
    width: '100%',
  },
});

export {
  Container,
  Header,
  Content,
  Footer
};
