import Wordmark from '../../assets/img/logo-poolite.svg';
import Icon from '../../assets/img/logo-poolite-icon.svg';

// Turquoise→petrolio feather wordmark with an amber spark and a water drop,
// shown at the top of every screen per the design brief.
export function PooliteLogo({ height = 30 }: { height?: number }) {
  return <Wordmark height={height} width={height * 3.2} />;
}

export function PooliteIcon({ size = 40 }: { size?: number }) {
  return <Icon width={size} height={size} />;
}
