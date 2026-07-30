import { useState } from 'react';
import { View, Image, StyleSheet, ViewStyle } from 'react-native';
import { PRODUCT_IMAGES } from '../data/productImages';
import { colors } from '../theme/colors';

// Product visual. When a real photo URL exists (products.image_url, loaded by
// useCatalog) it renders that; the flat SVG illustration is the fallback for
// products without photos yet and while a photo fails/loads. Pass `imageUrl`
// wherever the full product object is available.
export function ProductImage({
  productId,
  imageUrl,
  width,
  height = width,
  radius = 14,
  style,
}: {
  productId: string;
  imageUrl?: string | null;
  width: number;
  height?: number;
  radius?: number;
  style?: ViewStyle;
}) {
  const [failed, setFailed] = useState(false);
  const Svg = PRODUCT_IMAGES[productId];
  const showPhoto = !!imageUrl && !failed;

  return (
    <View style={[styles.wrap, { width, height, borderRadius: radius }, style]}>
      {showPhoto ? (
        <Image
          source={{ uri: imageUrl! }}
          style={{ width: '100%', height: '100%' }}
          resizeMode="cover"
          onError={() => setFailed(true)}
        />
      ) : (
        Svg && <Svg width="100%" height="100%" preserveAspectRatio="xMidYMid slice" />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    backgroundColor: colors.selectedBg,
    overflow: 'hidden',
  },
});
