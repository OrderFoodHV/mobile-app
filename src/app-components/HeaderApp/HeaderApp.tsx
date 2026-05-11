import colors from "@assets/colors/global_colors";
import sizes from "@assets/styles/sizes";
import styles_c from "@assets/styles/styles_c";
import { View, Text } from "react-native";

interface HeaderAppProps {
  title: string;
  iconLeft?: any
  iconRight?: any;
  style?: any;
}

const HeaderApp: React.FC<HeaderAppProps> = ({ title, iconLeft, iconRight, style }) => {
  return (
    <View style={[{ ...styles_c.row_between, marginHorizontal: 10 }, style]}>
      {iconLeft && (
        <View>
          {iconLeft}
        </View>
      )}
      <Text style={{fontWeight: '600' , fontSize: sizes._30sdp, color: colors.text_white}}>
        {title}
      </Text>
      {iconRight && (
        <View>
          {iconRight}
        </View>
      )}
    </View>
  );
};

export default HeaderApp;
