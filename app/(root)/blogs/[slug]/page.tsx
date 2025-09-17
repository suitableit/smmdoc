import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import BlogPostDetailClient from './BlogPostDetailClient';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

// Generate metadata for SEO
export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/blogs/${params.slug}`, {
      cache: 'no-store'
    });
    
    if (!response.ok) {
      return {
        title: 'Blog Post Not Found - SMMDOC',
        description: 'The requested blog post could not be found.'
      };
    }
    
    const data = await response.json();
    
    if (!data.success || !data.data) {
      return {
        title: 'Blog Post Not Found - SMMDOC',
        description: 'The requested blog post could not be found.'
      };
    }
    
    const post = data.data;
    
    return {
      title: post.seoTitle || `${post.title} - SMMDOC Blog`,
      description: post.seoDescription || post.excerpt || 'Read this insightful article on SMMDOC blog.',
      keywords: post.seoKeywords || 'SMMDOC, Social Media Marketing, Digital Marketing',
      openGraph: {
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        type: 'article',
        url: `https://www.smmdoc.com/blogs/${post.slug}`,
        images: post.featuredImage ? [{
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title
        }] : [],
        publishedTime: post.publishedAt,
        modifiedTime: post.updatedAt,
        authors: [post.author?.name || 'SMMDOC Team']
      },
      twitter: {
        card: 'summary_large_image',
        title: post.seoTitle || post.title,
        description: post.seoDescription || post.excerpt,
        images: post.featuredImage ? [post.featuredImage] : []
      },
      alternates: {
        canonical: `https://smmdoc.com/blogs/${post.slug}`
      }
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Blog Post - SMMDOC',
      description: 'Read insightful articles on social media marketing and digital strategies.'
    };
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  try {
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/blogs/${params.slug}`, {
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