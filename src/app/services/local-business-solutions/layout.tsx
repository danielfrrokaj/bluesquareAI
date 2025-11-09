import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "Zgjidhje për Biznese Lokale",
      subtitle: "Fuqizoni restorantin, dyqanin ose shërbimin tuaj me teknologji moderne.",
    },
    en: {
      title: "Solutions for Local Businesses",
      subtitle: "Empower your restaurant, shop, or service with modern technology.",
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

export default function LocalBusinessSolutionsLayout({ children }: Props) {
    return <>{children}</>;
}