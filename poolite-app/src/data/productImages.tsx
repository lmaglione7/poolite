import type { FC } from 'react';
import type { SvgProps } from 'react-native-svg';
import Shock from '../../assets/img/prod-shock.svg';
import Antialghe from '../../assets/img/prod-antialghe.svg';
import Cloro5 from '../../assets/img/prod-cloro5.svg';
import Floc from '../../assets/img/prod-floc.svg';
import Telo from '../../assets/img/prod-telo.svg';
import Retino from '../../assets/img/prod-retino.svg';
import Kit from '../../assets/img/prod-kit.svg';
import Robot from '../../assets/img/prod-robot.svg';
import Sale25 from '../../assets/img/prod-sale25.svg';
import Doccia from '../../assets/img/prod-doccia.svg';
import PompaCalore from '../../assets/img/prod-pompacalore.svg';
import LuciLed from '../../assets/img/prod-luciled.svg';
import Filtro from '../../assets/img/prod-filtro.svg';

// Static map so Metro can bundle each SVG (dynamic `require` by string isn't supported).
export const PRODUCT_IMAGES: Record<string, FC<SvgProps>> = {
  shock: Shock,
  antialghe: Antialghe,
  cloro5: Cloro5,
  floc: Floc,
  telo: Telo,
  retino: Retino,
  kit: Kit,
  robot: Robot,
  sale25: Sale25,
  doccia: Doccia,
  pompacalore: PompaCalore,
  luciled: LuciLed,
  filtro: Filtro,
};
