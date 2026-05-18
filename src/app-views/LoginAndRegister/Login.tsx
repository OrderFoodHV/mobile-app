import AppLoading from "@app-components/AppLoading/AppLoading";
import ButtonBase from "@app-components/ButtonBase/ButtonBase";
import {
  useNavigationMainApp,
  useNavigationServices,
} from "@app-helper/navigateToScreens";
import colors from "@assets/colors/global_colors";
import sizes from "@assets/styles/sizes";
import styles_c from "@assets/styles/styles_c";
import AppImage from "@app-uikits/AppImage";
import { loginAccount, resetLoginResponse } from "@redux/features/authSlice";
import { AppDispatch, RootState } from "@redux/store";
import ServiceStorage, { KEY_STORAGE } from "@app-services/service-storage";

import { Formik } from "formik";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";

import { loginSchema } from "./schema/validationForm";

interface LoginProps {}

const Login: React.FC<LoginProps> = () => {
  const { goToRegister } = useNavigationMainApp();
  const { replaceScreen } = useNavigationServices();

  const dispatch = useDispatch<AppDispatch>();

  const loginResponse = useSelector(
    (state: RootState) => state.auth.loginResponse,
  );

  const [initialValues, setInitialValues] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    (async () => {
      //THÊM DÒNG NÀY VÀO ĐỂ TẨY TRẮNG BỘ NHỚ CŨ
      await ServiceStorage.clearAll();
      const data = await ServiceStorage.getObject(KEY_STORAGE.ACCOUNT_DATA, {});

      setInitialValues({
        email: data?.email || "",
        password: "",
      });
    })();
  }, []);

  useEffect(() => {
    if (loginResponse?.success === true) {
      replaceScreen("BottomContainer");
    }
  }, [loginResponse]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validationSchema={loginSchema}
          validateOnMount
          onSubmit={(values) => {
            dispatch(resetLoginResponse());
            dispatch(loginAccount(values));
            // replaceScreen('BottomContainer')
          }}
        >
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            values,
            errors,
            touched,
            isValid,
          }) => {
            const isDisableButton =
              !values.email.trim() || !values.password.trim() || !isValid;

            return (
              <View
                style={{
                  flex: 1,
                  justifyContent: "center",
                  alignItems: "center",
                  marginHorizontal: 15,
                  gap: 12,
                }}
              >
                <AppImage
                  source={require("@assets/images/logoLvalegend.png")}
                  style={{
                    width: sizes._80sdp,
                    height: sizes._82sdp,
                    borderRadius: 9999,
                  }}
                  resizeMode={"cover"}
                />

                <Text
                  style={{
                    fontSize: sizes._15sdp,
                    color: colors.blue_primary,
                  }}
                >
                  Order Food
                </Text>

                <Text
                  style={{
                    fontSize: sizes._20sdp,
                    color: colors.blue_primary,
                  }}
                >
                  Sign in to your account
                </Text>

                <View style={{ width: "90%", gap: 20 }}>
                  {/* Email */}
                  <View style={{ gap: 2 }}>
                    <Text>Email</Text>

                    <TextInput
                      style={[
                        styles.text_input_style,
                        touched.email && errors.email
                          ? styles.errorBorder
                          : null,
                      ]}
                      placeholder="Enter Email"
                      value={values.email}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      onChangeText={handleChange("email")}
                      onBlur={handleBlur("email")}
                    />

                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}
                  </View>

                  {/* Password */}
                  <View style={{ gap: 2 }}>
                    <Text>Password</Text>

                    <TextInput
                      style={[
                        styles.text_input_style,
                        touched.password && errors.password
                          ? styles.errorBorder
                          : null,
                      ]}
                      placeholder="Enter Password"
                      secureTextEntry
                      value={values.password}
                      onChangeText={handleChange("password")}
                      onBlur={handleBlur("password")}
                    />

                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}
                  </View>

                  {/* Sign In */}
                  <ButtonBase
                    title="Sign In"
                    paddingHorizontal={10}
                    paddingVertical={10}
                    backgroundColor={
                      isDisableButton ? "#BDBDBD" : colors.blue_primary
                    }
                    disabled={isDisableButton}
                    onPress={() => handleSubmit()}
                  />

                  {/* Sign Up */}
                  <View
                    style={[
                      styles_c.row_center,
                      {
                        gap: 5,
                      },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: sizes._13sdp,
                      }}
                    >
                      You don't have an account?
                    </Text>

                    <TouchableOpacity onPress={goToRegister}>
                      <Text
                        style={{
                          fontSize: sizes._13sdp,
                          color: colors.blue_primary,
                          fontWeight: "bold",
                        }}
                      >
                        Sign Up
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          }}
        </Formik>
      </ScrollView>

      {/* Loading */}
      {/* <AppLoading loading={authLoading} /> */}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  text_input_style: {
    width: "100%",
    padding: 9,
    borderRadius: 5,
    paddingLeft: 10,
    backgroundColor: "white",
  },

  errorText: {
    color: "#FF0707",
    fontSize: sizes._10sdp,
    marginTop: 2,
  },

  errorBorder: {
    borderColor: "red",
    borderWidth: 1,
  },
});

export default Login;
