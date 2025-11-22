import { notFound } from "next/navigation";
import TopHorizontalBanner from "@/app/home/_components/TopHorizontalBanner/topHorizontalBanner";
import NavigationBar from "@/app/home/_components/NavigationBar/NavigationBar";

type Props = {
  params: Promise<{
    slug: string;
  }>;
};

// List of valid collection slugs
const VALID_SLUGS = ["product-labels", "packaging-labels", "barcode-labels"];

// Generate static params for known collection pages
export async function generateStaticParams() {
  return VALID_SLUGS.map((slug) => ({
    slug,
  }));
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  
  // Check if the slug is valid
  if (!VALID_SLUGS.includes(slug)) {
    notFound();
  }

  // Convert slug to a readable title
  const title = slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return (
    <div className="flex flex-col justify-center items-center w-full">
      <TopHorizontalBanner />
      <NavigationBar />
      <div className="max-w-7xl w-full px-6 py-12">
        <h1 className="text-4xl font-bold mb-6">{title}</h1>
        <p className="text-lg text-gray-600">
          This is the {title.toLowerCase()} collection page. Content coming soon.
        </p>
      </div>
    </div>
  );
}
