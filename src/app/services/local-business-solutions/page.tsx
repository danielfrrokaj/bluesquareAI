// This is a placeholder for the Local Business Solutions service page.
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function LocalBusinessSolutionsPage({ searchParams }: { searchParams: { lang: string } }) {
  const lang = searchParams.lang === 'sq' ? 'sq' : 'en';

  const content = {
    sq: {
      title: "Zgjidhje për Biznese Lokale",
      description: "Sisteme për menaxhimin e porosive, pagesave dhe raportimit financiar për restorante, dyqane dhe servise. Platforma për rezervime online, feedback AI-driven dhe lojaltet programs për klientët. App-e të personalizuara për monitorim kamerash ose kontroll të stafit (p.sh. kur hyjnë/dalin nga zyra apo hoteli).",
    },
    en: {
      title: "Solutions for Local Businesses",
      description: "Systems for managing orders, payments, and financial reporting for restaurants, shops, and services. Platforms for online reservations, AI-driven feedback, and loyalty programs for customers. Customized apps for camera monitoring or staff control (e.g., when they enter/leave the office or hotel).",
    }
  }
  const currentContent = content[lang];
  return (
    <div className="flex flex-col min-h-screen">
      <Header lang={lang} />
      <main className="flex-1 container py-12">
        <h1 className="text-4xl font-bold font-headline mb-4">{currentContent.title}</h1>
        <p className="text-lg text-muted-foreground">
         {currentContent.description}
        </p>
      </main>
      <Footer lang={lang} />
    </div>
  );
}
