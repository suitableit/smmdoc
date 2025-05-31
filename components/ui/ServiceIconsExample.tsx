import React from 'react';
import {
    DiscordIcon,
    FacebookIcon,
    InstagramIcon,
    LinkedinIcon,
    PinterestIcon,
    RedditIcon,
    SnapchatIcon,
    SpotifyIcon,
    TelegramIcon,
    ThreadsIcon,
    TiktokIcon,
    TwitterIcon,
    WebsiteIcon,
    WhatsappIcon,
    YoutubeIcon
} from './ServiceIcons';
import { ServiceTile } from './ServiceTile';

export const ServiceIconsExample: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <ServiceTile
        id="instagram"
        title="ইন্সটাগ্রাম ফলোয়ার"
        description="আপনার অ্যাকাউন্টে রিয়েল ফলোয়ার পান"
        price="১০০০৳"
        icon={<InstagramIcon size={40} />}
        bgColor="purple"
        badge="জনপ্রিয়"
        href="/services/instagram"
      />
      
      <ServiceTile
        id="facebook"
        title="ফেসবুক লাইক"
        description="আপনার পোস্টে রিয়েল লাইক পান"
        price="৫০০৳"
        icon={<FacebookIcon size={40} />}
        bgColor="blue"
        href="/services/facebook"
      />
      
      <ServiceTile
        id="twitter"
        title="টুইটার ফলোয়ার"
        description="আপনার টুইটার অ্যাকাউন্টে ফলোয়ার বাড়ান"
        price="৮০০৳"
        icon={<TwitterIcon size={40} />}
        bgColor="indigo"
        href="/services/twitter"
      />
      
      <ServiceTile
        id="youtube"
        title="ইউটিউব সাবস্ক্রাইবার"
        description="আপনার চ্যানেলে সাবস্ক্রাইবার বাড়ান"
        price="১২০০৳"
        icon={<YoutubeIcon size={40} />}
        bgColor="red"
        badge="বেস্ট সেলার"
        href="/services/youtube"
      />
      
      <ServiceTile
        id="tiktok"
        title="টিকটক ফলোয়ার"
        description="আপনার টিকটক অ্যাকাউন্টে ফলোয়ার বাড়ান"
        price="৬০০৳"
        icon={<TiktokIcon size={40} />}
        bgColor="green"
        href="/services/tiktok"
      />
      
      <ServiceTile
        id="snapchat"
        title="স্ন্যাপচ্যাট ফলোয়ার"
        description="আপনার স্ন্যাপচ্যাট অ্যাকাউন্টে ফলোয়ার বাড়ান"
        price="৭০০৳"
        icon={<SnapchatIcon size={40} />}
        bgColor="orange"
        href="/services/snapchat"
      />
      
      <ServiceTile
        id="telegram"
        title="টেলিগ্রাম চ্যানেল মেম্বার"
        description="আপনার টেলিগ্রাম চ্যানেলে মেম্বার বাড়ান"
        price="৫৫০৳"
        icon={<TelegramIcon size={40} />}
        bgColor="blue"
        href="/services/telegram"
      />
      
      <ServiceTile
        id="pinterest"
        title="পিন্টারেস্ট ফলোয়ার"
        description="আপনার পিন্টারেস্ট অ্যাকাউন্টে ফলোয়ার বাড়ান"
        price="৯০০৳"
        icon={<PinterestIcon size={40} />}
        bgColor="red"
        href="/services/pinterest"
      />
      
      <ServiceTile
        id="linkedin"
        title="লিংকডইন কানেকশন"
        description="আপনার লিংকডইন প্রোফাইলে কানেকশন বাড়ান"
        price="১১০০৳"
        icon={<LinkedinIcon size={40} />}
        bgColor="indigo"
        href="/services/linkedin"
      />
      
      <ServiceTile
        id="website"
        title="ওয়েবসাইট ট্রাফিক"
        description="আপনার ওয়েবসাইটে ভিজিটর বাড়ান"
        price="১৫০০৳"
        icon={<WebsiteIcon size={40} />}
        bgColor="purple"
        badge="নতুন"
        href="/services/website"
      />

      <ServiceTile
        id="whatsapp"
        title="হোয়াটসঅ্যাপ গ্রুপ মেম্বার"
        description="আপনার হোয়াটসঅ্যাপ গ্রুপে মেম্বার বাড়ান"
        price="৬৫০৳"
        icon={<WhatsappIcon size={40} />}
        bgColor="green"
        href="/services/whatsapp"
      />
      
      <ServiceTile
        id="discord"
        title="ডিসকর্ড সার্ভার মেম্বার"
        description="আপনার ডিসকর্ড সার্ভারে মেম্বার বাড়ান"
        price="৮৫০৳"
        icon={<DiscordIcon size={40} />}
        bgColor="indigo"
        badge="নতুন"
        href="/services/discord"
      />
      
      <ServiceTile
        id="spotify"
        title="স্পটিফাই ফলোয়ার"
        description="আপনার স্পটিফাই প্লেলিস্টে ফলোয়ার বাড়ান"
        price="৭৫০৳"
        icon={<SpotifyIcon size={40} />}
        bgColor="green"
        href="/services/spotify"
      />
      
      <ServiceTile
        id="threads"
        title="থ্রেডস ফলোয়ার"
        description="আপনার থ্রেডস অ্যাকাউন্টে ফলোয়ার বাড়ান"
        price="৯৫০৳"
        icon={<ThreadsIcon size={40} />}
        bgColor="purple"
        href="/services/threads"
      />
      
      <ServiceTile
        id="reddit"
        title="রেডিট কার্মা বুস্ট"
        description="আপনার রেডিট অ্যাকাউন্টে কার্মা বাড়ান"
        price="১০৫০৳"
        icon={<RedditIcon size={40} />}
        bgColor="orange"
        href="/services/reddit"
      />
    </div>
  );
}; 