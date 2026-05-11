import { useNavigation, CommonActions } from '@react-navigation/native';
import { useOnEventCallback } from './hooks';

export const useNavigationMainApp = () => {
  const navigation: any = useNavigation();

  const goToRegister = useOnEventCallback(() => {
    navigation.navigate('Register');
  });

  const goToLogin = useOnEventCallback(() => {
    navigation.navigate('Login');
  });

  const goToMainSearch = useOnEventCallback(() => {
    navigation.navigate('MainSearch');
  });

  const goToMainHome = useOnEventCallback(() => {
    navigation.navigate('MainHome');
  });

  const goToMainLibrary = useOnEventCallback(() => {
    navigation.navigate('MainLibrary');
  });

  const goToMainPersonal = useOnEventCallback(() => {
    navigation.navigate('MainPersonal');
  });

  const goToMainRanking = useOnEventCallback(() => {
    navigation.navigate('MainRanking');
  });

  const goToSplash = useOnEventCallback(() => {
    navigation.navigate('Splash');
  });
  const goToBottomContainer = useOnEventCallback((route?: any) => {
    navigation.navigate('BottomContainer', route);
  })

  return {
    goToRegister,
    goToLogin,
    goToMainSearch,
    goToMainHome,
    goToMainLibrary,
    goToMainPersonal,
    goToMainRanking,
    goToSplash,
    goToBottomContainer
  };
};

export const useNavigationComponentApp = () => {
  const navigation: any = useNavigation();

  const goToScreen = (screenName: string, params?: Record<string, any>) => {
    if (params && Object.keys(params).length > 0) {
      navigation.navigate(screenName, params);
    } else {
      navigation.navigate(screenName);
    }
  };

  // Các hàm điều hướng cụ thể
  const goToProductDetail = useOnEventCallback((route?: any) => {
    goToScreen('ProductDetail', route);
  });
  const goToCart = useOnEventCallback((route?: any) => {
    goToScreen('Cart', route);
  });
  const goToOrder = useOnEventCallback((route?: any) => {
    goToScreen('Order', route);
  });
  const goToOrderInfo = useOnEventCallback((route?: any) => {
    goToScreen('OrderInfo', route);
  });
  const goToOrderList = useOnEventCallback((route?: any) => {
    goToScreen('OrderList', route);
  });
  const goToOrderDetail = useOnEventCallback((route?: any) => {
    goToScreen('OrderDetail', route);
  });
  const goToViewAll = useOnEventCallback((route?: any) => {
    goToScreen('ViewAll', route);
  });
  const goToViewPlaylist = useOnEventCallback((route?: any) => {
    goToScreen('ViewPlaylist', route);
  });
  const goToViewAccountPackage = useOnEventCallback((route?: any) => {
    goToScreen('ViewAccountPackage', route);
  });
  const goToGridView = useOnEventCallback((route?: any) => {
    goToScreen('GridView', route);
  });
  const goToListTitleView = useOnEventCallback((route?: any) => {
    goToScreen('ListTitleView', route);
  });
  const goToEditProfile = useOnEventCallback((route?: any) => {
    goToScreen('EditProfile', route);
  });
  const goToFavouriteScreen = useOnEventCallback((route?: any) => {
    goToScreen('FavouriteScreen', route);
  });
  const goToSingerScreen = useOnEventCallback((route?: any) => {
    goToScreen('SingerScreen', route);
  });
  const goToSpeechToText = useOnEventCallback((route?: any) => {
    goToScreen('SpeechToText', route);
  });

  return {
    goToProductDetail,
    goToCart,
    goToViewAll,
    goToGridView,
    goToListTitleView,
    goToEditProfile,
    goToFavouriteScreen,
    goToSingerScreen,
    goToViewPlaylist,
    goToViewAccountPackage,
    goToSpeechToText,
    goToOrder,
    goToOrderDetail,
    goToOrderInfo,
    goToOrderList
  };
};


export const useNavigationServices = () => {
  const navigation: any = useNavigation();

  const goToBack = useOnEventCallback(() => {
    navigation.goBack();
  });
  const replaceScreen = useOnEventCallback((screen?: any) => {
    navigation.replace(screen)
  })
  const resetScreen = useOnEventCallback((screen?: any) => {
    navigation.dispatch(
      CommonActions.reset({
        index: 0,
        routes: [{ name: screen }],
      })
    )
  })
  return {
    goToBack,
    replaceScreen,
    resetScreen
  }
}

