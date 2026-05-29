import React from 'react';
import { Image as ExpoImage, type ImageProps as ExpoImageProps } from 'expo-image';
import URL_API from '../app-helper/urlAPI';

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

const resolveImageUrl = (uri: string): string => {
  if (!uri || typeof uri !== 'string') return '';
  if (uri.includes('/uploads/')) {
    const filename = uri.split('/uploads/').pop();
    if (filename) {
      return `${URL_API}/uploads/${filename}`;
    }
  }
  return uri;
};

const AppImage: React.FC<AppImageProps> & {
  resizeMode: Record<AppImageResizeMode, AppImageResizeMode>;
} = ({ resizeMode = 'cover', transition = 120, source, ...props }) => {
  let resolvedSource = source;

  if (source && typeof source === 'object' && 'uri' in source) {
    let uri = source.uri;
    if (
      !uri ||
      typeof uri !== 'string' ||
      uri.trim() === '' ||
      uri === 'null' ||
      uri === 'undefined' ||
      uri.includes('via.placeholder.com') ||
      uri.includes('placeholder')
    ) {
      resolvedSource = require("@assets/images/default_food.png");
    } else {
      resolvedSource = { ...source, uri: resolveImageUrl(uri) };
    }
  } else if (!source) {
    resolvedSource = require("@assets/images/default_food.png");
  }

  return <ExpoImage source={resolvedSource} transition={transition} contentFit={resizeModeMap[resizeMode]} {...props} />;
};

AppImage.resizeMode = {
  cover: 'cover',
  contain: 'contain',
  stretch: 'stretch',
  center: 'center',
};

export default AppImage;
