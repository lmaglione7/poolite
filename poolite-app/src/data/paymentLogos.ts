import type { ImageSourcePropType } from 'react-native';

/**
 * Official payment-brand artwork. Metro needs static `require` calls, so each
 * logo has a commented-out line: drop the file into assets/img/pay/ (see the
 * README there) and uncomment its line — the UI switches from the text badge
 * to the real mark automatically, everywhere at once.
 */
export const PAYMENT_LOGOS: Record<string, ImageSourcePropType | undefined> = {
  // card: require('../../assets/img/pay/card.png'),
  // applepay: require('../../assets/img/pay/applepay.png'),
  // googlepay: require('../../assets/img/pay/googlepay.png'),
  // visa: require('../../assets/img/pay/visa.png'),
  // mastercard: require('../../assets/img/pay/mastercard.png'),
  // amex: require('../../assets/img/pay/amex.png'),
};

export function paymentLogo(key: string): ImageSourcePropType | undefined {
  return PAYMENT_LOGOS[key];
}
