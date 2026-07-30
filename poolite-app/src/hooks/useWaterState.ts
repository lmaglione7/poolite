import { usePoolProfile } from '../state/PoolProfileContext';
import { useDevState } from '../state/DevStateContext';
import { colors } from '../theme/colors';

/**
 * Cross-tab water urgency, derived from today's "che colore è l'acqua"
 * answer — drives the Shop urgency banner, the tab-bar red dot, and the
 * Acqua score gauge consistently everywhere (per the design brief's
 * "coerenza cross-tab" requirement).
 */
export function useWaterState() {
  const profile = usePoolProfile();
  const dev = useDevState();

  const answeredValue = profile.answeredToday ? profile.waterAnswer?.value : null;
  const urgent = dev.forceUrgentWater || answeredValue === 'verdina';
  const cloudy = !urgent && answeredValue === 'torbida';

  const score = urgent ? 34 : cloudy ? 58 : 86;
  const scoreColor = urgent ? colors.error : cloudy ? colors.amber : colors.accent;
  const scoreLabel = urgent ? 'Serve una mano, oggi' : cloudy ? 'Acqua un po’ stanca' : 'Acqua in gran forma 💙';
  const scoreHint = urgent
    ? 'Niente panico: nello Shop trovi le due cose che servono, nell’ordine giusto.'
    : cloudy
      ? 'Con un flocculante stanotte torna limpida.'
      : 'Continua così: il diario mi aiuta a tenerla perfetta.';

  return { urgent, cloudy, allOk: !urgent && !cloudy, score, scoreColor, scoreLabel, scoreHint };
}
