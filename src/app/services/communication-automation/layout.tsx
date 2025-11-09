import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "Automatizim Komunikimi",
      subtitle: "Lidhuni me klientët tuaj në çdo platformë, në mënyrë automatike dhe efikase.",
    },
    en: {
      title: "Communication Automation",
      subtitle: "Connect with your customers on any platform, automatically and efficiently.",
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
  const featuredImage = 'https://images.unsplash.com/photo-1611262588024-d12430b98920?q=80&w=1974&auto=format&fit=crop'; // Communication Automation image

  return {
    title: title,
    description: description,
    openGraph: {
      title: title,
      description: description,
      locale: locale,
      images: [
        {
          url: featuredImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: title,
      description: description,
      images: [featuredImage],
    },
  };
}

export default function CommunicationAutomationLayout({ children }: Props) {
    return <>{children}</>;
}