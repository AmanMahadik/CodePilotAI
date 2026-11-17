import { createBrowserClient } from '@supabase/ssr';

let clientInstance: ReturnType<typeof createBrowserClient> | null = null;

export const getSupabaseClient = () => {
  if (clientInstance) return clientInstance;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fdidwqlutymbyrdjjptx.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                      'sb_publishable_JdcfawAzKlJvd5gW9f6Arg_2XeZLOkj';

  clientInstance = createBrowserClient(supabaseUrl, supabaseKey, {
    cookieOptions: {
      name: 'codepilot-auth-token',
      path: '/',
      sameSite: 'lax',
      secure: false, // Ensure cookies are readable on http://localhost
    },
  });

  return clientInstance;
};

export const supabase = getSupabaseClient();
