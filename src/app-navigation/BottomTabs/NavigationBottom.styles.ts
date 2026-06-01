import sizes from '@assets/styles/sizes';
import { Platform, StyleSheet } from 'react-native';

export default StyleSheet.create({
  viewTab: {
    flexDirection: 'row',
    backgroundColor: 'white',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    height: Platform.OS === 'ios' ? sizes._95sdp : sizes._90sdp,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  btnBottom: {
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
    height: '100%',
    gap:2
  },
  container: {
    backgroundColor: 'transparent',
    paddingTop: 5,
    position: 'absolute',
    bottom: 0,
    right: 0,
    left: 0,
  },
});
