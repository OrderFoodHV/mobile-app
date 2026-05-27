import { Container } from "@app-layout/Layout";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { useState, useEffect } from "react";
import colors from "@assets/colors/global_colors";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import sizes from "@assets/styles/sizes";
import { useNavigationComponentApp } from "@app-helper/navigateToScreens";
import { useRoute, useNavigation, useFocusEffect } from "@react-navigation/native";
import { formatCurrencyToNumber } from "@app-helper/utilities";
import showToastApp from "@app-components/CustomToast/ShowToastApp";
import AppImage from "@app-uikits/AppImage";
import React from "react";
import { useSelector } from "react-redux";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";

const getProductKey = (product: any) =>
  Number(product?.id ?? product?.product_id);

const Order: React.FC = () => {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const token = useSelector((state: any) => state.auth.tokenData);
  const { products, type } = route.params ?? { products: [] };
  const [addressList, setAddressList] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [payment_method_data, setPaymentMethodData] = useState({
    label: "Thanh toán khi nhận hàng",
    value: "COD",
  });
  const { goToOrderInfo } = useNavigationComponentApp();

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      const fetchAddresses = async () => {
        if (!token) return;
        const res = await useCallAPI({
          method: "GET",
          url: `${URL_API}/users/addresses`,
          token: token,
          showToast: false,
        });
        if (isMounted && res && res.success !== false) {
          setAddressList(res);
          if (res.length > 0) {
            setSelectedAddressId(res[0].id.toString());
          }
        }
      };
      fetchAddresses();
      return () => {
        isMounted = false;
      };
    }, [token])
  );

  // 🌟 CẤU HÌNH VOUCHER & PHÍ SHIP KIỂU GRABFOOD
  const shippingFee = 15000; // Phí ship nội thành cố định
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  // Mảng Voucher có sẵn để khách bấm chọn trực tiếp trên màn tạo đơn
  const availableVouchers = [
    {
      id: 1,
      code: "DAN_KY_THUAT",
      discount: 20000,
      label: "Giảm 20k cho dân HUCE 🛠️",
    },
    { id: 2, code: "INORDER10", discount: 10000, label: "Giảm 10k tri ân" },
  ];

  const [quantities, setQuantities] = useState<{ [key: number]: number }>(
    products?.reduce((acc: any, p: any) => {
      acc[getProductKey(p)] = p.quantity ?? 1;
      return acc;
    }, {}),
  );

  const handleIncrease = (id: number) => {
    setQuantities((prev) => ({ ...prev, [id]: (prev[id] ?? 1) + 1 }));
  };

  const handleDecrease = (id: number) => {
    if ((quantities[id] ?? 1) > 1) {
      setQuantities((prev) => ({ ...prev, [id]: prev[id] - 1 }));
    }
  };

  // 1. Tính tổng tiền món ăn gốc
  const subTotalPrice = products.reduce((sum: number, p: any) => {
    const price = formatCurrencyToNumber(p.price);
    const qty = quantities[getProductKey(p)] ?? 1;
    return sum + price * qty;
  }, 0);

  // 2. Tính số tiền được giảm từ Voucher
  const discountAmount = selectedVoucher ? selectedVoucher.discount : 0;

  // 3. Tổng tiền cuối cùng = Tiền món + Ship - Giảm giá
  const finalTotalPrice = subTotalPrice + shippingFee - discountAmount;

  const handlePlaceOrder = () => {
    const selectedItem = addressList.find(item => item.id.toString() === selectedAddressId);
    if (!selectedItem) {
      showToastApp({ type: "error", text: "Vui lòng chọn địa chỉ giao hàng" });
      return;
    }
    const address = selectedItem.detail;

    const items = products?.map((p: any) => {
      const productKey = getProductKey(p);
      return {
        ...p,
        quantity: quantities[productKey] ?? 1,
        total_price:
          formatCurrencyToNumber(p.price) * (quantities[productKey] ?? 1),
        product_id: Number(p.product_id ?? p.id),
      };
    });

    // Đóng gói data gửi sang màn tiếp theo lưu DB
    const data = {
      total_price: formatCurrencyToNumber(finalTotalPrice),
      shipping_fee: shippingFee,
      voucher_code: selectedVoucher?.code || null,
      order_status: "pending",
      payment_method: payment_method_data,
      payment_method_value: paymentMethod,
      address,
      type,
      items,
    };

    goToOrderInfo({ data });
  };

  const paymentMethods = [
    { label: "Thanh toán khi nhận hàng", value: "COD" },
    { label: "Chuyển khoản ngân hàng", value: "BankTransfer" },
    { label: "Thanh toán qua ví điện tử", value: "EWallet" },
  ];

  return (
    <Container>
      <HeaderCustom
        title={"Tạo đơn hàng"}
        rightIcon={<View style={{ flex: 1 }} />}
      />
      <View style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ĐỊA CHỈ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Địa chỉ giao hàng</Text>
            {addressList.length === 0 ? (
              <View style={styles.noAddressContainer}>
                <Text style={styles.noAddressText}>Sếp chưa có địa chỉ giao hàng nào.</Text>
                <TouchableOpacity
                  style={styles.addAddressBtn}
                  onPress={() => navigation.navigate("AddressScreen")}
                >
                  <Text style={styles.addAddressBtnText}>Thêm địa chỉ ngay ➕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.addressListContainer}>
                {addressList.map((item) => {
                  const isSelected = selectedAddressId === item.id.toString();
                  return (
                    <TouchableOpacity
                      key={item.id}
                      style={[
                        styles.addressItem,
                        isSelected && styles.addressItemSelected,
                      ]}
                      onPress={() => setSelectedAddressId(item.id.toString())}
                    >
                      <View style={styles.addressRadioRow}>
                        <View style={[
                          styles.radioButton,
                          isSelected && styles.radioButtonSelected
                        ]} />
                        <Text style={[styles.addressTitle, isSelected && { fontWeight: "700" }]}>
                          {item.title || "Địa chỉ"}
                        </Text>
                      </View>
                      <Text style={styles.addressDetail}>{item.detail}</Text>
                    </TouchableOpacity>
                  );
                })}
                <TouchableOpacity
                  style={styles.manageAddressBtn}
                  onPress={() => navigation.navigate("AddressScreen")}
                >
                  <Text style={styles.manageAddressBtnText}>Quản lý địa chỉ ⚙️</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* SẢN PHẨM */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thông tin sản phẩm</Text>
            {products.map((product: any) => {
              const productKey = getProductKey(product);
              return (
                <View style={styles.productContainer} key={productKey}>
                  <AppImage
                    source={{ uri: product.image }}
                    style={styles.productImage}
                  />
                  <View style={styles.productDetails}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <Text style={styles.productPrice}>
                      {product.price.toLocaleString()} đ
                    </Text>
                    <View style={styles.quantityContainer}>
                      <TouchableOpacity
                        onPress={() => handleDecrease(productKey)}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityButtonText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.quantityText}>
                        {quantities[productKey] ?? 1}
                      </Text>
                      <TouchableOpacity
                        onPress={() => handleIncrease(productKey)}
                        style={styles.quantityButton}
                      >
                        <Text style={styles.quantityButtonText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* 🌟 MỤC CHỌN VOUCHER GIẢM GIÁ TRỰC TIẾP */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mã giảm giá (Voucher)</Text>
            <View style={{ gap: 8 }}>
              {availableVouchers.map((v) => {
                const isSelected = selectedVoucher?.id === v.id;
                return (
                  <TouchableOpacity
                    key={v.id}
                    style={[
                      styles.voucherTicket,
                      isSelected && styles.voucherSelected,
                    ]}
                    onPress={() => setSelectedVoucher(isSelected ? null : v)}
                  >
                    <Text
                      style={[
                        styles.voucherText,
                        isSelected && { color: "#fff" },
                      ]}
                    >
                      {v.code} - {v.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* CHI TIẾT THANH TOÁN (ĂN THEO TOÁN HỌC PHÍ SHIP) */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Chi tiết thanh toán</Text>
            <Text style={styles.billingText}>
              - Tiền món ăn: {subTotalPrice.toLocaleString()} đ
            </Text>
            <Text style={styles.billingText}>
              - Phí giao hàng (Ship): +{shippingFee.toLocaleString()} đ
            </Text>
            {selectedVoucher && (
              <Text style={[styles.billingText, { color: "green" }]}>
                - Giảm giá Voucher: -{discountAmount.toLocaleString()} đ
              </Text>
            )}
            <Text style={[styles.totalText, { marginTop: 10 }]}>
              Thành tiền:{" "}
              {finalTotalPrice < 0 ? 0 : finalTotalPrice.toLocaleString()} đ
            </Text>
          </View>

          {/* PHƯƠNG THỨC THANH TOÁN */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={styles.paymentOptions}>
              {paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.value}
                  style={[
                    styles.paymentOption,
                    paymentMethod === method.value &&
                      styles.paymentOptionSelected,
                  ]}
                  onPress={() => {
                    setPaymentMethod(method.value);
                    setPaymentMethodData(method);
                  }}
                >
                  <Text
                    style={[
                      styles.paymentOptionText,
                      paymentMethod === method.value &&
                        styles.paymentOptionTextSelected,
                    ]}
                  >
                    {method.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.orderButton}
            onPress={handlePlaceOrder}
          >
            <Text style={styles.orderButtonText}>Đặt hàng</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Container>
  );
};

const styles = StyleSheet.create({
  scrollContent: { paddingBottom: 150 },
  section: {
    padding: 16,
    borderBottomWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    backgroundColor: "#f9f9f9",
  },
  productContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  productImage: { width: 80, height: 80, borderRadius: 8, marginRight: 16 },
  productDetails: { flex: 1 },
  productName: { fontSize: 16, fontWeight: "bold" },
  productPrice: { fontSize: 14, color: "#e53935", marginVertical: 8 },
  quantityContainer: { flexDirection: "row", alignItems: "center" },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#ccc",
    alignItems: "center",
    justifyContent: "center",
  },
  quantityButtonText: { fontSize: 18, fontWeight: "bold" },
  quantityText: { fontSize: 16, marginHorizontal: 12 },
  totalText: { fontSize: 16, fontWeight: "bold", color: "#e53935" },
  billingText: { fontSize: 14, color: "#555", marginBottom: 4 },
  voucherTicket: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#EF4444",
    borderStyle: "dashed",
    borderRadius: 8,
    backgroundColor: "#FFF5F5",
  },
  voucherSelected: { backgroundColor: "#EF4444" },
  voucherText: { fontSize: 13, color: "#EF4444", fontWeight: "600" },
  paymentOptions: { flexDirection: "column", gap: 10 },
  paymentOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f9f9f9",
  },
  paymentOptionSelected: {
    backgroundColor: colors.blue_primary,
    borderColor: colors.blue_primary,
  },
  paymentOptionText: { fontSize: 14, color: "#333" },
  paymentOptionTextSelected: { color: "#fff", fontWeight: "bold" },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  orderButton: {
    backgroundColor: colors.blue_primary,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  orderButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  noAddressContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  noAddressText: {
    fontSize: 14,
    color: "#6B7280",
    marginBottom: 12,
  },
  addAddressBtn: {
    backgroundColor: colors.blue_primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
  },
  addAddressBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  addressListContainer: {
    gap: 10,
  },
  addressItem: {
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    marginBottom: 8,
  },
  addressItemSelected: {
    borderColor: colors.blue_primary,
    backgroundColor: "#EFF6FF",
  },
  addressRadioRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  radioButton: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#9CA3AF",
    marginRight: 8,
  },
  radioButtonSelected: {
    borderColor: colors.blue_primary,
    backgroundColor: colors.blue_primary,
  },
  addressTitle: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "600",
  },
  addressDetail: {
    fontSize: 13,
    color: "#4B5563",
    marginLeft: 24,
  },
  manageAddressBtn: {
    alignSelf: "flex-end",
    marginTop: 6,
  },
  manageAddressBtnText: {
    color: colors.blue_primary,
    fontSize: 13,
    fontWeight: "600",
  },
});

export default Order;
