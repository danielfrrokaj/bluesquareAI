// This is a placeholder for the AI for Tourism & Services service page.
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

export default function TourismAiPage({ searchParams }: { searchParams: { lang: string } }) {
  const lang = searchParams.lang === 'sq' ? 'sq' : 'en';

  const content = {
    sq: {
      title: "AI për Turizëm & Shërbime",
      description: "Chatbot për hotele apo agjenci që sugjeron aktivitete, ture dhe oferta sipas profilit të klientit. Integrim me Booking.com, Airbnb, GetYourGuide, Viator për sinkronizim rezervimesh. Sisteme të vogla AI për analizën e komenteve dhe përmirësimin e shërbimit.",
    },
    en: {
      title: "AI for Tourism & Services",
      description: "Chatbot for hotels or agencies that suggests activities, tours, and offers according to the client's profile. Integration with Booking.com, Airbnb, GetYourGuide, Viator for reservation synchronization. Small AI systems for analyzing comments and improving service.",
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
