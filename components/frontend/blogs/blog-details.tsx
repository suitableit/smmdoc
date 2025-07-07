'use client';

import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useRef, useEffect } from 'react';
import {
  FaArrowRight,
  FaCalendarAlt,
  FaChartLine,
  FaClock,
  FaComment,
  FaEye,
  FaSearch,
  FaShare,
  FaTag,
  FaUser,
  FaFacebookF,
  FaTwitter,
  FaLinkedinIn,
  FaEnvelope,
} from 'react-icons/fa';

// Types
interface BlogPost {
  id: number;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
  image: string;
  slug: string;
}

interface Category {
  name: string;
  count: number;
  slug: string;
}

// Sample data for sidebar
const recentPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Lorem Ipsum Dolor Sit Amet Consectetur',
    excerpt: 'Sed do eiusmod tempor incididunt ut labore et dolore magna...',
    date: '2024-05-28',
    readTime: '5 min read',
    image: 'https://picsum.photos/300/200?random=1',
    slug: 'lorem-ipsum-dolor-sit',
  },
  {
    id: '2',
    title: 'Ut Enim Ad Minim Veniam Quis Nostrud',
    excerpt: 'Exercitation ullamco laboris nisi ut aliquip ex ea commodo...',
    date: '2024-05-25',
    readTime: '7 min read',
    image: 'https://picsum.photos/300/200?random=2',
    slug: 'ut-enim-ad-minim',
  },
  {
    id: '3',
    title: 'Duis Aute Irure Dolor In Reprehenderit',
    excerpt: 'Voluptate velit esse cillum dolore eu fugiat nulla pariatur...',
    date: '2024-05-22',
    readTime: '6 min read',
    image: 'https://picsum.photos/300/200?random=3',
    slug: 'duis-aute-irure-dolor',
  },
];

const categories: Category[] = [
  { name: 'Lorem Ipsum Category', count: 24, slug: 'lorem-ipsum-category' },
  { name: 'Dolor Sit Amet', count: 18, slug: 'dolor-sit-amet' },
  { name: 'Consectetur Adipiscing', count: 15, slug: 'consectetur-adipiscing' },
  { name: 'Elit Sed Do', count: 12, slug: 'elit-sed-do' },
  { name: 'Eiusmod Tempor', count: 10, slug: 'eiusmod-tempor' },
];

const popularTags = [
  'Lorem',
  'Ipsum',
  'Dolor',
  'Sit',
  'Amet',
  'Consectetur',
  'Adipiscing',
  'Elit',
  'Sed',
  'Do',
];

// Sidebar Components
const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 p-6 mb-6 transition-colors duration-200">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
        Search
      </h3>
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent transition-all duration-200"
        />
      </div>
    </div>
  );
};

