import { Alert } from 'react-native';

type ToastType = 'success' | 'error' | 'info' | 'tomatoToast';

const defaultTitles: Record<ToastType, string> = {
  success: 'Thành công',
  error: 'Có lỗi xảy ra',
  info: 'Thông báo',
  tomatoToast: 'Thông báo',
};

const showToastApp = ({
  type = 'info',
  title,
  text,
}: {
  type?: ToastType;
  title?: string;
  text?: string;
  position?: 'top' | 'bottom';
}) => {
  Alert.alert(title || defaultTitles[type], text || '');
};

export default showToastApp;
