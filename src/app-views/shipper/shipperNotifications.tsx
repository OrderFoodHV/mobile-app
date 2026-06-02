import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
  StatusBar,
  TouchableOpacity,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Feather, Ionicons } from "@expo/vector-icons";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@redux/store";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";
import socket from "@app-helper/socketHelper";

const ShipperNotifications: React.FC = () => {
  const auth = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  const tokenData = auth?.tokenData;
  const userObj = (auth as any)?.user;
  const userId = userObj?.id;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!tokenData) return;
    setLoading(true);
    try {
      const response = await useCallAPI({
        method: "GET",
        url: `${URL_API}/notifications?role=shipper`,
        token: tokenData,
      });
      if (response && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else if (Array.isArray(response)) {
        setNotifications(response);
      }
    } catch (error) {
      console.log("Lỗi tải thông báo tài xế:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleReadAll = async () => {
    if (!tokenData) return;
    try {
      await useCallAPI({
        method: "POST",
        url: `${URL_API}/notifications/read-all`,
        token: tokenData,
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, is_read: 1 })));
    } catch (error) {
      console.log("Lỗi đánh dấu đã đọc:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    if (userId) {
      socket.emit("register_user", userId);
      console.log(`🔌 Tài xế đã nối sóng register_user từ ShipperNotifications thành công với ID: ${userId}`);
    }

    // Lắng nghe thông báo nổ đơn / cuốc xe mới / cộng thu nhập
    socket.on("receive_notification", (newNoti) => {
      console.log("🏍️ TÀI XẾ ĐÃ HỨNG THÀNH CÔNG THÔNG BÁO:", newNoti);
      setNotifications((prev) => {
        if (newNoti.id && prev.some((n) => n.id === newNoti.id)) {
          return prev;
        }
        return [newNoti, ...prev];
      });
    });

    return () => {
      socket.off("receive_notification");
    };
  }, [tokenData, userId]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
      <StatusBar barStyle="light-content" backgroundColor="#F97316" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo tài xế</Text>
        <TouchableOpacity onPress={handleReadAll} style={styles.readAllBtn}>
          <Feather name="check-square" size={20} color="#ffffff" />
        </TouchableOpacity>
      </View>

      {loading && notifications.length === 0 ? (
        <ActivityIndicator
          size="large"
          color="#F97316"
          style={{ marginTop: 40 }}
        />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={notifications}
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            renderItem={({ item }) => (
              <View
                style={[
                  styles.notiCard,
                  { backgroundColor: item.is_read ? "#fff" : "#FFF7ED" },
                ]}
              >
                <View style={[styles.iconWrapper, { backgroundColor: item.is_read ? "#E5E7EB" : "#FFEDD5" }]}>
                  {item.type === "order" || item.title.includes("cộng") || item.title.includes("Thu nhập") ? (
                    <Feather
                      name="trending-up"
                      size={20}
                      color="#EA580C"
                    />
                  ) : (
                    <Feather name="bell" size={20} color="#EA580C" />
                  )}
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text
                    style={[
                      styles.notiTitle,
                      { fontWeight: item.is_read ? "500" : "700" },
                    ]}
                  >
                    {item.title}
                  </Text>
                  <Text style={styles.notiBody}>
                    {item.content || item.message}
                  </Text>
                  <Text style={styles.notiTime}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleString("vi-VN")
                      : ""}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={styles.emptyContainer}>
                <Ionicons name="notifications-off-outline" size={60} color="#9CA3AF" />
                <Text style={styles.emptyText}>Chưa có thông báo nào!</Text>
              </View>
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#F97316",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  headerTitle: {
    color: "#ffffff",
    fontSize: 22,
    fontWeight: "bold",
  },
  readAllBtn: {
    padding: 4,
  },
  notiCard: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
    alignItems: "flex-start",
  },
  iconWrapper: { padding: 10, borderRadius: 50 },
  notiTitle: { fontSize: 15, color: "#111827" },
  notiBody: { fontSize: 13, color: "#4B5563", marginTop: 4, lineHeight: 18 },
  notiTime: { fontSize: 11, color: "#9CA3AF", marginTop: 6 },
  emptyContainer: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 10, color: "#9CA3AF", fontSize: 15 },
});

export default ShipperNotifications;