const RecentPosts: React.FC = () => (
  <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 p-6 mb-6 transition-colors duration-200">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
      Recent Posts
    </h3>
    <div className="space-y-4">
      {recentPosts.map((post) => (
        <Link key={post.id} href={`/blog/${post.slug}`} className="block group">
          <div className="flex space-x-3">
            <div className="flex-shrink-0">
              <Image
                src={post.image}
                alt={post.title}
                width={80}
                height={60}
                className="rounded-lg object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[var(--primary)] dark:group-hover:text-[var(--secondary)] transition-colors duration-200 line-clamp-2">
                {post.title}
              </h4>
              <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                <FaCalendarAlt className="w-3 h-3 mr-1" />
                <span>{new Date(post.date).toLocaleDateString()}</span>
                <span className="mx-2">•</span>
                <FaClock className="w-3 h-3 mr-1" />
                <span>{post.readTime}</span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  </div>
);

const Categories: React.FC = () => (
  <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 p-6 mb-6 transition-colors duration-200">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
      Categories
    </h3>
    <div className="space-y-2">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/blog/category/${category.slug}`}
          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
        >
          <span className="text-gray-700 dark:text-gray-300 group-hover:text-[var(--primary)] dark:group-hover:text-[var(--secondary)] transition-colors duration-200">
            {category.name}
          </span>
          <span className="bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300 text-xs px-2 py-1 rounded-full">
            {category.count}
          </span>
        </Link>
      ))}
    </div>
  </div>
);

const PopularTags: React.FC = () => (
  <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 p-6 mb-6 transition-colors duration-200">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">
      Popular Tags
    </h3>
    <div className="flex flex-wrap gap-2">
      {popularTags.map((tag) => (
        <Link
          key={tag}
          href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
          className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 text-[var(--primary)] dark:text-[var(--secondary)] text-sm rounded-full hover:from-[var(--primary)]/20 hover:to-[var(--secondary)]/20 transition-all duration-200"
        >
          <FaTag className="w-3 h-3 mr-1" />
          {tag}
        </Link>
      ))}
    </div>
  </div>
);

const TrendingWidget: React.FC = () => (
  <div className="bg-gradient-to-br from-[var(--primary)]/5 to-[var(--secondary)]/5 dark:from-[var(--primary)]/10 dark:to-[var(--secondary)]/10 rounded-2xl p-6 mb-6 border border-[var(--primary)]/20 dark:border-[var(--secondary)]/20">
    <div className="flex items-center mb-4">
      <FaChartLine className="w-5 h-5 text-[var(--primary)] dark:text-[var(--secondary)] mr-2" />
      <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-200">
        Trending Now
      </h3>
    </div>
    <div className="space-y-3">
      <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-200">
          Lorem Ipsum Dolor Sit Amet
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-200">
          Consectetur adipiscing elit sed do eiusmod tempor incididunt
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-200">
          Ut Labore Et Dolore Magna
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-200">
          Aliqua ut enim ad minim veniam quis nostrud exercitation
        </p>
      </div>
    </div>
  </div>
);

// Social Share Component
const SocialShare: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentUrl, setCurrentUrl] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const postTitle = 'Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit';
  const postDescription = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.';

  // Get current page URL when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setCurrentUrl(window.location.href);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(currentUrl)}&text=${encodeURIComponent(postTitle)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareOnLinkedIn = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(currentUrl)}`;
    window.open(url, '_blank', 'width=600,height=400');
    setIsOpen(false);
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(postTitle);
    const body = encodeURIComponent(`Check out this article: ${postTitle}\n\n${postDescription}\n\nRead more: ${currentUrl}`);
    window.open(`mailto:?subject=${subject}&body=${body}`);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-[var(--primary)] dark:hover:text-[var(--secondary)] transition-colors duration-200"
      >
        <FaShare className="w-4 h-4" />
      </button>
      
      {isOpen && (
        <div className="absolute right-0 top-0 transform -translate-y-full -translate-y-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-2 min-w-[160px] z-10">
          <button
            onClick={shareOnFacebook}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 dark:hover:text-blue-400 rounded-md transition-colors duration-200"
          >
            <FaFacebookF className="w-4 h-4 mr-3 text-blue-600" />
            Facebook
          </button>
          
          <button
            onClick={shareOnTwitter}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-500 dark:hover:text-blue-400 rounded-md transition-colors duration-200"
          >
            <FaTwitter className="w-4 h-4 mr-3 text-blue-500" />
            Twitter
          </button>
          
          <button
            onClick={shareOnLinkedIn}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-400 rounded-md transition-colors duration-200"
          >
            <FaLinkedinIn className="w-4 h-4 mr-3 text-blue-700" />
            LinkedIn
          </button>
          
          <button
            onClick={shareViaEmail}
            className="flex items-center w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-100 rounded-md transition-colors duration-200"
          >
            <FaEnvelope className="w-4 h-4 mr-3 text-gray-600" />
            Email
          </button>
        </div>
      )}
    </div>
  );
};

// Main Blog Post Component
const BlogPost: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0712] transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-[30px] lg:pt-[120px] pb-[120px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 overflow-hidden transition-colors duration-200">
              {/* Article Header */}
              <div className="p-8">
                <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-200">
                  Lorem Ipsum Dolor Sit Amet Consectetur Adipiscing Elit
                </h1>

                <div className="flex flex-wrap items-center text-gray-600 dark:text-gray-300 mb-6 gap-4">
                  <div className="flex items-center">
                    <FaUser className="w-5 h-5 mr-2 text-[var(--primary)] dark:text-[var(--secondary)]" />
                    <span>Lorem Team</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="w-5 h-5 mr-2 text-[var(--primary)] dark:text-[var(--secondary)]" />
                    <span>June 1, 2025</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="w-5 h-5 mr-2 text-[var(--primary)] dark:text-[var(--secondary)]" />
                    <span>8 min read</span>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="https://picsum.photos/800/400?random=10"
                    alt="Lorem Ipsum Featured Image"
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6 transition-colors duration-200">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed
                    do eiusmod tempor incididunt ut labore et dolore magna
                    aliqua. Ut enim ad minim veniam, quis nostrud exercitation
                    ullamco laboris nisi ut aliquip ex ea commodo consequat.
                    Duis aute irure dolor in reprehenderit in voluptate velit
                    esse cillum dolore eu fugiat nulla pariatur.
                  </p>

                  <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
                    Sed Ut Perspiciatis Unde Omnis Iste Natus Error
                  </h2>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 transition-colors duration-200">
                    Sit voluptatem accusantium doloremque laudantium, totam rem
                    aperiam, eaque ipsa quae ab illo inventore veritatis et
                    quasi architecto beatae vitae dicta sunt explicabo.
                  </p>  
                </div>

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {['Lorem', 'Ipsum', 'Dolor', 'Sit', 'Amet'].map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[var(--primary)]/10 to-[var(--secondary)]/10 text-[var(--primary)] dark:text-[var(--secondary)] text-sm rounded-full hover:from-[var(--primary)]/20 hover:to-[var(--secondary)]/20 transition-all duration-200 cursor-pointer"
                      >
                        <FaTag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div className="mt-8 p-6 bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] rounded-2xl text-white">
                  <h3 className="text-xl font-bold mb-2">
                    Ready to Lorem Ipsum Dolor Sit?
                  </h3>
                  <p className="mb-4 text-purple-100">
                    Join thousands of users experiencing consectetur adipiscing
                    elit with our proven methods.
                  </p>
                  <Link
                    href="/services"
                    className="inline-flex items-center gap-2 bg-white text-[var(--primary)] hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <span>Get Started Today</span>
                    <FaArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </Link>
                </div>

                {/* Social Share */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center gap-1">
                        <FaEye className="w-4 h-4" />
                        <span>1,234 views</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Share:
                      </span>
                      <SocialShare />
                    </div>
                  </div>
                </div>
              </div>
            </article>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <SearchBar />
              <RecentPosts />
              <Categories />
              <PopularTags />
              <TrendingWidget />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogPost;