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
  const featuredImage = 'https://images.unsplash.com/photo-1579546929518-9e396f3cc809?q=80&w=2070&auto=format&fit=crop'; // Pricing background

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

export default function PricingLayout({ children }: Props) {
    return <>{children}</>;
}