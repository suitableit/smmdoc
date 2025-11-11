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
        id={1}
        title="ইন্সটাগ্রাম ফলোয়ার"
        description="আপনার অ্যাকাউন্টে রিয়েল ফলোয়ার পান"
        price="১০০০৳"
        icon={<InstagramIcon size={40} />}
        bgColor="purple"
        badge="জনপ্রিয়"
        href="/services/instagram"
      />

      <ServiceTile
        id={2}
        title="ফেসবুক লাইক"
        description="আপনার পোস্টে রিয়েল লাইক পান"
        price="৫০০৳"
        icon={<FacebookIcon size={40} />}
        bgColor="blue"
        href="/services/facebook"
      />

      <ServiceTile
        id={3}
        title="টুইটার ফলোয়ার"
        description="আপনার টুইটার অ্যাকাউন্টে ফলোয়ার বাড়ান"
        price="৮০০৳"
        icon={<TwitterIcon size={40} />}
        bgColor="indigo"
        href="/services/twitter"
      />

      <ServiceTile
        id={4}
        title="ইউটিউব সাবস্ক্রাইবার"
        description="আপনার চ্যানেলে সাবস্ক্রাইবার বাড়ান"
        price="১২০০৳"
        icon={<YoutubeIcon size={40} />}
        bgColor="red"
        badge="বেস্ট সেলার"
        href="/services/youtube"
      />

      <ServiceTile
        id={5}
        title="টিকটক ফলোয়ার"
        description="আপনার টিকটক অ্যাকাউন্টে ফলোয়ার বাড়ান"
        price="৬০০৳"
        icon={<TiktokIcon size={40} />}
        bgColor="green"
        href="/services/tiktok"
      />

      <ServiceTile
        id={6}
        title="স্ন্যাপচ্যাট ফলোয়ার"
        description="আপনার স্ন্যাপচ্যাট অ্যাকাউন্টে ফলোয়ার বাড়ান"
        price="৭০০৳"
        icon={<SnapchatIcon size={40} />}
        bgColor="orange"
        href="/services/snapchat"
      />

      <ServiceTile
        id={7}
        title="টেলিগ্রাম চ্যানেল মেম্বার"
        description="আপনার টেলিগ্রাম চ্যানেলে মেম্বার বাড়ান"
        price="৫৫০৳"
        icon={<TelegramIcon size={40} />}
        bgColor="blue"
        href="/services/telegram"
      />

      <ServiceTile
        id={8}
        title="পিন্টারেস্ট ফলোয়ার"
        description="আপনার পিন্টারেস্ট অ্যাকাউন্টে ফলোয়ার বাড়ান"
        price="৯০০৳"
        icon={<PinterestIcon size={40} />}
        bgColor="red"
        href="/services/pinterest"
      />

      <ServiceTile
        id={9}
        title="লিংকডইন কানেকশন"
        description="আপনার লিংকডইন প্রোফাইলে কানেকশন বাড়ান"
        price="১১০০৳"
        icon={<LinkedinIcon size={40} />}
        bgColor="indigo"
        href="/services/linkedin"
      />

      <ServiceTile
        id={10}
        title="ওয়েবসাইট ট্রাফিক"
        description="আপনার ওয়েবসাইটে ভিজিটর বাড়ান"
        price="১৫০০৳"
        icon={<WebsiteIcon size={40} />}
        bgColor="purple"
        badge="নতুন"
        href="/services/website"
      />

      <ServiceTile
        id={11}
        title="হোয়াটসঅ্যাপ গ্রুপ মেম্বার"
        description="আপনার হোয়াটসঅ্যাপ গ্রুপে মেম্বার বাড়ান"
        price="৬৫০৳"
        icon={<WhatsappIcon size={40} />}
        bgColor="green"
        href="/services/whatsapp"
      />

      <ServiceTile
        id={12}
        title="ডিসকর্ড সার্ভার মেম্বার"
        description="আপনার ডিসকর্ড সার্ভারে মেম্বার বাড়ান"
        price="৮৫০৳"
        icon={<DiscordIcon size={40} />}
        bgColor="indigo"
        badge="নতুন"
        href="/services/discord"
      />

      <ServiceTile
        id={13}
        title="স্পটিফাই ফলোয়ার"
        description="আপনার স্পটিফাই প্লেলিস্টে ফলোয়ার বাড়ান"
        price="৭৫০৳"
        icon={<SpotifyIcon size={40} />}
        bgColor="green"
        href="/services/spotify"
      />

      <ServiceTile
        id={14}
        title="থ্রেডস ফলোয়ার"
        description="আপনার থ্রেডস অ্যাকাউন্টে ফলোয়ার বাড়ান"
        price="৯৫০৳"
        icon={<ThreadsIcon size={40} />}
        bgColor="purple"
        href="/services/threads"
      />

      <ServiceTile
        id={15}
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