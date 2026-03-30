'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Mail, Phone, Instagram, Linkedin, Twitter, ArrowUpRight, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export function Footer({ lang }: { lang: 'en' | 'sq' }) {
    const content = {
        sq: {
            tagline: "Duke ndërtuar të ardhmen e teknologjisë në Shqipëri dhe Ballkan.",
            links: [
                {
                    title: "Platformat",
                    items: [
                        { label: "AI Innovation", href: "/services/ai-innovation" },
                        { label: "Tourism Systems", href: "/services/tourism-systems" },
                        { label: "Quick Solutions", href: "/services/quick-solutions" },
                    ]
                },
                {
                    title: "Kompania",
                    items: [
                        { label: "Vizioni ynë", href: "/vision" },
                        { label: "Projektet", href: "/#projects" },
                        { label: "Na Kontaktoni", href: "/contact" },
                    ]
                },
                {
                    title: "Legal",
                    items: [
                        { label: "Privatësia", href: "#" },
                        { label: "Kushtet", href: "#" },
                    ]
                }
            ],
            contact: {
                title: "Na gjeni këtu",
                address: "Tiranë, Shqipëri",
            },
            copyright: `© ${new Date().getFullYear()} Blue Square AI. Të gjitha të drejtat e rezervuara.`
        },
        en: {
            tagline: "Building the future of technology in Albania and the Balkan region.",
            links: [
                {
                    title: "Platforms",
                    items: [
                        { label: "AI Innovation", href: "/services/ai-innovation" },
                        { label: "Tourism Systems", href: "/services/tourism-systems" },
                        { label: "Quick Solutions", href: "/services/quick-solutions" },
                    ]
                },
                {
                    title: "Company",
                    items: [
                        { label: "Our Vision", href: "/vision" },
                        { label: "Projects", href: "/#projects" },
                        { label: "Contact Us", href: "/contact" },
                    ]
                },
                {
                    title: "Legal",
                    items: [
                        { label: "Privacy Policy", href: "#" },
                        { label: "Terms of Service", href: "#" },
                    ]
                }
            ],
            contact: {
                title: "Reach us here",
                address: "Tirana, Albania",
            },
            copyright: `© ${new Date().getFullYear()} Blue Square AI. All rights reserved.`
        }
    };

    const currentContent = content[lang];
    
    const getFullHref = (href: string) => {
        if (href.startsWith('/#')) return `/?lang=${lang}${href.substring(1)}`;
        return `${href}?lang=${lang}`;
    };

    return (
        <footer className="bg-zinc-950 text-white pt-24 pb-12 border-t border-white/5 relative overflow-hidden">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-600/[0.05] rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-lime-400/[0.03] rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2" />

            <div className="container px-4 md:px-6 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 mb-20">
                    {/* Brand Meta */}
                    <div className="lg:col-span-4 flex flex-col items-start gap-8">
                        <Link href={getFullHref('/')} className="block group">
                            <div className="flex items-center gap-4">
                                <Image 
                                    src="https://firebasestorage.googleapis.com/v0/b/studio-3380920138-3317b.firebasestorage.app/o/logos%2FGemini_Generated_Image_uuixsnuuixsnuuix-removebg-preview.png?alt=media&token=eae0c0c2-2554-4aa4-af2e-84ddc673dd21"
                                    alt="BlueSquare Logo"
                                    width={40}
                                    height={40}
                                    className="w-10 h-10 object-contain"
                                />
                                <span className="font-headline font-extrabold text-xl tracking-tighter text-white group-hover:text-blue-400 transition-colors">
                                    BlueSquare
                                </span>
                            </div>
                        </Link>
                        <p className="text-zinc-400 text-lg leading-relaxed max-w-sm">
                            {currentContent.tagline}
                        </p>
                        <div className="flex gap-4">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:scale-110 transition-all duration-300">
                                <Linkedin className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:scale-110 transition-all duration-300">
                                <Instagram className="w-4 h-4" />
                            </a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-blue-600 hover:border-blue-600 hover:scale-110 transition-all duration-300">
                                <Twitter className="w-4 h-4" />
                            </a>
                        </div>
                    </div>

                    {/* Links Grid */}
                    <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-3 gap-12 sm:gap-8">
                        {currentContent.links.map((group) => (
                            <div key={group.title} className="flex flex-col gap-6">
                                <h3 className="text-xs font-bold uppercase tracking-[0.3em] text-white/40">
                                    {group.title}
                                </h3>
                                <ul className="flex flex-col gap-4">
                                    {group.items.map((link) => (
                                        <li key={link.label}>
                                            <Link 
                                                href={getFullHref(link.href)} 
                                                className="text-zinc-400 hover:text-white hover:translate-x-1 inline-flex items-center group transition-all duration-300 font-medium"
                                            >
                                                {link.label}
                                                <ArrowUpRight className="w-3 h-3 ml-1 opacity-0 group-hover:opacity-100 transition-all" />
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contact Banner */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-y border-white/5 mb-12">
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600/10 group-hover:border-blue-600/20 transition-all">
                            <Mail className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Email</p>
                            <a href="mailto:info@bluesquare.ai" className="text-sm font-semibold hover:text-blue-400 transition-colors">info@bluesquare.ai</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600/10 group-hover:border-blue-600/20 transition-all">
                            <Phone className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Phone</p>
                            <a href="tel:+355693815070" className="text-sm font-semibold hover:text-blue-400 transition-colors">+355 69 381 5070</a>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 group">
                        <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600/10 group-hover:border-blue-600/20 transition-all">
                            <Globe className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                            <p className="text-[10px] uppercase tracking-widest text-zinc-500 font-bold mb-1">Location</p>
                            <p className="text-sm font-semibold">{currentContent.contact.address}</p>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="flex flex-col md:row-reverse md:flex-row justify-between items-center gap-8">
                    <p className="text-xs text-zinc-500 tracking-tight">
                        {currentContent.copyright}
                    </p>
                    
                    <div className="flex items-center gap-4">
                        <Link 
                            href="?lang=sq" 
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-all",
                                lang === 'sq' ? "bg-white text-black border-white" : "text-zinc-500 border-white/10 hover:border-white/20 hover:text-white"
                            )}
                        >
                            Shqip
                        </Link>
                        <Link 
                            href="?lang=en" 
                            className={cn(
                                "text-[10px] font-bold uppercase tracking-widest px-4 py-2 rounded-full border transition-all",
                                lang === 'en' ? "bg-white text-black border-white" : "text-zinc-500 border-white/10 hover:border-white/20 hover:text-white"
                            )}
                        >
                            English
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}

    
