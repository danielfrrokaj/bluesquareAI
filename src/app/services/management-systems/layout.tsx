import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "Sisteme Menaxhimi & Monitorimi",
      subtitle: "Kontroll i plotë dhe vizibilitet në kohë reale mbi operacionet tuaja.",
    },
    en: {
      title: "Management & Monitoring Systems",
      subtitle: "Complete control and real-time visibility over your operations.",
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

export default function ManagementSystemsLayout({ children }: Props) {
    return <>{children}</>;
}