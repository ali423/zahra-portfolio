import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
 metadataBase: new URL('https://zahragoudarzi.ir'),
 title: 'زهرا گودرزی‌راد | طراحی صنعتی و بسته‌بندی',
 description: 'پورتفولیوی زهرا گودرزی‌راد؛ طراح صنعتی، طراح ساختار بسته‌بندی و ماکت‌ساز. Selected packaging, industrial design and model making by Zahra Goudarzirad.',
 alternates: { canonical: '/' },
 openGraph: { title: 'Zahra Goudarzi Rad | Industrial Design', description: 'Industrial design, structural packaging & model making.', locale: 'fa_IR', alternateLocale: 'en_US', type: 'website', images: [{ url: '/images/social-cover.jpg', width:1200,height:630 }] },
 twitter: { card: 'summary_large_image', title:'Zahra Goudarzirad — Industrial Designer', images:['/images/social-cover.jpg'] },
 robots: {index:true,follow:true}, icons: {icon:'/icon.svg'},
};
export const viewport: Viewport = {width:'device-width',initialScale:1,themeColor:[{media:'(prefers-color-scheme: light)',color:'#f4f3ef'},{media:'(prefers-color-scheme: dark)',color:'#1b1b1a'}]};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
 return <html lang="fa" dir="rtl" suppressHydrationWarning><head><script dangerouslySetInnerHTML={{__html:`document.documentElement.classList.add('js');try{var l=localStorage.getItem('zg-language')||'fa';var q=new URLSearchParams(location.search).get('lang');if(q==='en'||q==='fa')l=q;document.documentElement.lang=l;document.documentElement.dir=l==='fa'?'rtl':'ltr';var t=localStorage.getItem('zg-theme')||(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light');document.documentElement.dataset.theme=t}catch(e){}`}} /></head><body>{children}</body></html>;
}
