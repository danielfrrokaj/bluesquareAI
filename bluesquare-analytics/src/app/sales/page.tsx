import { SalesList, type SalesSearch } from "@/components/SalesList";

export const dynamic = "force-dynamic";
export const metadata = { title: "Leads" };

export default async function Page({ searchParams }: { searchParams: Promise<SalesSearch> }) {
  return <SalesList view="leads" sp={await searchParams} />;
}
