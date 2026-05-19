import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import HeaderApp from "@app-components/HeaderApp/HeaderApp";
import { Container, Content } from "@app-layout/Layout";
import { Feather, MaterialIcons } from "@expo/vector-icons";
import colors from "@assets/colors/global_colors";
import { useSelector, shallowEqual } from "react-redux";
import { RootState } from "@redux/store";
import useCallAPI from "@app-helper/useCallAPI";
import URL_API from "@app-helper/urlAPI";

const Notification: React.FC = () => {
  const { tokenData } = useSelector(
    (state: RootState) => state.auth,
    shallowEqual,
  );
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // 🚀 GỌI API THẬT LẤY THÔNG BÁO TỪ BACKEND MYSQL
  const fetchNotifications = async () => {
    if (!tokenData) return;
    setLoading(true);
    try {
      const response = await useCallAPI({
        method: "GET",
        url: `${URL_API}/notifications`,
        token: tokenData,
      });
      if (response && Array.isArray(response.data)) {
        setNotifications(response.data);
      }
    } catch (error) {
      console.log("Lỗi tải thông báo:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, [tokenData]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  return (
    <Container style={{ backgroundColor: "#f5f6fa" }}>
      <View style={styles.headerRow}>
        <HeaderApp title="Thông báo của sếp" />
      </View>

      {loading && notifications.length === 0 ? (
        <ActivityIndicator
          size="large"
          color={colors.blue_primary}
          style={{ marginTop: 40 }}
        />
      ) : (
        <Content>
          <FlatList
            data={notifications}
            keyExtractor={(item, index) =>
              item.id?.toString() || index.toString()
            }
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            scrollEnabled={false}
            renderItem={({ item }) => (
              <View
                style={[
                  styles.notiCard,
                  { backgroundColor: item.is_read ? "#fff" : "#EBF5FF" },
                ]}
              >
                <View style={styles.iconWrapper}>
                  {item.type === "order" ? (
                    <Feather
                      name="shopping-bag"
                      size={20}
                      color={colors.blue_primary}
                    />
                  ) : (
                    <Feather name="gift" size={20} color="#EF4444" />
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
                    {item.comment_text || item.body}
                  </Text>
                  <Text style={styles.notiTime}>
                    {item.created_at
                      ? new Date(item.created_at).toLocaleDateString()
                      : ""}
                  </Text>
                </View>
              </View>
            )}
            ListEmptyComponent={() => (
              <View style={{ alignItems: "center", marginTop: 50 }}>
                <Text style={{ color: "#999" }}>
                  Hộp thư trống trải sếp ơi!
                </Text>
              </View>
            )}
          />
        </Content>
      )}
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
