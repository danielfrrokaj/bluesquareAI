import type { Metadata, ResolvingMetadata } from 'next';

const pageContent = {
    sq: {
      title: "Çmime Fleksibël për Çdo Biznes",
      subtitle: "Zgjidhni shërbimet që ju nevojiten dhe ne do t'ju ofrojmë një çmim të personalizuar.",
    },
    en: {
      title: "Flexible Pricing for Every Business",
      subtitle: "Choose the services you need and we will provide you with a custom quote.",
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

export default function PricingLayout({ children }: Props) {
    return <>{children}</>;
}