import { notFound } from "next/navigation";
import { productSlugs, type ProductSlug } from "@/content/data";
import { ProductPage, productMetadata } from "@/views/Product";

type Props = { params: Promise<{ slug: string }> };

export const dynamicParams = false;
export const generateStaticParams = () => productSlugs.map((slug) => ({ slug }));

const isProduct = (slug: string): slug is ProductSlug => (productSlugs as readonly string[]).includes(slug);

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  return isProduct(slug) ? productMetadata("en", slug) : {};
}

export default async function Page({ params }: Props) {
  const { slug } = await params;
  if (!isProduct(slug)) notFound();
  return <ProductPage lang="en" slug={slug} />;
}
