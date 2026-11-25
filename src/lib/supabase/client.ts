import { createBrowserClient } from '@supabase/ssr';

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabaseClient = () => {
  if (clientInstance) return clientInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-anon-key';

  clientInstance = createBrowserClient(supabaseUrl, supabaseKey, {
    cookieOptions: {
      name: 'codepilot-auth-token',
      path: '/',
      sameSite: 'lax',
      secure:
        typeof window !== 'undefined'
          ? window.location.protocol === 'https:'
          : process.env.NODE_ENV === 'production',
    },
  });

  return clientInstance;
};

export const supabase = getSupabaseClient();
