// @/app/_components/NavigationBar/_components/Dropdown.tsx

"use client";
import Link from "next/link";

type NavItem = { label: string; href?: string | null };

type DropdownProps = {
  label: string;
  items: NavItem[];
};

export default function Dropdown({ label, items }: DropdownProps) {
  return (
    <div className="relative group py-8">
      <button className="text-gray-700 hover:text-blue-500 cursor-pointer flex items-center gap-1">
        {label}
      </button>

      <ul
        className="absolute top-full -mt-4 left-0 bg-white border border-gray-200 shadow-lg rounded-md py-2 w-48
        opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-300 z-10"
      >
        {items.map((item, index) => (
          <li key={`${item.label}-${index}`} className="px-4 py-2 whitespace-nowrap">
            {item.href ? (
              <Link
                href={item.href}
                className="text-gray-700 hover:text-blue-500 block"
              >
                {item.label}
              </Link>
            ) : (
              <span className="text-gray-700">{item.label}</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
