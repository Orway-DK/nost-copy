// /lib/supabase/client.ts

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

/**
 * Tarayıcı (Client) tarafında kullanılacak Supabase client.
 * Örnek: useEffect, form submit, SWR gibi işlemlerde.
 */
export const createSupabaseBrowserClient = () => createClientComponentClient();
