import type { ProductSlug, ServiceId } from "./data";

type Feature = { title: string; text: string };
type Stat = { value: string; label: string };

export type ProductCopy = {
  name: string;
  category: string;
  tagline: string;
  summary: string;
  tags: string[];
  metaTitle: string;
  metaDescription: string;
  overviewTitle: string;
  overview: string[];
  stats?: Stat[];
  featuresTitle: string;
  features: Feature[];
  listTitle?: string;
  list?: Feature[];
  stepsTitle?: string;
  steps?: Feature[];
};

export type ServiceCopy = {
  label: string;
  title: string;
  short: string;
  text: string;
  points: string[];
  productCta?: string;
};

/** Gives an object literal a declared type while keeping excess-property checks. */
const typed = <T,>(value: T): T => value;

const en = {
  meta: {
    homeTitle: "Blue Square AI | Software & AI Company in Tirana, Albania",
    homeDescription:
      "Blue Square AI builds hotel software, mobile apps, system dashboards and CRMs for businesses in Albania and the Balkans. Based in Tirana. Free consultation.",
  },
  nav: {
    home: "Home",
    solutions: "Solutions",
    projects: "Projects",
    about: "About",
    careers: "Careers",
    contact: "Contact",
    cta: "Free consultation",
    menu: "Menu",
    close: "Close menu",
    skip: "Skip to content",
    language: "Language",
    primary: "Main navigation",
  },
  common: {
    learnMore: "Learn more",
    viewProject: "View project",
    askDemo: "Ask for a demo",
    visitSite: "Visit website",
    allProjects: "All projects",
    email: "Email",
    phone: "Phone",
    address: "Address",
    nuis: "NUIS (Tax ID)",
    founded: "Founded",
    companyName: "Company name",
    breadcrumb: "Breadcrumb",
  },
  footer: {
    tagline: "Software and AI solutions for businesses in Albania and the Balkans, built in Tirana.",
    solutions: "Solutions",
    products: "Products",
    company: "Company",
    privacy: "Privacy policy",
    rights: "All rights reserved.",
    registered: "Registered in Albania",
  },
  cta: {
    title: "Have a project in mind?",
    text: "Tell us what you need. We will reply with a clear proposal, and the first consultation is free.",
    primary: "Start a conversation",
    secondary: "Call",
  },
  home: {
    eyebrow: "Software & AI company · Tirana, Albania",
    title: "We build the software your business runs on.",
    lead:
      "Blue Square AI designs and develops hotel management systems, mobile apps, business dashboards and CRMs, with AI built in from the first line of code.",
    primary: "Request a free consultation",
    secondary: "See our projects",
    trust: ["Founded in 2025", "5 products in production", "Built on Google Cloud"],
    heroTiles: ["Hotel software", "Mobile apps", "Dashboards", "CRM systems"],
    stats: [
      { value: "5", label: "Products built and running" },
      { value: "100+", label: "OTA channels connected via LuxHotel" },
      { value: "1 day", label: "To set up a Multisystem workspace" },
      { value: "24/7", label: "Human support for our clients" },
    ],
    servicesEyebrow: "What we do",
    servicesTitle: "Solutions for the way your business works",
    servicesLead:
      "We build complete products, from idea and design through launch and ongoing support. These are the areas where we have the most experience.",
    featuredEyebrow: "Featured product",
    featuredPoints: [
      "Sync with Booking.com, Airbnb, Expedia and 100+ channels in under 5 seconds",
      "0% overbooking, guaranteed across every channel",
      "Works on desktop, tablet and phone, with no installation",
    ],
    productsEyebrow: "Our products",
    productsTitle: "Products we have built and run",
    productsLead: "Our own products, used every day by hotels, businesses and individuals across Albania.",
    processEyebrow: "How we work",
    processTitle: "A clear process from first call to launch",
    processLead: "A small, highly efficient team, with AI at every step, so we deliver faster without cutting corners.",
    process: [
      { title: "Discover", text: "We learn how your business works and define what the system must achieve." },
      { title: "Design", text: "We plan the structure and interface, and agree on it with you before building." },
      { title: "Build", text: "We develop with automated testing and security built in, and show you progress regularly." },
      { title: "Launch & support", text: "We deploy, train your team and stay available with real human support." },
    ],
    whyEyebrow: "Why Blue Square AI",
    whyTitle: "Secure technology, built the most efficient way",
    whyText:
      "Blue Square AI was founded in 2025 with a clear vision: use Artificial Intelligence in almost every step of the process, from finding the right solution to building complete systems from the ground up.",
    whyLink: "About the company",
    why: [
      { title: "Security from day one", text: "Applications built with high-level security protocols from the very first line of code." },
      { title: "World-class infrastructure", text: "We run on Google Cloud for scalability, performance and reliability." },
      { title: "AI-driven efficiency", text: "Automated development processes mean faster, more reliable results." },
      { title: "Local and close to you", text: "Based in Tirana, with support and billing in Albania and in Albanian." },
    ],
    stackTitle: "Technology we build with",
  },
  services: typed<Record<ServiceId, ServiceCopy>>({
    hotel: {
      label: "Tourism & hospitality",
      title: "Hotel software",
      short: "Property management, channel manager and booking engine for hotels and guesthouses.",
      text:
        "A complete hospitality stack for hotels, guesthouses and apartments: a property management system (PMS), a channel manager connected to 100+ OTAs, a direct booking engine and AI integrations.",
      points: [
        "Reservations, check-in, check-out and room assignment in one dashboard",
        "Real-time price and availability sync with Booking.com, Airbnb, Expedia and more",
        "Direct bookings on your own website, with no OTA commission",
      ],
      productCta: "See LuxHotel System",
    },
    mobile: {
      label: "iOS & Android",
      title: "Mobile apps",
      short: "Native-quality iOS and Android apps, from real-time voice translation to customer apps.",
      text:
        "Consumer and business apps with smooth, native-feeling interfaces, from AI-powered voice products to companion apps for your existing systems.",
      points: ["Real-time voice and AI features", "CarPlay and device integrations", "One codebase for iPhone and Android"],
      productCta: "See ShqipFol",
    },
    dashboards: {
      label: "Operations & finance",
      title: "System dashboards",
      short: "Operations and finance dashboards that turn your daily data into clear decisions.",
      text:
        "Admin panels and operations dashboards that bring reservations, finance, reports and team access together, so managers see the whole business at a glance.",
      points: ["Live KPIs, charts and financial reports", "Role-based access for every team member", "Connected to the tools you already use"],
    },
    crm: {
      label: "Sales & operations",
      title: "CRM & business systems",
      short: "Custom CRMs and management platforms shaped around your processes, not the other way round.",
      text:
        "Custom CRMs and management platforms for sales pipelines, clients, jobs and inventory, designed around how your team actually works.",
      points: [
        "Pipelines, clients, projects and calendars",
        "WhatsApp integration and automated notifications",
        "Import your existing data from Excel",
      ],
      productCta: "See Multisystem",
    },
    ai: {
      label: "Artificial intelligence",
      title: "AI & automation",
      short: "Chatbots, AI assistants and workflow automation with n8n and OpenClaw.",
      text:
        "Intelligent chatbots and automation systems built with n8n and OpenClaw that take repetitive work off your team and answer customers around the clock.",
      points: [
        "AI assistants and chatbots for websites and WhatsApp",
        "Workflow automation between your systems",
        "Automated messaging for bookings and customer service",
      ],
    },
    web: {
      label: "Quick solutions",
      title: "Websites",
      short: "Fast, SEO-optimised websites with an easy CMS. Starting from €300.",
      text:
        "SEO-optimised websites with a CMS so you can update content yourself. Examples include discoveralbania.al and tiranaescaperoom.com.",
      points: ["Fast, mobile-first and search-engine ready", "Easy content management", "Starting from €300"],
    },
  }),
  solutions: {
    metaTitle: "Hotel Software, Mobile Apps, Dashboards & CRM",
    metaDescription:
      "Hotel PMS and channel manager, iOS and Android apps, business dashboards, custom CRMs, AI automation and SEO websites, built by Blue Square AI in Tirana.",
    eyebrow: "Solutions",
    title: "Technology that moves your business forward",
    lead:
      "We build solutions that push the boundaries of technology in Albania and beyond, from ready-made products you can start using today to custom systems built around you.",
    industriesEyebrow: "Industries",
    industriesTitle: "Who we work with",
    industries: [
      { title: "Hotels & guesthouses", text: "PMS, channel management and direct bookings." },
      { title: "Travel & tourism", text: "Booking, tours, packages and client management." },
      { title: "Retail & restaurants", text: "Inventory, orders, sales and billing." },
      { title: "Clinics & services", text: "Appointments, patients, memberships and payments." },
    ],
    ctaTitle: "Not sure which solution fits?",
    ctaText: "Book a free consultation and we will recommend the right approach for your business.",
    ctaButton: "Get a free consultation",
  },
  projects: {
    metaTitle: "Our Products: LuxHotel, ShqipFol & More",
    metaDescription:
      "Products designed, built and run by Blue Square AI: LuxHotel System, ShqipFol, Multisystem, BlueBar and BlueBill, used by businesses across Albania.",
    eyebrow: "Projects",
    title: "Innovation in action",
    lead:
      "The products we have designed, built and continue to run, used by hotels, businesses and individuals across Albania.",
    ctaTitle: "Want something similar for your business?",
    ctaText: "We can adapt one of our products or build a custom system from scratch.",
    ctaButton: "Talk to us",
    otherTitle: "More of our products",
  },
  products: typed<Record<ProductSlug, ProductCopy>>({
    luxhotel: {
      name: "LuxHotel System",
      category: "Hotel software · PMS",
      tagline:
        "Everything a hotel needs, for just €2 per room per month: reservations, channel manager, booking engine and financial reports in one dashboard.",
      summary:
        "Reservations, channel manager, 100+ OTA channels and financial reports, all from a single dashboard. No installation, no commissions, on any device, for €2 per room per month.",
      tags: ["PMS", "Channel manager", "Booking engine", "Reports"],
      metaTitle: "LuxHotel System: Hotel PMS & Channel Manager",
      metaDescription:
        "LuxHotel System is a hotel PMS, channel manager and booking engine connected to 100+ OTAs. 0% overbooking, works on any device, €2 per room per month.",
      overviewTitle: "Built for hospitality without compromise",
      overview: [
        "We built LuxHotel System to give every hotel owner in Albania access to world-class technology, without complexity and without unaffordable prices.",
        "There is nothing to install and no long-term contract. Hotels get a 30-day free trial and real human support, 24/7.",
      ],
      stats: [
        { value: "€2", label: "Per room, per month" },
        { value: "100+", label: "OTA channels" },
        { value: "<5 s", label: "Price & availability sync" },
        { value: "0%", label: "Overbooking" },
      ],
      featuresTitle: "Everything your hotel needs in one place",
      features: [
        { title: "Reservation management", text: "Reservations, check-in, check-out and room assignment, all from a single dashboard." },
        { title: "Channel manager", text: "Update your price once and Booking.com, Airbnb, Expedia and 100+ platforms update automatically." },
        { title: "Booking engine", text: "Connect your website and let guests book directly, so you save every OTA commission." },
        { title: "Real-time sync", text: "Sync in under 5 seconds and 0% overbooking, guaranteed across every channel." },
        { title: "Financial reports", text: "Revenue, occupancy and payment reports ready in minutes instead of hours." },
        { title: "Multi-property", text: "Manage several properties and all their rooms from one account." },
      ],
      listTitle: "The same dashboard on every screen",
      list: [
        { title: "Front desk", text: "Full dashboard on the reception computer." },
        { title: "On the floor", text: "Housekeeping and room status on a tablet." },
        { title: "In your pocket", text: "Live bookings and reports on your phone." },
      ],
    },
    shqipfol: {
      name: "ShqipFol",
      category: "Mobile app · AI",
      tagline: "Real-time voice translation for Albanian speakers, with natural human-like voices and CarPlay support.",
      summary:
        "The voice of Albanian in your pocket. Real-time voice translation with natural human-like voices, automatic language detection and full CarPlay support.",
      tags: ["iOS & Android", "Voice AI", "CarPlay"],
      metaTitle: "ShqipFol: Real-Time Albanian Voice Translator",
      metaDescription:
        "ShqipFol translates your voice to and from Albanian in real time, with natural human-like voices, automatic language detection and CarPlay support.",
      overviewTitle: "The voice of Albanian in your pocket",
      overview: [
        "ShqipFol is designed to break language barriers instantly. Whether you are travelling, in a business meeting or simply chatting with friends, ShqipFol understands your voice and responds with a natural, human-like voice.",
        "It is not just a translator. It is your personal live interpreter, with Hold-to-Talk for extra privacy and better performance in noisy places.",
      ],
      featuresTitle: "Why ShqipFol",
      features: [
        { title: "Instant translation", text: "Speak naturally and hear the translation immediately, with no awkward pauses." },
        { title: "Natural voices", text: "Choose from human-like voices (Bardha, Dielli, Genti) designed to sound authentic." },
        { title: "CarPlay support", text: "Full CarPlay support and steering-wheel controls for safe translation while driving." },
        { title: "Automatic detection", text: "Recognises instantly whether you are speaking Albanian or a foreign language." },
      ],
    },
    multisystem: {
      name: "Multisystem",
      category: "Business platform · CRM",
      tagline:
        "A business management platform built for the Albanian market. Start from a template and shape every table to your workflow.",
      summary:
        "Your business, your system. A management platform built for the Albanian market. Start from a template like car rental, retail shop or dental clinic, and customise every table, field and relationship.",
      tags: ["Custom tables", "WhatsApp", "Templates"],
      metaTitle: "Multisystem: Business Platform for Albania",
      metaDescription:
        "Multisystem is a customisable business management platform for the Albanian market: custom tables, ready apps, WhatsApp integration and setup in one day.",
      overviewTitle: "Your business, your system",
      overview: [
        "Not a pre-made program you have to force your business into. Start with a template and customise every table, field and relationship the way your business actually works.",
        "The system is yours, even under the hood: no foreign subscription, no foreign language and no dependency on anyone else.",
      ],
      stats: [
        { value: "10", label: "Field types" },
        { value: "5", label: "Ready-made apps" },
        { value: "9", label: "Business templates" },
        { value: "1 day", label: "To set up" },
      ],
      featuresTitle: "What is inside",
      features: [
        {
          title: "Custom tables",
          text: "10 field types (text, number, yes/no, date, time, links, lists, auto ID, formula and files), with real relationships and self-calculating formulas.",
        },
        { title: "5 ready-made apps", text: "Forms, calendar, charts, WhatsApp and notes turn any table into a working tool, with no extra code." },
        { title: "Control & security", text: "A separate database for every account, workspaces per branch, and permissions for every user on every table." },
        { title: "Secure API", text: "Auto-generated OpenAPI contracts, safe writes without duplicates and a full history of every API key." },
      ],
      listTitle: "Start from a ready-made template",
      list: [
        { title: "Car rental", text: "Track your fleet, bookings and returns in real time." },
        { title: "Retail shop", text: "Manage inventory, sales and customers from a single table." },
        { title: "Property rentals", text: "Control leases, rent collection and maintenance for every property." },
        { title: "Beauty salon", text: "Schedule appointments and manage clients with a built-in calendar." },
        { title: "Gym", text: "Track memberships, check-ins and training plans." },
        { title: "Travel agency", text: "Organise packages, bookings and clients for every destination." },
        { title: "Restaurant", text: "Manage orders, tables and kitchen inventory every day." },
        { title: "Dental clinic", text: "Schedule patients, medical history and payments without hassle." },
        { title: "Start blank", text: "Build your own tables from scratch, your way." },
      ],
      stepsTitle: "Up and running in one business day",
      steps: [
        { title: "Built in one day", text: "Your system is set up within one business day." },
        { title: "Import from Excel", text: "Bring your existing data straight in from Excel." },
        { title: "Team configured", text: "We set up your team with the right permissions for every member." },
        { title: "No ongoing dependency", text: "You run it yourself, without relying on our support team." },
      ],
    },
    bluebar: {
      name: "BlueBar",
      category: "Hospitality · Point of sale",
      tagline: "Order and sales management for bars and cafés, built for fast service at busy times.",
      summary:
        "Order and sales management for bars and cafés. Take orders quickly, track tables and products, and see daily sales in a clear dashboard.",
      tags: ["Orders", "Tables", "Sales reports"],
      metaTitle: "BlueBar: Order Management for Bars & Cafés",
      metaDescription:
        "BlueBar helps bars and cafés take orders quickly, track tables and products, and follow daily sales in one clear dashboard. Built by Blue Square AI.",
      overviewTitle: "Fast service, clear numbers",
      overview: [
        "BlueBar is built for the pace of a busy bar or café. Staff take orders in a few taps, and owners see what is selling and how the day is going without waiting for the end-of-day count.",
      ],
      featuresTitle: "Key features",
      features: [
        { title: "Quick ordering", text: "Take and send orders in a few taps, even at the busiest times." },
        { title: "Tables & products", text: "Keep track of open tables, products and what each table has ordered." },
        { title: "Daily sales", text: "See sales for the day and the best-selling products in a clear dashboard." },
      ],
    },
    bluebill: {
      name: "BlueBill",
      category: "Finance · Invoicing",
      tagline: "Invoicing and billing that keeps your sales records clear, organised and ready for reporting.",
      summary:
        "Invoicing and billing for small and medium businesses. Create invoices in seconds, keep client and payment history organised, and stay ready for reporting.",
      tags: ["Invoices", "Payments", "Clients"],
      metaTitle: "BlueBill: Invoicing for Small Businesses",
      metaDescription:
        "BlueBill lets small and medium businesses create invoices in seconds, keep client and payment history organised and stay ready for reporting.",
      overviewTitle: "Billing without the paperwork",
      overview: [
        "BlueBill keeps invoicing simple for small and medium businesses. Every invoice, client and payment is in one place, so your records are always tidy and ready when you need a report.",
      ],
      featuresTitle: "Key features",
      features: [
        { title: "Invoices in seconds", text: "Create and send clear, professional invoices quickly." },
        { title: "Payment tracking", text: "See what has been paid and what is still outstanding." },
        { title: "Client history", text: "Keep every client's invoices and payments organised in one place." },
      ],
    },
  }),
  about: {
    metaTitle: "About Us: Team, Story & Company Details",
    metaDescription:
      "Blue Square AI is a software and AI company founded in 2025 in Tirana, Albania. Meet the team and see our company details (NUIS M61711043K).",
    eyebrow: "About us",
    title: "Building the future, efficiently",
    lead: "Founded in 2025 with a mission to change how technology is built in Albania and the Balkans.",
    storyEyebrow: "Our story",
    storyTitle: "Secure technology, built the most efficient way",
    story: [
      "Blue Square AI is an Albanian company based in Tirana that builds software for different markets. We have solid experience delivering hotel software, mobile apps, system dashboards and CRMs.",
      "The company was founded in 2025 with a clear vision: use Artificial Intelligence in almost every step of the process, from understanding what a client needs to building complete systems from the ground up, with an extremely efficient team.",
    ],
    values: [
      { title: "Security first", text: "Applications built with high-level security protocols from the very first line of code." },
      { title: "Automated delivery", text: "Full automation of development processes for faster, more reliable results." },
      { title: "Expert team", text: "Specialists who master the latest AI and web development technologies." },
    ],
    teamEyebrow: "Leadership",
    teamTitle: "The team behind Blue Square AI",
    team: [
      {
        role: "Lead Engineer",
        bio: "Danjel brings extensive experience in training AI models and building full-stack applications. His focus is creating systems that help businesses grow quickly and efficiently.",
      },
      {
        role: "Web Developer",
        bio: "Endi builds the websites and web interfaces behind Blue Square AI's products, focusing on fast, accessible pages that work well on every device.",
      },
      {
        role: "Software Engineer",
        bio: "Antigona develops and maintains the software behind Blue Square AI's products, from back-end services to the features clients use every day.",
      },
      {
        role: "Marketing & Design",
        bio: "Grisilda shapes how Blue Square AI looks and speaks, from marketing campaigns and social media to the design of the visuals clients see every day.",
      },
      {
        role: "Sales",
        bio: "Klevis works with hotels and businesses that want to grow with Blue Square AI, from the first conversation to getting started with the right products.",
      },
    ],
    infraEyebrow: "Infrastructure",
    infraTitle: "We know who to work with to deliver quality",
    infraText:
      "That is why we rely on the world's most powerful infrastructure, such as Google Cloud, to guarantee scalability, performance and maximum security.",
    detailsEyebrow: "Company details",
    detailsTitle: "Registered in Albania",
    detailsText: "Official company information for partners, clients and suppliers.",
  },
  careers: {
    metaTitle: "Careers at Blue Square AI",
    metaDescription:
      "Join Blue Square AI in Tirana and build the future of AI technology with us. Send your CV or portfolio to info@bluesquareai.com.",
    eyebrow: "Careers",
    title: "Build the future of AI technology with us",
    lead: "Join our team and explore your opportunities at Blue Square AI.",
    emptyTitle: "No open positions at the moment",
    emptyText: "We do not have any open vacancies right now, but we are always interested in meeting talented people.",
    applyText: "Send your CV or portfolio to info@bluesquareai.com and we will contact you when a suitable position opens.",
    applyButton: "Send your CV",
    lookTitle: "What we value",
    look: [
      { title: "Curiosity", text: "You enjoy learning new tools, especially in AI, and applying them to real problems." },
      { title: "Ownership", text: "You care about the result, not just the task, and see work through to launch." },
      { title: "Craft", text: "You write clean, secure code and pay attention to the people who will use it." },
    ],
  },
  contact: {
    metaTitle: "Contact Blue Square AI in Tirana",
    metaDescription:
      "Contact Blue Square AI at Pallati i Kulturës, Tirana. Email info@bluesquareai.com or call +355 69 381 5070 for a free consultation on your software project.",
    eyebrow: "Contact",
    title: "Let's talk about your project",
    lead: "Have a question or want to work together? Our team is here to help you grow your business.",
    formTitle: "Send us a message",
    formText: "Fill in the form and we will get back to you shortly.",
    name: "Full name",
    email: "Email",
    company: "Company (optional)",
    topic: "What do you need?",
    topicOther: "Something else",
    message: "Message",
    submit: "Send message",
    note: "Sending opens your email app with the message ready to send to info@bluesquareai.com.",
    detailsTitle: "Contact details",
    office: "Blue Square AI headquarters",
    directions: "Get directions",
    mapTitle: "Map showing Pallati i Kulturës, Tirana",
    subject: "Website enquiry",
  },
  privacy: {
    metaTitle: "Privacy Policy",
    metaDescription: "How Blue Square AI collects, uses and protects personal data shared through this website.",
    title: "Privacy policy",
    updated: "Last updated: October 2026",
    sections: [
      {
        title: "Who we are",
        text: "This website is operated by Blue Square AI (NUIS M61711043K), Pallati i Kulturës, Tirana, Albania. For any privacy question, contact info@bluesquareai.com.",
      },
      {
        title: "What data we collect",
        text: "We only receive the personal data you choose to send us, for example your name, email address, company and message when you write to us by email or through the contact form. This website does not use advertising cookies. We measure visits with our own cookie-free analytics (page views, time on page, clicks, country, device and browser); IP addresses are not stored. We store your cookie choice in a small cookie (bs_consent) for 12 months.",
      },
      {
        title: "How we use it",
        text: "We use your data only to reply to your enquiry, prepare a proposal and provide the services you ask for. We do not sell or rent personal data.",
      },
      {
        title: "Hosting and logs",
        text: "Our hosting provider may keep standard technical logs (such as IP address and browser type) for security and reliability. These logs are kept for a limited time.",
      },
      {
        title: "Your rights",
        text: "You can ask to access, correct or delete the personal data we hold about you at any time by writing to info@bluesquareai.com. We handle requests in line with applicable Albanian data protection law.",
      },
    ],
  },
  cookies: {
    title: "We value your privacy",
    text: "We measure visits with our own privacy-friendly analytics, which uses no cookies and does not store IP addresses. Any optional cookies are only used with your permission.",
    accept: "Accept",
    decline: "Decline",
    learnMore: "Privacy policy",
  },
  chat: {
    label: "Chat with us",
    title: "BlueSquare Assistant",
    subtitle: "AI assistant · answers in seconds",
    greeting: "Hi! I'm Blue Square AI's assistant. Ask me anything about our products and services — or leave a message and the team picks it up.",
    suggestions: ["What does LuxHotel System do?", "What can you build for my business?", "I'd like to talk to a person"],
    humanNote: "Our team has taken over — replies land right here.",
    aiFailed: "I've passed this to the team — they'll answer you here shortly.",
    placeholder: "Write a message…",
    send: "Send",
    retry: "That didn't go through — try again.",
    offline: "The chat is resting right now. Write to us at info@bluesquareai.com and we'll get back to you.",
    restart: "Start a new chat",
    close: "Close chat",
    open: "Open chat",
    disclaimer: "AI answers can slip up — ask for a person any time.",
  },
  notFound: {
    title: "Page not found",
    text: "The page you are looking for does not exist or has moved.",
    home: "Back to home",
  },
};

export default en;
export type Dictionary = typeof en;
