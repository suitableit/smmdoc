'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { 
  FaSearch, 
  FaCalendarAlt, 
  FaUser, 
  FaTag, 
  FaArrowRight, 
  FaChartLine, 
  FaClock,
  FaShare,
  FaComment,
  FaEye
} from 'react-icons/fa';

// Types
interface BlogPost {
  id: string;
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
    title: 'How to Create Engaging Content for Social Media',
    excerpt: 'Learn the secrets of creating content that drives engagement...',
    date: '2024-05-28',
    readTime: '5 min read',
    image: '/api/placeholder/300/200',
    slug: 'engaging-content-social-media'
  },
  {
    id: '2',
    title: 'Instagram Marketing Strategies for 2024',
    excerpt: 'Discover the latest Instagram marketing trends and tactics...',
    date: '2024-05-25',
    readTime: '7 min read',
    image: '/api/placeholder/300/200',
    slug: 'instagram-marketing-2024'
  },
  {
    id: '3',
    title: 'TikTok Growth Hacks That Actually Work',
    excerpt: 'Proven strategies to grow your TikTok following organically...',
    date: '2024-05-22',
    readTime: '6 min read',
    image: '/api/placeholder/300/200',
    slug: 'tiktok-growth-hacks'
  }
];

const categories: Category[] = [
  { name: 'Social Media Marketing', count: 24, slug: 'social-media-marketing' },
  { name: 'Content Strategy', count: 18, slug: 'content-strategy' },
  { name: 'Instagram Tips', count: 15, slug: 'instagram-tips' },
  { name: 'TikTok Marketing', count: 12, slug: 'tiktok-marketing' },
  { name: 'Facebook Advertising', count: 10, slug: 'facebook-advertising' }
];

const popularTags = [
  'Social Media', 'Marketing', 'Instagram', 'TikTok', 'Content Creation',
  'Engagement', 'Followers', 'Branding', 'Analytics', 'Growth'
];

// Sidebar Components
const SearchBar: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 p-6 mb-6 transition-colors duration-200">
      <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Search</h3>
      <div className="relative">
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search articles..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5F1DE8] focus:border-transparent transition-all duration-200"
        />
      </div>
    </div>
  );
};

