import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export default async function DebugAdmin() {
    const cookieStore = await cookies();
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY! || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll().map(c => ({ name: c.name, value: c.value }));
                },
                setAll() { },
            },
        }
    );

    const { data: { user } } = await supabase.auth.getUser();

    return (
        <pre style={{ padding: 16 }}>
            {JSON.stringify({
                cookies: cookieStore.getAll(),
                user,
            }, null, 2)}
        </pre>
    );
}