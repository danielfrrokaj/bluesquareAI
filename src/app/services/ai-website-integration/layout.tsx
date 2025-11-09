import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "Integrim i AI në Website",
      subtitle: "Transformoni faqen tuaj në një mjet inteligjent marketingu dhe shërbimi ndaj klientit.",
    },
    en: {
      title: "AI Website Integration",
      subtitle: "Transform your website into an intelligent marketing and customer service tool.",
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

export default function AiWebsiteIntegrationLayout({ children }: Props) {
    return <>{children}</>;
}