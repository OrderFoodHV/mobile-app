import React, { memo, useEffect } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useDispatch } from "react-redux";
import AppImage from "@app-uikits/AppImage";
import sizes from "@assets/styles/sizes";
import ServiceStorage, { KEY_STORAGE } from "@app-services/service-storage";
import { AppDispatch } from "@redux/store";
import { hydrateAuth } from "@redux/features/authSlice";

interface SplashProps {}

const Splash: React.FC<SplashProps> = () => {
  const navigation: any = useNavigation();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const bootstrapAuth = async () => {
      const account = await ServiceStorage.getObject(KEY_STORAGE.ACCOUNT_DATA, {});
      const token = await ServiceStorage.getString(KEY_STORAGE.USER_TOKEN, "");

      if (account?.email && token) {
        dispatch(
          hydrateAuth({
            account,
            token,
          }),
        );

        navigation.dispatch(
          CommonActions.reset({
            index: 0,
            routes: [{ name: "BottomContainer" }],
          }),
        );

        return;
      }

      navigation.dispatch(
        CommonActions.reset({
          index: 0,
          routes: [{ name: "Login" }],
        }),
      );
    };

    bootstrapAuth();
  }, [dispatch, navigation]);

  return (
    <View style={styles.container}>
      <AppImage
        source={require("@assets/images/logoLvalegend.png")}
        style={styles.logo}
        resizeMode={"cover"}
      />
      <View style={styles.footer}>
        <Text style={styles.footerText}>Product by Hoang Le</Text>
      </View>
    </View>
  );
};

export default memo(Splash);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  logo: {
    width: sizes._100sdp,
    height: sizes._102sdp,
  },
  footer: {
    position: "absolute",
    bottom: 10,
  },
  footerText: {
    fontSize: sizes._10sdp,
  },
});
