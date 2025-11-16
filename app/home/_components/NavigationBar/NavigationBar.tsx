// @/app/_components/NavigationBar/NavigationBar.tsx
"use client";

import { useEffect } from "react"
import Link from "next/link";
import useSWR from "swr";
import { SlUser, SlBasket } from "react-icons/sl";
import Dropdown from "./_components/Dropdown";
import { useLanguage } from "@/components/LanguageProvider";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import { useAppLoading } from "@/components/AppLoadingProvider";

type NavRow = {
  id: number;
  lang_code: string;
  label: string;
  href: string | null;
  parent_id: number | null;
};
type NavNode = NavRow & { children: NavNode[] };

const fetcher = async (lang: string) => {
  const supabase = createSupabaseBrowserClient();

  const { data, error } = await supabase
    .from("navigation_links")
    .select("id, lang_code, label, href, parent_id")
    .eq("lang_code", lang)
    .order("parent_id", { ascending: true })
    .order("id", { ascending: true });

  if (error) throw error;

  const rows = (data ?? []) as NavRow[];

  const tree: NavNode[] = [];
  const map = new Map<number, NavNode>();

  // Kayıtları map’e koy
  rows.forEach((item) => {
    map.set(item.id, { ...item, children: [] });
  });


  // Parent-child ilişkisi kur
  rows.forEach((item) => {
    const node = map.get(item.id)!;
    if (item.parent_id) {
      const parent = map.get(item.parent_id);
      if (parent) parent.children.push(node);
    } else {
      tree.push(node);
    }
  });

  return tree;
};

// Yeni: site_name çekici
const fetchSiteName = async () => {
  const supabase = createSupabaseBrowserClient();
  const { data, error } = await supabase
    .from("site_settings")
    .select("site_name")
    .limit(1)
    .single();

  if (error) throw error;
  return (data?.site_name as string) ?? "Nost Copy";
};

export default function NavigationBar() {
  const { lang } = useLanguage();

  const { start, stop } = useAppLoading();


  const { data: nav, isLoading } = useSWR<NavNode[]>(
    `nav-${lang}`,
    () => fetcher(lang),
    { revalidateOnFocus: false }
  );

  // site_name için SWR
  const { data: siteName = "Nost Copy" } = useSWR("site_name", fetchSiteName, { revalidateOnFocus: false });

  useEffect(() => {
    if (isLoading) {
      start();
    } else {
      stop();
    }
  }, [isLoading, start, stop]);

  return (
    <div className="relative w-full max-w-7xl h-24 flex items-center justify-between font-onest font-semibold">
      <div className="text-3xl font-poppins font-bold">
        <Link href={"/"}>{siteName}</Link>
      </div>

      <ul className="flex space-x-8 items-center">
        {nav?.map((item: NavNode) =>
          item.children.length > 0 ? (
            <li key={item.id}>
              <Dropdown
                label={item.label}
                items={item.children.map((c: NavNode) => ({
                  label: c.label,
                  href: c.href,
                }))}
              />
            </li>
          ) : (
            <li key={item.id} className="text-gray-700 hover:text-blue-500">
              <Link href={item.href ?? "#"}>{item.label}</Link>
            </li>
          )
        )}
      </ul>

      <div className="flex flex-row text-xl gap-4">
        <SlUser className="cursor-pointer" />
        <SlBasket className="cursor-pointer" />
      </div>
    </div>
  );
}
