// This is a placeholder for the AI Website Integration service page.
// You can add more content and details about this service here.

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function AiWebsiteIntegrationPage({ searchParams }: { searchParams: { lang: string } }) {
  const lang = searchParams.lang === 'sq' ? 'sq' : 'en';

  const content = {
    sq: {
      title: "Integrim i AI në Website",
      description: "Ofrojmë integrim të plotë të inteligjencës artificiale në faqen tuaj të internetit. Kjo përfshin chatbot inteligjent që komunikon me vizitorët dhe jep oferta në kohë reale, analizë automatike të trafikut të faqes për të kuptuar çfarë kërkojnë klientët, dhe gjenerim automatik përshkrimesh, blog-esh, dhe përmbajtje SEO me AI.",
      cta: "Mëso më shumë"
    },
    en: {
      title: "AI Website Integration",
      description: "We offer full integration of artificial intelligence into your website. This includes an intelligent chatbot that communicates with visitors and provides real-time offers, automatic analysis of site traffic to understand what customers are looking for, and automatic generation of descriptions, blogs, and SEO content with AI.",
      cta: "Learn More"
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
        {/* Add more specific details about the service below */}
      </main>
      <Footer lang={lang} />
    </div>
  );
}
