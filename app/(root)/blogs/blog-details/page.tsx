import BlogPost from '@/components/frontend/blogs/[id]/page';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'What Are the Best Ways to Increase Social Media Followers?',
  description:
    'Discover 9 proven strategies to increase your social media followers effectively. Learn about consistent posting, influencer marketing, hashtag optimization, contests, paid advertising, quality content creation, reels, SMM panels, and audience engagement techniques.',
  keywords:
    'increase social media followers, social media growth, SMM strategies, influencer marketing, hashtag optimization, social media engagement, content marketing, Instagram followers, TikTok growth, Facebook marketing, SMM Panel, social media tips',
  authors: [{ name: 'SMMDOC' }],
  openGraph: {
    title: 'What Are the Best Ways to Increase Social Media Followers?',
    description:
      'Learn 9 effective strategies to grow your social media following with proven techniques from SMMDOC. Boost your online presence and engagement today.',
    type: 'article',
    publishedTime: '2025-06-01T00:00:00.000Z',
    authors: ['SMMDOC'],
    tags: [
      'Social Media',
      'Marketing',
      'Followers',
      'Growth',
      'Strategy',
      'Instagram',
      'TikTok',
      'Facebook',
    ],
    images: [
      {
        url: '/blog/social-media-followers-growth.jpg',
        width: 1200,
        height: 630,
        alt: 'Social Media Followers Growth Strategies',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'What Are the Best Ways to Increase Social Media Followers?',
    description:
      'Learn 9 effective strategies to grow your social media following with proven techniques from SMMDOC.',
    images: ['/images/blog/social-media-followers-growth.jpg'],
    creator: '@smmdoc',
  },
  alternates: {
    canonical: 'https://picsum.photos/350/250?random=12',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  category: 'Social Media Marketing',
};

export default function BlogDetailsPage() {
  return <BlogPost />;
}
