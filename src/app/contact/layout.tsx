import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
        title: "Na Kontaktoni",
        subtitle: "Keni një pyetje apo dëshironi të punojmë së bashku? Na shkruani.",
    },
    en: {
        title: "Get in Touch",
        subtitle: "Have a question or want to work together? We'd love to hear from you.",
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

export default function ContactLayout({ children }: Props) {
    return <>{children}</>;
}