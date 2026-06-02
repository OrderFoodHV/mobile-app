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
import { RootState } from "../src/redux/store";
import useCallAPI from "../src/app-helper/useCallAPI";
import URL_API from "../src/app-helper/urlAPI";
import socket from "../src/app-helper/socketHelper";

const StoreNotifications: React.FC = () => {
  const { tokenData, account } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const fetchNotifications = async () => {
    if (!tokenData) return;
    setLoading(true);
    try {
      const response = await useCallAPI({
        method: "GET",
<<<<<<< HEAD
        url: `${URL_API}/notifications?role=store`,
        token: tokenData,
      });
      if (response && Array.isArray(response.data)) {
        setNotifications(response.data);
      } else if (Array.isArray(response)) {
        setNotifications(response);
=======
        url: `${URL_API}/notifications`,
        token: tokenData,
      });
      if (response && Array.isArray(response.data)) {
        setNotifications(response.data.filter((n: any) => n.target_role === "store"));
      } else if (Array.isArray(response)) {
        setNotifications(response.filter((n: any) => n.target_role === "store"));
>>>>>>> 2f851c94ce818622a8cddf9cfd1048b05de2a084
      }
    } catch (error) {
      console.log("Lỗi tải thông báo cửa hàng:", error);
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

<<<<<<< HEAD
    if (account?.storeId) {
      socket.emit("register_store", account.storeId);
      console.log(`🔌 Quán đã nối sóng thành công từ StoreNotifications vào phòng: store_room_\${account.storeId}`);
    }

    // Lắng nghe thông báo nổ đơn / thanh toán trực tuyến thời gian thực cho Shop
    socket.on("receive_notification", (newNoti) => {
      console.log("🔔 CỬA HÀNG ĐÃ HỨNG THÀNH CÔNG THÔNG BÁO:", newNoti);
      setNotifications((prev) => {
        if (newNoti.id && prev.some((n) => n.id === newNoti.id)) {
          return prev;
        }
        return [newNoti, ...prev];
      });
=======
    // Lắng nghe thông báo nổ đơn / thanh toán trực tuyến thời gian thực cho Shop
    socket.on("receive_notification", (newNoti) => {
      console.log("🔔 CỬA HÀNG ĐÃ HỨNG THÀNH CÔNG THÔNG BÁO:", newNoti);
      setNotifications((prev) => [newNoti, ...prev]);
>>>>>>> 2f851c94ce818622a8cddf9cfd1048b05de2a084
    });

    return () => {
      socket.off("receive_notification");
    };
<<<<<<< HEAD
  }, [tokenData, account?.storeId]);
=======
  }, [tokenData]);
>>>>>>> 2f851c94ce818622a8cddf9cfd1048b05de2a084

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "#F3F4F6" }}>
      <StatusBar barStyle="light-content" backgroundColor="#F97316" />
      
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Thông báo cửa hàng</Text>
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
                  {item.type === "order" || item.title.includes("thanh toán") ? (
                    <Feather
                      name="dollar-sign"
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

export default StoreNotifications;