const RecentPosts: React.FC = () => (
  <div className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 p-6 mb-6 transition-colors duration-200">
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Recent Posts</h3>
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
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-[#5F1DE8] dark:group-hover:text-[#B131F8] transition-colors duration-200 line-clamp-2">
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
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Categories</h3>
    <div className="space-y-2">
      {categories.map((category) => (
        <Link
          key={category.slug}
          href={`/blog/category/${category.slug}`}
          className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 group"
        >
          <span className="text-gray-700 dark:text-gray-300 group-hover:text-[#5F1DE8] dark:group-hover:text-[#B131F8] transition-colors duration-200">
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
    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">Popular Tags</h3>
    <div className="flex flex-wrap gap-2">
      {popularTags.map((tag) => (
        <Link
          key={tag}
          href={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, '-')}`}
          className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#5F1DE8]/10 to-[#B131F8]/10 text-[#5F1DE8] dark:text-[#B131F8] text-sm rounded-full hover:from-[#5F1DE8]/20 hover:to-[#B131F8]/20 transition-all duration-200"
        >
          <FaTag className="w-3 h-3 mr-1" />
          {tag}
        </Link>
      ))}
    </div>
  </div>
);

const TrendingWidget: React.FC = () => (
  <div className="bg-gradient-to-br from-[#5F1DE8]/5 to-[#B131F8]/5 dark:from-[#5F1DE8]/10 dark:to-[#B131F8]/10 rounded-2xl p-6 mb-6 border border-[#5F1DE8]/20 dark:border-[#B131F8]/20">
    <div className="flex items-center mb-4">
      <FaChartLine className="w-5 h-5 text-[#5F1DE8] dark:text-[#B131F8] mr-2" />
      <h3 className="text-lg font-bold text-gray-900 dark:text-white transition-colors duration-200">Trending Now</h3>
    </div>
    <div className="space-y-3">
      <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-200">
          AI in Social Media Marketing
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-200">
          How artificial intelligence is revolutionizing social media strategies
        </p>
      </div>
      <div className="bg-white dark:bg-gray-800/50 rounded-lg p-3 shadow-sm border border-gray-200 dark:border-gray-700">
        <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-1 transition-colors duration-200">
          Video Content Trends 2024
        </h4>
        <p className="text-xs text-gray-600 dark:text-gray-300 transition-colors duration-200">
          The rise of short-form video content across platforms
        </p>
      </div>
    </div>
  </div>
);

// Main Blog Post Component
const BlogPost: React.FC = () => {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0d0712] transition-colors duration-200">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 pt-[120px] pb-[120px]">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <article className="bg-white dark:bg-gray-800/50 dark:backdrop-blur-sm rounded-2xl border border-gray-200 dark:border-gray-700 shadow-lg dark:shadow-lg dark:shadow-black/20 overflow-hidden transition-colors duration-200">
              {/* Article Header */}
              <div className="p-8">
                <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6 leading-tight transition-colors duration-200">
                  What Are the Best Ways to Increase Social Media Followers?
                </h1>
                
                <div className="flex flex-wrap items-center text-gray-600 dark:text-gray-300 mb-6 gap-4">
                  <div className="flex items-center">
                    <FaUser className="w-5 h-5 mr-2 text-[#5F1DE8] dark:text-[#B131F8]" />
                    <span>SMMGen Team</span>
                  </div>
                  <div className="flex items-center">
                    <FaCalendarAlt className="w-5 h-5 mr-2 text-[#5F1DE8] dark:text-[#B131F8]" />
                    <span>June 1, 2025</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="w-5 h-5 mr-2 text-[#5F1DE8] dark:text-[#B131F8]" />
                    <span>8 min read</span>
                  </div>
                </div>

                {/* Featured Image */}
                <div className="mb-8">
                  <Image
                    src="/api/placeholder/800/400"
                    alt="Social Media Followers Growth"
                    width={800}
                    height={400}
                    className="w-full h-64 object-cover rounded-lg"
                  />
                </div>

                {/* Article Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mb-6 transition-colors duration-200">
                    Gaining a good number of social media followers is essential for developing a powerful online presence and reaching a wider audience. It can improve interaction, raise brand awareness, and create opportunities for growth. Effective follower-gaining requires knowing your audience. You have to produce content that resonates with them and establish genuine connections. By being consistent and taking an organized approach, you can develop an enthusiastic following that promotes and strengthens your brand or message.
                  </p>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 transition-colors duration-200">
                    We, SMMGen, are here to answer your question, &apos;What Are the Best Ways to Increase Social Media Followers?&apos;
                  </p>

                  <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-6 transition-colors duration-200">
                    What Are the Best Ways to Increase Social Media Followers? Explained
                  </h2>

                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-8 transition-colors duration-200">
                    You need to invest time to increase your social media followers. You have to follow certain strategies to gain them. What Are the Best Ways to Increase Social Media Followers? Let&apos;s dive in.
                  </p>

                  {/* Strategy Cards */}
                  <div className="space-y-8">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-6 border-l-4 border-blue-500 transition-colors duration-200">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">1. Post Consistently</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200">
                        Increasing your social media followers requires regular posting. It reminds your viewers of you and keeps them interested. Regular posting increases the chance that others will see your content. Furthermore, consistency shows your reliability and activity. Thus, it increases credibility. If new viewers see you frequently in their feed, they could be more inclined to follow you, and existing followers will be waiting for your content.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-2xl p-6 border-l-4 border-green-500 transition-colors duration-200">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">2. Go for Influencer Marketing</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200">
                        A large number of people follow influencers. These content creators create content for you that has their own unique touch when your brand works with them. Their followers are always interacting with it once they post it. It increases the visibility of your brand. Furthermore, influencers are vital for their followers. It gains credibility since they post about you. It&apos;s likely that their fans will know about you. In the current setting, this is among the most effective follower-growing techniques.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-2xl p-6 border-l-4 border-purple-500 transition-colors duration-200">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">3. Use Hashtags while Posting</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200">
                        Using hashtags is important for increasing your followers. It expands the content&apos;s reach beyond your current audience and improves discoverability. High traffic and engagement rates are made possible by hashtags. Participating in a trending hashtag increases the visibility of your material. It facilitates quick contact with potential clients. Additionally, by enabling visitors interested in the specified themes to find your posts, hashtags help you organize your information and make it searchable.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20 rounded-2xl p-6 border-l-4 border-yellow-500 transition-colors duration-200">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">4. Contests and Giveaways</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200">
                        Giveaways and contests are effective ways to quickly gain new followers. To help spread information, you can invite people to follow you, tag friends, or share your content. Giveaways naturally draw attention since everyone loves the possibility of winning something. Contests can help you create an engaged and active audience. It rapidly increases your reach and number of followers. To get a good number of followers, make sure that the reward is premium.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-2xl p-6 border-l-4 border-red-500 transition-colors duration-200">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">5. Try Out Paid Advertising</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200">
                        Another effective strategy to gain followers is to use paid advertisements on Facebook, Instagram, and TikTok. These advertisements increase engagement, lead generation, and revenues. This allows you to target advertisements according to geography, interest, and demographics. The advertisements reach the intended audience in this way. Before advertising, you can also conduct A/B testing. Social media advertisements are cheap and generate positive results. Additionally, you can utilize a variety of data to determine how effective the advertisements are.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-2xl p-6 border-l-4 border-indigo-500 transition-colors duration-200">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">6. Post Good Quality Content</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200">
                        Your strongest weapon is your content. Never sacrifice the quality of the content you produce. Follow the newest challenges, soundtracks, and trends. It contributes to a brand&apos;s increased reputation. Having quality content will help you differentiate yourself from your rivals. Followers will come to you naturally if you have a great social media presence. It promotes conversion as well. Superior content demonstrates your professionalism, dependability, and sincerity.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20 rounded-2xl p-6 border-l-4 border-pink-500 transition-colors duration-200">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">7. Create Reels</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200">
                        Everyone is drawn to reels because of its dynamic format and wide audience. On social media sites, it is more visible. Instagram, for instance, allows users to add reels to their &apos;Explore&apos; pages and feeds. As a result, the reach is expanded. It also displays your brand&apos;s individuality. Make use of captivating effects, transitions, and soundtracks for your reels. It helps you remain current. Discoverability rises as a result of the increased likelihood of accessing the explore page.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800/20 dark:to-gray-700/20 rounded-2xl p-6 border-l-4 border-gray-500 transition-colors duration-200">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">8. Invest in Social Media Marketing Panels</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200">
                        Before placing an order, a customer verifies the brand&apos;s legitimacy. When the number of followers or likes is low, they start to hesitate. Customers believe a page is trustworthy when they see that the number of likes and follows is adequate. Panels for social media marketing let you purchase a few things. You can purchase followers using SMM panels. You have the option of both international and country-specific genuine followers.
                      </p>
                    </div>

                    <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20 rounded-2xl p-6 border-l-4 border-teal-500 transition-colors duration-200">
                      <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4 transition-colors duration-200">9. Interact with People</h3>
                      <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200">
                        Maintaining contact with clients fosters a sense of reliability. When a customer leaves a comment on your site, appropriately address their questions. Thank them if they are complimenting your stuff. Show them politeness if they message you. Reach is increased through customer engagement. They feel included when a brand posts feedback from customers. Add stickers or polls to your story to encourage audience participation. When you intend to launch a new product line, get their opinions.
                      </p>
                    </div>
                  </div>

                  <div className="mt-12 p-6 bg-gradient-to-r from-[#5F1DE8]/10 to-[#B131F8]/10 dark:from-[#5F1DE8]/20 dark:to-[#B131F8]/20 rounded-2xl border border-[#5F1DE8]/20 dark:border-[#B131F8]/20">
                    <p className="text-gray-800 dark:text-gray-200 transition-colors duration-200">
                      <strong>Learn More:</strong>{' '}
                      <Link href="/blog/measure-social-media-marketing-performance" className="text-[#5F1DE8] dark:text-[#B131F8] hover:underline transition-colors duration-200">
                        How to Measure Social Media Marketing Performance?
                      </Link>
                    </p>
                  </div>

                  <h2 className="text-2xl lg:text-4xl font-bold text-gray-900 dark:text-white mt-12 mb-6 transition-colors duration-200">Conclusion</h2>
                  <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200">
                    Time, consistency, and an extensive understanding of your target demographic are necessary for developing a substantial social media following. Your follower base can be gradually expanded by focusing on excellent content, real interaction, and trend adaptation. Analyzing your data regularly helps you to modify your approach and react to what works best. Meaningful connections and long-term success on your social media channels can result from building an authentic, active community.
                  </p>
                </div>

                {/* Tags */}
                <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <div className="flex flex-wrap gap-2">
                    {['Social Media', 'Marketing', 'Followers', 'Growth', 'Strategy'].map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 bg-gradient-to-r from-[#5F1DE8]/10 to-[#B131F8]/10 text-[#5F1DE8] dark:text-[#B131F8] text-sm rounded-full hover:from-[#5F1DE8]/20 hover:to-[#B131F8]/20 transition-all duration-200 cursor-pointer"
                      >
                        <FaTag className="w-3 h-3 mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Call to Action */}
                <div className="mt-8 p-6 bg-gradient-to-r from-[#5F1DE8] to-[#B131F8] rounded-2xl text-white">
                  <h3 className="text-xl font-bold mb-2">Ready to Boost Your Social Media Presence?</h3>
                  <p className="mb-4 text-purple-100">Join thousands of businesses growing their followers with SMMGen&apos;s proven strategies.</p>
                  <Link 
                    href="/signup" 
                    className="inline-flex items-center gap-2 bg-white text-[#5F1DE8] hover:bg-gray-100 font-semibold px-6 py-3 rounded-lg transition-all duration-300 hover:-translate-y-1"
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
                      <div className="flex items-center gap-1">
                        <FaComment className="w-4 h-4" />
                        <span>12 comments</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-gray-500 dark:text-gray-400">Share:</span>
                      <button className="p-2 text-gray-500 hover:text-[#5F1DE8] dark:hover:text-[#B131F8] transition-colors duration-200">
                        <FaShare className="w-4 h-4" />
                      </button>
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