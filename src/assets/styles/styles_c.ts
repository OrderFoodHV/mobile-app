import { StyleSheet, Dimensions, Platform } from 'react-native';
import sizes from '@assets/styles/sizes';
const styles_c = StyleSheet.create({
  overlay: {
    zIndex: 99999999999,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF00',
    justifyContent: 'center',
    alignItems: 'center',
  },
  view_title: {
    height: sizes.height_item,
    justifyContent: 'center',
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F2',
  },
  view_height_row_bw: {
    height: sizes.height_item,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  view_height_start: {
    height: sizes.height_item,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  view_height_center: {
    height: sizes.height_item,
    justifyContent: 'center',
    alignItems: 'center',
  },
  view_height_start_p16: {
    height: sizes.height_item,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
  },
  view_height_center_p16: {
    height: sizes.height_item,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  view_avatar: {
    height: sizes._70sdp,
    width: sizes._70sdp,
    borderRadius: sizes._35sdp,
    justifyContent: 'center',
    alignItems: 'center',
  },
  box_shadow: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  box_shadow_big: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: {
      width: 2,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  headerStyle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: sizes._20sdp,
    borderBottomWidth: 1,
    borderColor: '#D7D7D7',
    paddingTop: Platform.OS == 'ios' ? 0 : sizes._10sdp,
    paddingBottom: sizes._10sdp,
  },
  row_start: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  row_between: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  row_center: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  row_end: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  row_around: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  row_direction_align_center: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  col_center: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  border_bottom: {
    borderBottomWidth: 1,
    borderColor: '#D7D7D7',
  },
  border: {
    borderWidth: 1,
    borderColor: '#D7D7D7',
  },
  font_text_6_400: {
    fontSize: sizes._6sdp,
    fontWeight: '400',

  },
  font_text_6_600: {
    fontSize: sizes._6sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',

  },
  font_text_8_400: {
    fontSize: sizes._8sdp,
    fontWeight: '400',

  },
  font_text_8_600: {
    fontSize: sizes._8sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',

  },
  font_text_10_400: {
    fontSize: sizes._10sdp,
    fontWeight: '400',

  },
  font_text_10_600: {
    fontSize: sizes._10sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',

  },
  font_text_12_400: {
    fontSize: sizes._12sdp,
    fontWeight: '400',

  },
  font_text_12_600: {
    fontSize: sizes._12sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',

  },
  font_text_14_400: {
    fontSize: sizes._14sdp,
    fontWeight: '400',

  },
  font_text_14_600: {
    fontSize: sizes._14sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',

  },
  font_text_16_400: {
    fontSize: sizes._16sdp,
    fontWeight: '400',
  },
  font_text_16_600: {
    fontSize: sizes._16sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',
  },
  font_text_18_400: {
    fontSize: sizes._18sdp,
    fontWeight: '400',

  },
  font_text_18_600: {
    fontSize: sizes._18sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',

  },
  font_text_20_400: {
    fontSize: sizes._20sdp,
    fontWeight: '400',

  },
  font_text_20_600: {
    fontSize: sizes._20sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',

  },
  font_text_22_400: {
    fontSize: sizes._22sdp,
    fontWeight: '400',

  },
  font_text_22_600: {
    fontSize: sizes._22sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',
  },
  font_text_24_400: {
    fontSize: sizes._24sdp,
    lineHeight: sizes._24sdp,
    fontWeight: '400',
  },
  font_text_24_600: {
    fontSize: sizes._24sdp,
    lineHeight: sizes._24sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',
  },
  font_text_26_400: {
    fontSize: sizes._26sdp,
    lineHeight: sizes._26sdp,
    fontWeight: '400',
  },
  font_text_26_600: {
    fontSize: sizes._26sdp,
    lineHeight: sizes._26sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',
  },
  font_text_28_400: {
    fontSize: sizes._28sdp,
    lineHeight: sizes._28sdp,
    fontWeight: '400',
  },
  font_text_28_600: {
    fontSize: sizes._28sdp,
    lineHeight: sizes._28sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',
  },
  font_text_30_400: {
    fontSize: sizes._30sdp,
    fontWeight: '400',
    lineHeight: sizes._30sdp
  },
  font_text_30_600: {
    fontSize: sizes._30sdp,
    lineHeight: sizes._30sdp,
    fontWeight: Platform.OS == 'ios' ? '600' : '700',
  },

});
export default styles_c;
