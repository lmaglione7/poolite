import 'react-native-url-polyfill/auto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { env, isSupabaseConfigured } from './env';

// `supabase` is null until EXPO_PUBLIC_SUPABASE_URL / _ANON_KEY are set (see
// .env.example + supabase/README.md). Every call site falls back to local
// mock data/state when this is null, so the app is fully usable before the
// backend project exists.
export const supabase = isSupabaseConfigured
  ? createClient(env.supabaseUrl, env.supabaseAnonKey, {
      auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
      },
    })
  : null;
