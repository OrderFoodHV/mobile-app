import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  StatusBar,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import colors from "@assets/colors/global_colors";
import HeaderCustom from "@app-components/HeaderCustom/HeaderCustom";
import sizes from "@assets/styles/sizes";
import { Feather } from "@expo/vector-icons";
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
  const { products, type, note } = route.params ?? { products: [] };
  const [addressList, setAddressList] = useState<any[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [payment_method_data, setPaymentMethodData] = useState({
    label: "Thanh toán khi nhận hàng",
    value: "COD",
  });
  const [orderNote, setOrderNote] = useState<string>(note || "");
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
            const defaultAddress = res.find((item: any) => Number(item.is_default) === 1);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id.toString());
            } else {
              setSelectedAddressId(res[0].id.toString());
            }
          }
        }
      };
      fetchAddresses();
      return () => {
        isMounted = false;
      };
    }, [token])
  );

  const [fees, setFees] = useState<any[]>([]);
  const [selectedVoucher, setSelectedVoucher] = useState<any>(null);

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const res = await useCallAPI({
          method: "GET",
          url: `${URL_API}/products/fees`,
          showToast: false,
        });
        const actualFees = res?.data || res;
        if (Array.isArray(actualFees)) {
          setFees(actualFees);
        }
      } catch (err) {
        console.log("Lỗi tải cấu hình phí:", err);
      }
    };
    fetchFees();
  }, []);

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

  const subTotalPrice = products.reduce((sum: number, p: any) => {
    const price = formatCurrencyToNumber(p.price);
    const qty = quantities[getProductKey(p)] ?? 1;
    return sum + price * qty;
  }, 0);

  const shippingFeeItem = fees.find(f => f.fee_type === 'shipping_fee' && f.status === 'active');
  let shippingFee = 0;
  if (shippingFeeItem) {
    let applyFee = true;
    if (shippingFeeItem.condition_type === 'under_subtotal' && shippingFeeItem.condition_value != null) {
      applyFee = subTotalPrice < Number(shippingFeeItem.condition_value);
    } else if (shippingFeeItem.condition_type === 'above_subtotal' && shippingFeeItem.condition_value != null) {
      applyFee = subTotalPrice >= Number(shippingFeeItem.condition_value);
    }

    if (applyFee) {
      const val = Number(shippingFeeItem.fee_value);
      if (shippingFeeItem.calculation_type === 'percentage') {
        shippingFee = (subTotalPrice * val) / 100;
      } else {
        shippingFee = val;
      }
    }
  }

  const serviceFeeItem = fees.find(f => f.fee_type === 'service_fee' && f.status === 'active');
  let serviceFee = 0;
  if (serviceFeeItem) {
    let applyFee = true;
    if (serviceFeeItem.condition_type === 'under_subtotal' && serviceFeeItem.condition_value != null) {
      applyFee = subTotalPrice < Number(serviceFeeItem.condition_value);
    } else if (serviceFeeItem.condition_type === 'above_subtotal' && serviceFeeItem.condition_value != null) {
      applyFee = subTotalPrice >= Number(serviceFeeItem.condition_value);
    }

    if (applyFee) {
      const val = Number(serviceFeeItem.fee_value);
      if (serviceFeeItem.calculation_type === 'percentage') {
        serviceFee = (subTotalPrice * val) / 100;
      } else {
        serviceFee = val;
      }
    }
  }

  const discountAmount = selectedVoucher ? selectedVoucher.discount : 0;
  const finalTotalPrice = subTotalPrice + shippingFee + serviceFee - discountAmount;

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

    const data = {
      total_price: formatCurrencyToNumber(finalTotalPrice),
      shipping_fee: shippingFee,
      service_fee: serviceFee,
      voucher_code: selectedVoucher?.code || null,
      order_status: "pending",
      payment_method: payment_method_data,
      payment_method_value: paymentMethod,
      address,
      type,
      items,
      note: orderNote,
    };

    goToOrderInfo({ data });
  };

  const paymentMethods = [
    { label: "Thanh toán khi nhận hàng (COD)", value: "COD", icon: "dollar-sign" },
    { label: "Chuyển khoản ngân hàng", value: "BankTransfer", icon: "credit-card" },
    { label: "Ví điện tử", value: "pocket", icon: "pocket" },
  ];

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F7F9FC" }}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />
      <HeaderCustom
        title={"Xác nhận đặt hàng"}
        rightIcon={<View style={{ flex: 1 }} />}
      />
      <View style={{ flex: 1 }}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{ flex: 1 }}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* ADDRESS SECTION */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="map-pin" size={18} color={colors.blue_primary} style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Địa chỉ giao hàng</Text>
            </View>
            {addressList.length === 0 ? (
              <View style={styles.noAddressContainer}>
                <Text style={styles.noAddressText}>bạn chưa có địa chỉ giao hàng nào.</Text>
                <TouchableOpacity
                  style={styles.addAddressBtn}
                  onPress={() => navigation.navigate("AddressScreen")}
                >
                  <Text style={styles.addAddressBtnText}>Thêm địa chỉ ngay ➕</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View style={styles.addressListContainer}>
                {addressList
                  .filter((item) => selectedAddressId === item.id.toString())
                  .map((item) => (
                    <View key={item.id} style={styles.addressDetailsBox}>
                      <View style={styles.addressHeaderRow}>
                        <Text style={styles.addressTitle}>
                          {item.title || "Địa chỉ"}
                        </Text>
                        {Number(item.is_default) === 1 && (
                          <View style={styles.defaultBadge}>
                            <Text style={styles.defaultBadgeText}>Mặc định</Text>
                          </View>
                        )}
                      </View>
                      <Text style={styles.addressDetail}>{item.detail}</Text>
                    </View>
                  ))}
                <TouchableOpacity
                  style={styles.manageAddressBtn}
                  onPress={() => navigation.navigate("AddressScreen")}
                >
                  <Text style={styles.manageAddressBtnText}>Thay đổi địa chỉ</Text>
                  <Feather name="chevron-right" size={14} color={colors.blue_primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* PRODUCTS SECTION */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="shopping-bag" size={18} color="#10B981" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Món ăn đã chọn</Text>
            </View>
            {products.map((product: any, idx: number) => {
              const productKey = getProductKey(product);
              return (
                <View key={productKey}>
                  {idx > 0 && <View style={styles.itemSeparator} />}
                  <View style={styles.productRow}>
                    <AppImage source={{ uri: product.image }} style={styles.productImage} />
                    <View style={styles.productInfo}>
                      <Text style={styles.productName} numberOfLines={1}>{product.name}</Text>
                      <Text style={styles.productPrice}>
                        {formatCurrencyToNumber(product.price).toLocaleString("vi-VN")} đ
                      </Text>
                      <View style={styles.quantityControl}>
                        <TouchableOpacity
                          onPress={() => handleDecrease(productKey)}
                          style={styles.qtyBtn}
                        >
                          <Feather name="minus" size={14} color="#4B5563" />
                        </TouchableOpacity>
                        <Text style={styles.qtyText}>
                          {quantities[productKey] ?? 1}
                        </Text>
                        <TouchableOpacity
                          onPress={() => handleIncrease(productKey)}
                          style={styles.qtyBtn}
                        >
                          <Feather name="plus" size={14} color="#4B5563" />
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </View>
              );
            })}
          </View>

          {/* NOTE SECTION */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="edit-3" size={18} color="#6B7280" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Ghi chú cho tài xế/nhà hàng</Text>
            </View>
            <View style={styles.noteInputContainer}>
              <TextInput
                style={styles.noteInput}
                placeholder="Ví dụ: Ít cay, không hành, giao cổng sau..."
                placeholderTextColor="#9CA3AF"
                value={orderNote}
                onChangeText={setOrderNote}
                multiline={true}
                numberOfLines={2}
              />
            </View>
          </View>

          {/* VOUCHER SECTION */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="tag" size={18} color="#F59E0B" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Mã giảm giá</Text>
            </View>
            <View style={styles.voucherContainer}>
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
                    activeOpacity={0.8}
                  >
                    <View style={styles.voucherIconBg}>
                      <Feather name="percent" size={14} color={isSelected ? "#FFF" : "#EF4444"} />
                    </View>
                    <View style={styles.voucherTicketInfo}>
                      <Text style={[styles.voucherCode, isSelected && { color: "#fff" }]}>
                        {v.code}
                      </Text>
                      <Text style={[styles.voucherLabel, isSelected && { color: "rgba(255,255,255,0.8)" }]}>
                        {v.label}
                      </Text>
                    </View>
                    {isSelected && (
                      <Feather name="check-circle" size={18} color="#fff" style={{ marginLeft: 8 }} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* PAYMENT METHODS SECTION */}
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <Feather name="credit-card" size={18} color="#8B5CF6" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Phương thức thanh toán</Text>
            </View>
            <View style={styles.paymentList}>
              {paymentMethods.map((method) => {
                const isSelected = paymentMethod === method.value;
                return (
                  <TouchableOpacity
                    key={method.value}
                    style={[
                      styles.paymentOption,
                      isSelected && styles.paymentOptionSelected,
                    ]}
                    onPress={() => {
                      setPaymentMethod(method.value);
                      setPaymentMethodData(method);
                    }}
                    activeOpacity={0.7}
                  >
                    <View style={styles.paymentOptionLeft}>
                      <View style={[styles.methodIconBg, isSelected && { backgroundColor: "rgba(255,255,255,0.2)" }]}>
                        <Feather name={method.icon as any} size={16} color={isSelected ? "#fff" : "#4B5563"} />
                      </View>
                      <Text style={[styles.paymentOptionText, isSelected && styles.paymentOptionTextSelected]}>
                        {method.label}
                      </Text>
                    </View>
                    <View style={[styles.radioCircle, isSelected && styles.radioCircleSelected]}>
                      {isSelected && <View style={styles.radioInnerCircle} />}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* BILLING BREAKDOWN */}
          <View style={[styles.card, { marginBottom: 120 }]}>
            <View style={styles.cardHeader}>
              <Feather name="file-text" size={18} color="#6B7280" style={{ marginRight: 8 }} />
              <Text style={styles.cardTitle}>Chi tiết hóa đơn</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Tiền món ăn</Text>
              <Text style={styles.billingValue}>{subTotalPrice.toLocaleString()} đ</Text>
            </View>
            <View style={styles.billingRow}>
              <Text style={styles.billingLabel}>Phí giao hàng (Ship)</Text>
              <Text style={styles.billingValue}>+{shippingFee.toLocaleString()} đ</Text>
            </View>
            {serviceFee > 0 && (
              <View style={styles.billingRow}>
                <Text style={styles.billingLabel}>Phí dịch vụ</Text>
                <Text style={styles.billingValue}>+{serviceFee.toLocaleString()} đ</Text>
              </View>
            )}
            {selectedVoucher && (
              <View style={styles.billingRow}>
                <Text style={[styles.billingLabel, { color: "#10B981" }]}>Khấu trừ mã giảm giá</Text>
                  <Text style={[styles.billingValue, { color: "#10B981", fontWeight: "600" }]}>-{discountAmount.toLocaleString()} đ</Text>
              </View>
            )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

        {/* FLOATING ACTION BOTTOM BAR */}
        <View style={styles.checkoutFooter}>
          <View style={styles.priceContainer}>
            <Text style={styles.footerLabel}>Tổng thanh toán</Text>
            <Text style={styles.footerPrice}>
              {finalTotalPrice < 0 ? 0 : finalTotalPrice.toLocaleString()} đ
            </Text>
          </View>
          <TouchableOpacity
            style={styles.btnPlaceOrder}
            onPress={handlePlaceOrder}
            activeOpacity={0.8}
          >
            <Text style={styles.btnPlaceOrderText}>Đặt hàng</Text>
            <Feather name="arrow-right" size={16} color="#fff" style={{ marginLeft: 6 }} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 14,
    paddingBottom: 40,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
    borderBottomWidth: 1,
    borderColor: "#F3F4F6",
    paddingBottom: 8,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1F2937",
  },
  noAddressContainer: {
    paddingVertical: 12,
    alignItems: "center",
  },
  noAddressText: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
  },
  addAddressBtn: {
    backgroundColor: colors.blue_primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addAddressBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  addressListContainer: {
    gap: 8,
  },
  addressDetailsBox: {
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 8,
    borderColor: "#E5E7EB",
    borderWidth: 1,
  },
  addressHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  addressTitle: {
    fontSize: 14,
    color: "#1F2937",
    fontWeight: "700",
  },
  defaultBadge: {
    backgroundColor: "#EFF6FF",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderColor: colors.blue_primary,
    borderWidth: 0.5,
  },
  defaultBadgeText: {
    fontSize: 10,
    color: colors.blue_primary,
    fontWeight: "600",
  },
  addressDetail: {
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 18,
  },
  manageAddressBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 6,
    gap: 4,
  },
  manageAddressBtnText: {
    color: colors.blue_primary,
    fontSize: 13,
    fontWeight: "600",
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  productImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#1F2937",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 13,
    color: "#EF4444",
    fontWeight: "700",
    marginBottom: 6,
  },
  quantityControl: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-end",
    backgroundColor: "#F3F4F6",
    borderRadius: 15,
    padding: 3,
  },
  qtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 1,
  },
  qtyText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#1F2937",
    marginHorizontal: 12,
  },
  itemSeparator: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginVertical: 4,
  },
  voucherContainer: {
    gap: 8,
  },
  voucherTicket: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#FECACA",
    borderStyle: "dashed",
    borderRadius: 10,
    backgroundColor: "#FEF2F2",
  },
  voucherSelected: {
    backgroundColor: "#EF4444",
    borderColor: "#EF4444",
    borderStyle: "solid",
  },
  voucherIconBg: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FEE2E2",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  voucherTicketInfo: {
    flex: 1,
  },
  voucherCode: {
    fontSize: 13,
    fontWeight: "700",
    color: "#EF4444",
  },
  voucherLabel: {
    fontSize: 11,
    color: "#7F1D1D",
    marginTop: 2,
  },
  paymentList: {
    gap: 8,
  },
  paymentOption: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
  },
  paymentOptionSelected: {
    backgroundColor: colors.blue_primary,
    borderColor: colors.blue_primary,
  },
  paymentOptionLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  methodIconBg: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  paymentOptionText: {
    fontSize: 13,
    color: "#4B5563",
    fontWeight: "500",
  },
  paymentOptionTextSelected: {
    color: "#fff",
    fontWeight: "700",
  },
  radioCircle: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
  },
  radioCircleSelected: {
    borderColor: "#fff",
  },
  radioInnerCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#fff",
  },
  billingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  billingLabel: {
    fontSize: 13,
    color: "#6B7280",
  },
  billingValue: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "500",
  },
  checkoutFooter: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 8,
  },
  priceContainer: {
    flex: 1,
  },
  footerLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 2,
  },
  footerPrice: {
    fontSize: 18,
    fontWeight: "800",
    color: "#EF4444",
  },
  btnPlaceOrder: {
    backgroundColor: colors.blue_primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: colors.blue_primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  btnPlaceOrderText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
  noteInputContainer: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 4,
  },
  noteInput: {
    fontSize: 14,
    color: "#1F2937",
    minHeight: 48,
    textAlignVertical: "top",
  },
});

export default Order;
