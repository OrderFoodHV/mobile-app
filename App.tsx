import { Provider } from 'react-redux';
import store from './src/redux/store';
import AppNavigator from './src/app-navigation/navigation-container';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

export default function App() {
  return (
    <Provider store={store}>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <AppNavigator />
      </GestureHandlerRootView>
    </Provider>
  );
}
