// This is a placeholder for the Communication Automation service page.
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function CommunicationAutomationPage({ searchParams }: { searchParams: { lang: string } }) {
  const lang = searchParams.lang === 'sq' ? 'sq' : 'en';

  const content = {
    sq: {
      title: "Automatizim Komunikimi",
      description: "Integrim i WhatsApp Business API për mesazhe automatike me klientët (rezervime, njoftime, kujtesa). AI që kupton mesazhet dhe i përgjigjet automatikisht pyetjeve të zakonshme (p.sh. oraret, çmimet, disponueshmëria). Lidhje me Instagram DM, Facebook Messenger dhe Google Business Chat për centralizim komunikimi.",
    },
    en: {
      title: "Communication Automation",
      description: "Integration of WhatsApp Business API for automatic messages with customers (reservations, notifications, reminders). AI that understands messages and automatically answers common questions (e.g., schedules, prices, availability). Connection with Instagram DM, Facebook Messenger, and Google Business Chat for centralized communication.",
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
