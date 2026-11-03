import { createBrowserClient } from '@supabase/ssr';

export const getSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fdidwqlutymbyrdjjptx.supabase.co';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || 
                      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                      'sb_publishable_JdcfawAzKlJvd5gW9f6Arg_2XeZLOkj';

  return createBrowserClient(supabaseUrl, supabaseKey);
};

export const supabase = getSupabaseClient();
