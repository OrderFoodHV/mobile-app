import React from 'react';
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';

type AppImageResizeMode = 'cover' | 'contain' | 'stretch' | 'center';

type AppImageProps = Omit<ExpoImageProps, 'contentFit'> & {
  resizeMode?: AppImageResizeMode;
};

const resizeModeMap: Record<AppImageResizeMode, 'cover' | 'contain' | 'fill'> = {
  cover: 'cover',
  contain: 'contain',
  stretch: 'fill',
  center: 'contain',
};

const AppImage: React.FC<AppImageProps> & {
  resizeMode: Record<AppImageResizeMode, AppImageResizeMode>;
} = ({ resizeMode = 'cover', transition = 120, ...props }) => {
  return <ExpoImage {...props} transition={transition} contentFit={resizeModeMap[resizeMode]} />;
};

AppImage.resizeMode = {
  cover: 'cover',
  contain: 'contain',
  stretch: 'stretch',
  center: 'center',
};

export default AppImage;
