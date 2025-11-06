// This is a placeholder for the Management & Monitoring Systems service page.
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function ManagementSystemsPage({ searchParams }: { searchParams: { lang: string } }) {
  const lang = searchParams.lang === 'sq' ? 'sq' : 'en';

  const content = {
    sq: {
      title: "Sisteme Menaxhimi & Monitorimi",
      description: "Mini-PMS (Property Management System) për hotele, apartamente dhe biznese të akomodimit. Dashboard inteligjent për menaxhimin e shitjeve, rezervimeve dhe financave. Integrim me kamera sigurie dhe AI Vision për numërim vizitorësh, detektim lëvizjesh, dhe raporte kohe për staf apo klientë.",
    },
    en: {
      title: "Management & Monitoring Systems",
      description: "Mini-PMS (Property Management System) for hotels, apartments, and accommodation businesses. Intelligent dashboard for managing sales, reservations, and finances. Integration with security cameras and AI Vision for visitor counting, motion detection, and time reports for staff or clients.",
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
