import { SalesList, type SalesSearch } from "@/components/SalesList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Archive" };

export default async function Page({ searchParams }: { searchParams: Promise<SalesSearch> }) {
  return <SalesList view="archive" sp={await searchParams} />;
}
