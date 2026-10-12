import { SalesList, type SalesSearch } from "@/components/SalesList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Customers" };

export default async function Page({ searchParams }: { searchParams: Promise<SalesSearch> }) {
  return <SalesList view="customers" sp={await searchParams} />;
}
