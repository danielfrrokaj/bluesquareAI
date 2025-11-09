import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "AI për Turizëm & Shërbime",
      subtitle: "Përmirësoni eksperiencën e vizitorëve dhe optimizoni menaxhimin e biznesit tuaj turistik.",
    },
    en: {
      title: "AI for Tourism & Services",
      subtitle: "Enhance the visitor experience and optimize the management of your tourism business.",
    }
  }

type Props = {
  searchParams: { lang?: string };
  children: React.ReactNode;
};

export async function generateMetadata(
  { searchParams }: Props,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const lang = searchParams?.lang === 'sq' ? 'sq' : 'en';
  const content = pageContent[lang];
  
  const title = content.title;
  const description = content.subtitle;
  const locale = lang === 'sq' ? 'sq_AL' : 'en_US';

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      locale: locale,
      images: ['/logo.png'],
    },
    twitter: {
      title: title,
      description: description,
      images: ['/logo.png'],
    },
  };
}

export default function TourismAiLayout({ children }: Props) {
    return <>{children}</>;
}