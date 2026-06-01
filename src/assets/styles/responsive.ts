import sizes from "./sizes";

class ResponsiveScreen {
  // h = height
  h_less_than_480px(v1: any, v2: any) {
    return sizes._screen_height < 480 ? v1 : v2;
  }

  h_between_481px_and_767px(v1: any, v2: any) {
    return (sizes._screen_height >= 481 && sizes._screen_height <= 767) ? v1 : v2;
  }

  h_between_768px_and_1024px(v1: any, v2: any) {
    return (sizes._screen_height >= 768 && sizes._screen_height <= 1024) ? v1 : v2;
  }

  h_bigger_767px(v1: any, v2: any) {
    return sizes._screen_height > 767 ? v1 : v2;
  }

  h_less_768px(v1: any, v2: any) {
    return sizes._screen_height < 768 ? v1 : v2;
  }

  h_667px(v1: any, v2: any) {
    return sizes._screen_height === 667 ? v1 : v2;
  }

  h_between_667px_and_896px(v1: any, v2: any) {
    return (sizes._screen_height >= 667 && sizes._screen_height <= 896) ? v1 : v2;
  }

  h_812px(v1: any, v2: any) {
    return sizes._screen_height === 812 ? v1 : v2;
  }

  h_844px(v1: any, v2: any) {
    return sizes._screen_height === 844 ? v1 : v2;
  }

  h_926px(v1: any, v2: any) {
    return sizes._screen_height === 926 ? v1 : v2;
  }

  h_1600px(v1: any, v2: any) {
    return sizes._screen_height === 1600 ? v1 : v2;
  }
}
const responsive_screen = new ResponsiveScreen()

export default responsive_screen;
