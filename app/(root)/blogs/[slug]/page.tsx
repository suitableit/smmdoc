import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BlogPostDetailClient from './BlogPostDetailClient';
import { getAppName, getSiteDescription, getSiteUrl } from '@/lib/utils/general-settings';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    // Get dynamic settings and meta keywords
    const [appName, siteDescription, siteUrl] = await Promise.all([
      getAppName(),
      getSiteDescription(),
      getSiteUrl()
    ]);

    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    
    // Fetch meta settings for keywords
    let metaKeywords = '';
    try {
      const metaResponse = await fetch(`${baseUrl}/api/public/meta-settings`, {
        cache: 'no-store'
      });
      if (metaResponse.ok) {
        const metaData = await metaResponse.json();
        if (metaData.success && metaData.metaSettings?.keywords) {
          metaKeywords = metaData.metaSettings.keywords;
        }
      }
    } catch (error) {
      console.error('Error fetching meta keywords:', error);
    }
    
    const response = await fetch(`${baseUrl}/api/blogs/${params.slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return {
        title: `Blog Post Not Found - ${appName}`,
        description: 'The requested blog post could not be found.'
      };
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data) {
      return {
        title: `Blog Post Not Found`,
        description: 'The requested blog post could not be found.'
      };
    }
    
    const post = data.data;
    
    return {
      title: post.seoTitle || `${post.title}`,
      description: post.seoDescription || post.excerpt || siteDescription,
      keywords: metaKeywords,
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        type: 'article',
        url: `${siteUrl}/blogs/${post.slug}`,
        siteName: appName,
        images: post.featuredImage ? [
          {
            url: post.featuredImage,
            width: 1200,
            height: 630,
            alt: post.title
          }
        ] : [],
        publishedTime: post.publishedAt ? new Date(post.publishedAt).toISOString() : undefined,
        modifiedTime: post.updatedAt ? new Date(post.updatedAt).toISOString() : undefined,
        authors: [post.author?.name || `${appName} Team`]
      },
      twitter: {
        card: 'summary_large_image',
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        images: post.featuredImage ? [post.featuredImage] : []
      },
      alternates: {
        canonical: `${siteUrl}/blogs/${post.slug}`
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    // Fallback with dynamic settings
    const [appName, siteDescription] = await Promise.all([
      getAppName().catch(() => 'SMM Panel'),
      getSiteDescription().catch(() => 'Read insightful articles on social media marketing and digital strategies.')
    ]);
    
    return {
      title: `Blog Post`,
      description: siteDescription
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/blogs/${params.slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      notFound();
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data) {
      notFound();
    }

    return <BlogPostDetailClient post={data.data} />;
  } catch (error) {
    console.error('Error fetching blog post:', error);
    notFound();
  }
}