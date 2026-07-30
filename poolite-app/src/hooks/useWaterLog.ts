import { supabase } from '../lib/supabase';
import { useAuth } from '../state/AuthContext';
import { usePoolProfile, WaterColor } from '../state/PoolProfileContext';

/** Wraps the local water-answer/treatment-log state with a best-effort push
 * to Supabase (`water_logs` / `treatment_logs`) when signed in. */
export function useWaterLog() {
  const { user } = useAuth();
  const profile = usePoolProfile();

  async function answer(color: WaterColor) {
    profile.answerWaterQuestion(color);
    if (supabase && user) {
      await supabase.from('water_logs').upsert({ user_id: user.id, color, answered_on: new Date().toISOString().slice(0, 10) });
    }
  }

  async function logTreatment(name: string, emoji: string) {
    profile.logTreatment(name, emoji);
    if (supabase && user) {
      await supabase.from('treatment_logs').insert({ user_id: user.id, name, emoji });
    }
  }

  return { answer, logTreatment };
}
