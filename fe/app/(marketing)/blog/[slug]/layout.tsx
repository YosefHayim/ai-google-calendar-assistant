import type { Metadata } from 'next'
import { SITE_CONFIG } from '@/lib/constants/seo'
import { getBlogPostBySlug, BLOG_POSTS } from '@/lib/data/blog-posts'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return BLOG_POSTS.map((post) => ({
    slug: post.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)

  if (!post) {
    return {
      title: 'Post Not Found',
      description: 'The requested blog post could not be found.',
    }
  }

  const postUrl = `${SITE_CONFIG.url}/blog/${post.slug}`

  return {
    title: post.seo.title,
    description: post.seo.description,
    keywords: post.seo.keywords,
    authors: [{ name: post.author.name }],
    openGraph: {
      title: post.seo.title,
      description: post.seo.description,
      url: postUrl,
      type: 'article',
      publishedTime: post.publishedAt,
      modifiedTime: post.updatedAt || post.publishedAt,
      authors: [post.author.name],
      tags: post.tags,
      images: [
        {
          url: `${SITE_CONFIG.url}/og-blog.png`,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.seo.title,
      description: post.seo.description,
      images: [`${SITE_CONFIG.url}/og-blog.png`],
    },
    alternates: {
      canonical: postUrl,
    },
  }
}

export default function BlogPostLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
