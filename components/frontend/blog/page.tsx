'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';
import { FaArrowRight } from 'react-icons/fa';

interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  image: string;
  slug: string;
}

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

const Section: React.FC<SectionProps> = ({ children, className = '' }) => (
  <section
    className={`bg-white dark:bg-[#0d0712] transition-colors duration-200 ${
      className || 'pb-[30px]'
    }`}
  >
    <div className="max-w-[1200px] mx-auto px-4">{children}</div>
  </section>
);

const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => (
  <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl dark:shadow-lg dark:shadow-black/20 hover:dark:shadow-purple-500/10 transition-all duration-300 h-full hover:-translate-y-1 group overflow-hidden">
    <div className="relative h-64 w-full overflow-hidden">
      <Image
        src={post.image}
        alt={post.title}
        fill
        className="object-cover transition-transform duration-300 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] transition-colors duration-200">
        <Link href="/blog/blog-details">{post.title}</Link>
      </h3>
      <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-4 line-clamp-3 transition-colors duration-200">
        {post.excerpt}
      </p>
      <Link
        href="/blog/blog-details"
        className="inline-flex items-center gap-2 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-4 py-2 text-sm rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1"
      >
        <span>Read more</span>
        <FaArrowRight className="w-3 h-3 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  </div>
);

const BlogPage: React.FC = () => {
  const [visiblePosts, setVisiblePosts] = useState(6);
  const [isLoading, setIsLoading] = useState(false);

  const allBlogPosts: BlogPost[] = [
    {
      id: '1',
      title: 'Lorem Ipsum Digital Marketing Strategies',
      excerpt:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
      image: 'https://picsum.photos/350/250?random=1',
      slug: 'lorem-ipsum-digital-marketing-strategies',
    },
    {
      id: '2',
      title: 'Consectetur Adipiscing Social Media Trends',
      excerpt:
        'Consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco.',
      image: 'https://picsum.photos/350/250?random=2',
      slug: 'consectetur-adipiscing-social-media-trends',
    },
    {
      id: '3',
      title: 'Sed Do Eiusmod Content Creation Guide',
      excerpt:
        'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.',
      image: 'https://picsum.photos/350/250?random=3',
      slug: 'sed-do-eiusmod-content-creation-guide',
    },
    {
      id: '4',
      title: 'Tempor Incididunt Platform Comparison',
      excerpt:
        'Tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
      image: 'https://picsum.photos/350/250?random=4',
      slug: 'tempor-incididunt-platform-comparison',
    },
    {
      id: '5',
      title: 'Ut Labore et Dolore Magna Branding Tips',
      excerpt:
        'Ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure.',
      image: 'https://picsum.photos/350/250?random=5',
      slug: 'ut-labore-et-dolore-magna-branding-tips',
    },
    {
      id: '6',
      title: 'Magna Aliqua Audience Engagement Methods',
      excerpt:
        'Magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit.',
      image: 'https://picsum.photos/350/250?random=6',
      slug: 'magna-aliqua-audience-engagement-methods',
    },
    {
      id: '7',
      title: 'Ut Enim Ad Minim Growth Strategies',
      excerpt:
        'Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate.',
      image: 'https://picsum.photos/350/250?random=7',
      slug: 'ut-enim-ad-minim-growth-strategies',
    },
    {
      id: '8',
      title: 'Quis Nostrud Promotion Techniques',
      excerpt:
        'Quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore.',
      image: 'https://picsum.photos/350/250?random=8',
      slug: 'quis-nostrud-promotion-techniques',
    },
    {
      id: '9',
      title: 'Exercitation Ullamco Viral Content Tips',
      excerpt:
        'Exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat.',
      image: 'https://picsum.photos/350/250?random=9',
      slug: 'exercitation-ullamco-viral-content-tips',
    },
    {
      id: '10',
      title: 'Laboris Nisi B2B Marketing Solutions',
      excerpt:
        'Laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur.',
      image: 'https://picsum.photos/350/250?random=10',
      slug: 'laboris-nisi-b2b-marketing-solutions',
    },
    {
      id: '11',
      title: 'Ut Aliquip Future Marketing Trends',
      excerpt:
        'Ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint.',
      image: 'https://picsum.photos/350/250?random=11',
      slug: 'ut-aliquip-future-marketing-trends',
    },
    {
      id: '12',
      title: 'Ex Ea Commodo Community Building',
      excerpt:
        'Ex ea commodo consequat duis aute irure dolor in reprehenderit voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat.',
      image: 'https://picsum.photos/350/250?random=12',
      slug: 'ex-ea-commodo-community-building',
    },
  ];

  const displayedPosts = allBlogPosts.slice(0, visiblePosts);
  const hasMorePosts = visiblePosts < allBlogPosts.length;

  const loadMorePosts = () => {
    setIsLoading(true);

    // Simulate loading delay
    setTimeout(() => {
      setVisiblePosts((prev) => Math.min(prev + 3, allBlogPosts.length));
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <Section className="pt-[120px]">
        <div className="text-center">
          <h4 className="text-2xl font-bold text-[var(--primary)] dark:text-[var(--secondary)] mb-2 transition-colors duration-200">
            Our Blog
          </h4>
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight mb-6 transition-colors duration-200">
            Latest Articles on <br />
            <span className="text-[var(--primary)] dark:text-[var(--secondary)] transition-colors duration-200">
              Social Media
            </span>{' '}
            Strategies
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed max-w-4xl mx-auto transition-colors duration-200">
            Welcome to SMMDOC's blog page. Your gateway to the latest insights
            and trends in social media marketing. This resource outlines how we
            share knowledge, provide valuable content, and help you stay ahead
            in the digital marketing landscape with cutting-edge strategies and
            expert guidance.
          </p>
        </div>
      </Section>

      {/* Blog Posts Grid */}
      <Section className="pt-[30px]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
          {displayedPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </Section>

      {/* Load More Section */}
      <Section className="pt-0 pb-[120px]">
        {/* Load More Button */}
        {hasMorePosts && (
          <div className="text-center">
            <button
              onClick={loadMorePosts}
              disabled={isLoading}
              className="inline-flex items-center gap-3 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] text-white font-semibold px-8 py-4 rounded-lg hover:shadow-lg hover:from-[#4F0FD8] hover:to-[#A121E8] dark:shadow-lg dark:shadow-purple-500/20 hover:dark:shadow-purple-500/30 transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:transform-none"
            >
              {isLoading ? (
                <>
                  <GradientSpinner size="w-4 h-4" />
                  <span>Loading...</span>
                </>
              ) : (
                <span>Load More</span>
              )}
            </button>
          </div>
        )}

        {/* End Message */}
        {!hasMorePosts && allBlogPosts.length > 6 && (
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 text-lg transition-colors duration-200">
              You've reached the end of our blog posts. Stay tuned for more
              updates!
            </p>
          </div>
        )}
      </Section>

      {/* Bottom Spacing Section - Removed as padding is now in Load More Section */}
    </div>
  );
};

export default BlogPage;
