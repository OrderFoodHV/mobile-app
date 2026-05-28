import ButtonBase from "@app-components/ButtonBase/ButtonBase";
import sizes from "@assets/styles/sizes";
import styles_c from "@assets/styles/styles_c";
import { Fragment, memo, useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  TouchableWithoutFeedback,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  Alert,
} from "react-native";
import { Formik } from "formik";
import { registerSchema } from "./schema/validationForm";
import {
  useNavigationMainApp,
  useNavigationServices,
} from "@app-helper/navigateToScreens";
import { useDispatch, useSelector } from "react-redux";
import AppLoading from "@app-components/AppLoading/AppLoading";
import {
  registerAccount,
  resetRegisterResponse,
  loginAccount,
  resetLoginResponse,
} from "@redux/features/authSlice";
import { AppDispatch, RootState } from "@redux/store";
import AppImage from "@app-uikits/AppImage";
import colors from "@assets/colors/global_colors";
import React from "react";

interface RegisterProps {}

const Register: React.FC<RegisterProps> = () => {
  const { goToLogin, goToBottomContainer } = useNavigationMainApp();
  const { replaceScreen } = useNavigationServices();
  const dispatch = useDispatch<AppDispatch>();
  const { registerResponse, loginResponse, authLoading } = useSelector(
    (state: RootState) => state.auth,
  );

  const regCredentialsRef = useRef<{ email: string; password: string } | null>(null);

  useEffect(() => {
    if (registerResponse?.success === true) {
      Alert.alert(
        "Đăng ký thành công",
        "Chào mừng bạn đến với Food App! Đang tự động đăng nhập...",
        [
          {
            text: "OK",
            onPress: () => {
              if (regCredentialsRef.current) {
                dispatch(resetRegisterResponse());
                dispatch(loginAccount(regCredentialsRef.current));
              }
            },
          },
        ],
        { cancelable: false }
      );
    } else if (registerResponse?.success === false) {
      Alert.alert("Đăng ký thất bại", registerResponse.message || "Vui lòng thử lại.");
      dispatch(resetRegisterResponse());
    }
  }, [registerResponse]);

  useEffect(() => {
    if (loginResponse?.success === true) {
      dispatch(resetLoginResponse());
      replaceScreen("BottomContainer");
    } else if (loginResponse?.success === false) {
      Alert.alert("Đăng nhập thất bại", loginResponse.message || "Không thể tự động đăng nhập.");
      dispatch(resetLoginResponse());
    }
  }, [loginResponse]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, marginVertical: 20 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView contentContainerStyle={{ flexGrow: 1 }}>
        <Formik
          initialValues={{
            name: "",
            email: "",
            password: "",
            phone: "",
          }}
          validationSchema={registerSchema}
          onSubmit={(values) => {
            console.log("👉 Formik gom đủ đồ nè:", values);
            regCredentialsRef.current = { email: values.email, password: values.password };
            dispatch(resetRegisterResponse());
            dispatch(
              registerAccount({
                email: values.email,
                user_name: values.name,
                password: values.password,
                phone: values.phone,
              })
            );
          }}
        >
          {/* 👇 ĐÂY NÀY! CÁI DÒNG SẾP LỠ TAY XÓA MẤT LÀ DÒNG NÀY NÀY 👇 */}
          {({
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            values,
            errors,
            touched,
          }) => (
            <View
              style={{
                flex: 1,
                marginHorizontal: 15,
                justifyContent: "center",
                alignItems: "center",
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
                style={{ fontSize: sizes._12sdp, color: colors.blue_primary }}
              >
                Welcome to Food App
              </Text>
              <Text
                style={{ fontSize: sizes._20sdp, color: colors.blue_primary }}
              >
                Create your account
              </Text>

              <View style={{ width: "90%", gap: 10 }}>
                {/* Name Field */}
                <View style={{ gap: 2 }}>
                  <Text style={{ color: errors.name ? "red" : "black" }}>
                    Name
                  </Text>
                  <TextInput
                    style={[
                      styles.text_input_style,
                      errors.name && { borderColor: "red", borderWidth: 1 },
                    ]}
                    placeholder="Enter Name"
                    value={values.name}
                    onChangeText={handleChange("name")}
                    onBlur={handleBlur("name")}
                  />
                  {errors.name && (
                    <Text style={{ color: "#FF0707", fontSize: sizes._10sdp }}>
                      {errors.name}
                    </Text>
                  )}
                </View>

                {/* Email Field */}
                <View style={{ gap: 2 }}>
                  <Text>Email</Text>
                  <TextInput
                    style={[
                      styles.text_input_style,
                      errors.email && { borderColor: "red", borderWidth: 1 },
                    ]}
                    placeholder="Enter Email"
                    value={values.email}
                    onChangeText={handleChange("email")}
                    onBlur={handleBlur("email")}
                  />
                  {errors.email && (
                    <Text style={{ color: "#FF0707", fontSize: sizes._10sdp }}>
                      {errors.email}
                    </Text>
                  )}
                </View>
                {/* Ô nhập Số điện thoại */}
                <View style={{ gap: 2 }}>
                  <Text>Phone Number</Text>
                  <TextInput
                    style={[styles.text_input_style /* ... style lỗi nếu có */]}
                    placeholder="Enter Phone Number"
                    value={values.phone}
                    keyboardType="phone-pad" // Mở bàn phím số
                    onChangeText={handleChange("phone")}
                    onBlur={handleBlur("phone")}
                  />
                  {/* Hiện lỗi Formik nếu có */}
                  {touched.phone && errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}
                </View>
                {/* Password Field */}
                <View style={{ gap: 2 }}>
                  <Text>Password</Text>
                  <TextInput
                    style={[
                      styles.text_input_style,
                      errors.password && { borderColor: "red", borderWidth: 1 },
                    ]}
                    placeholder="Enter Password"
                    value={values.password}
                    secureTextEntry
                    onChangeText={handleChange("password")}
                    onBlur={handleBlur("password")}
                  />
                  {errors.password && (
                    <Text style={{ color: "#FF0707", fontSize: sizes._10sdp }}>
                      {errors.password}
                    </Text>
                  )}
                </View>

                {/* Sign Up Button */}
                <View style={{ marginTop: 5, gap: 22 }}>
                  <ButtonBase
                    title="Sign Up"
                    paddingHorizontal={10}
                    paddingVertical={10}
                    backgroundColor={colors.blue_primary}
                    onPress={() => handleSubmit()}
                  />

                  <View style={[styles_c.row_center, { gap: 5 }]}>
                    <Text style={{ fontSize: sizes._13sdp }}>
                      Do you have an account?
                    </Text>
                    <TouchableOpacity onPress={goToLogin}>
                      <Text
                        style={{
                          fontSize: sizes._13sdp,
                          color: colors.blue_primary,
                          fontWeight: "bold",
                        }}
                      >
                        Sign In
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          )}
        </Formik>
      </ScrollView>
      <Fragment>{authLoading && <AppLoading loading={authLoading} />}</Fragment>
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
  },
});

export default Register;
