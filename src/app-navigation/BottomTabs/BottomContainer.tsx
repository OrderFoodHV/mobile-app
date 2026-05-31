import React, { memo, useEffect } from 'react';
import BottomTabs from './navigation-bottom-tabs';
import { View, Alert } from 'react-native';
import { useSelector, useDispatch } from 'react-redux';
import socket from '../../app-helper/socketHelper';
import { updateAuthInfor } from '../../redux/features/authSlice';

const BottomContainer = ({
  route,
  navigation,
}: {
  route: any;
  navigation: any;
}) => {
  const dispatch = useDispatch();
  const user = useSelector((state: any) => state.auth.user);
  const userId = user?.id;

  useEffect(() => {
    if (!userId) return;

    // Kết nối socket nếu chưa kết nối
    if (!socket.connected) {
      socket.connect();
    }

    // Đăng ký phòng bộ đàm cho User
    socket.emit("register_user", userId);
    console.log(`🔌 [Socket] Đã đăng ký phòng user_room_${userId}`);

    // Lắng nghe sự kiện duyệt cửa hàng thành công
    socket.on("store_approved", (data: any) => {
      console.log("🏪 [Socket] Nhận thông báo duyệt quán thành công:", data);
      
      // Cập nhật ngay quyền người bán vào Redux để truy cập được ngay lập tức
      dispatch(
        updateAuthInfor({
          is_seller: 1,
          storeId: data.storeId,
          storeName: data.storeName,
          storeStatus: "active",
        })
      );

      // Hiển thị thông báo popup cho người dùng
      Alert.alert(
        "Chúc mừng! 🎉",
        data.message || "Yêu cầu mở cửa hàng của bạn đã được duyệt thành công! bạn có thể vào Kênh người bán ngay bây giờ.",
        [{ text: "XÁC NHẬN" }]
      );
    });

    // Lắng nghe sự kiện cửa hàng bị xóa
    socket.on("store_deleted", (data: any) => {
      console.log("🏪 [Socket] Nhận thông báo cửa hàng bị xóa:", data);

      // Cập nhật thu hồi quyền người bán trên Redux
      dispatch(
        updateAuthInfor({
          is_seller: 0,
          storeId: null,
          storeName: null,
          storeStatus: null,
        })
      );

      // Hiển thị thông báo popup cho người dùng
      Alert.alert(
        "Thông báo từ Admin ❌",
        data.message || "Cửa hàng của bạn đã bị Admin xóa khỏi hệ thống. Vui lòng đăng ký lại nếu muốn tiếp tục bán hàng.",
        [{ text: "XÁC NHẬN" }]
      );
    });

    return () => {
      socket.off("store_approved");
      socket.off("store_deleted");
    };
  }, [userId, dispatch]);

  return (
    <View style={{ flex: 1 }} >
      <BottomTabs navigation={navigation} route={route} />
    </View>
  );
};

export default memo(BottomContainer);
