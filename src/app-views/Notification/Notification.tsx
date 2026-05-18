import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import HeaderApp from "@app-components/HeaderApp/HeaderApp";
import { Container, Content } from "@app-layout/Layout";
import { Feather } from "@expo/vector-icons";
import colors from "@assets/colors/global_colors";

interface NotificationItem {
  id: string;
  title: string;
  body: string;
  time: string;
  isRead: boolean;
  type: "order" | "voucher" | "system";
}

const Notification: React.FC = () => {
  // Danh sách data mẫu cực chuẩn nghiệp vụ ăn uống cho sếp lòe hội đồng
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: "1",
      title: "🍳 Đơn hàng đang được chế biến!",
      body: "Món Khoai lang kén của sếp đã được Hương Vị Việt Merchant nhận đơn và bắt đầu nổi lửa chế biến rồi nhen!",
      time: "Vừa xong",
      isRead: false,
      type: "order",
    },
    {
      id: "2",
      title: "🎁 Voucher 20k dành riêng cho sếp HUCE",
      body: "Nhập mã 'DAN_KY_THUAT' giảm ngay 20.000 đ cho đơn hàng từ 50k. Đặt đồ ăn đêm chiến đồ án thôi sếp ơi!",
      time: "2 giờ trước",
      isRead: false,
      type: "voucher",
    },
    {
      id: "3",
      title: "🎉 Đơn hàng #99 đã hoàn thành",
      body: "Đơn hàng của sếp đã giao thành công bởi tài xế Nguyễn Văn Đạt. Chúc sếp ngon miệng nha!",
      time: "Hôm qua",
      isRead: true,
      type: "order",
    },
  ]);

  const markAllAsRead = () => {
    setNotifications(notifications.map((item) => ({ ...item, isRead: true })));
  };

  return (
    <Container style={{ backgroundColor: "#f5f6fa" }}>
      <View style={styles.headerRow}>
        <HeaderApp title="Thông báo của sếp" />
        <TouchableOpacity onPress={markAllAsRead}>
          <Text style={styles.readAllText}>Đọc tất cả</Text>
        </TouchableOpacity>
      </View>

      <Content>
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          scrollEnabled={false}
          renderItem={({ item }) => (
            <View
              style={[
                styles.notiCard,
                { backgroundColor: item.isRead ? "#fff" : "#EBF5FF" },
              ]}
            >
              <View style={styles.iconWrapper}>
                {item.type === "order" && (
                  <Feather
                    name="shopping-bag"
                    size={20}
                    color={colors.blue_primary}
                  />
                )}
                {item.type === "voucher" && (
                  <Feather name="gift" size={20} color="#EF4444" />
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text
                  style={[
                    styles.notiTitle,
                    { fontWeight: item.isRead ? "600" : "700" },
                  ]}
                >
                  {item.title}
                </Text>
                <Text style={styles.notiBody}>{item.body}</Text>
                <Text style={styles.notiTime}>{item.time}</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={() => (
            <View style={{ alignItems: "center", marginTop: 50 }}>
              <Text style={{ color: "#999" }}>
                Hộp thư thông báo trống trải sếp ơi!
              </Text>
            </View>
          )}
        />
      </Content>
    </Container>
  );
};

const styles = StyleSheet.create({
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: colors.blue_primary,
    paddingRight: 16,
    paddingTop: 10,
    paddingBottom: 10,
  },
  readAllText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 13,
    marginTop: 14,
  },
  notiCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    alignItems: "flex-start",
  },
  iconWrapper: { backgroundColor: "#F3F4F6", padding: 10, borderRadius: 50 },
  notiTitle: { fontSize: 15, color: "#111827" },
  notiBody: { fontSize: 13, color: "#4B5563", marginTop: 4, lineHeight: 18 },
  notiTime: { fontSize: 11, color: "#9CA3AF", marginTop: 6 },
});

export default Notification;
