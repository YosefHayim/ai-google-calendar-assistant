'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Input } from '@/components/ui/input'
import { JsonLd } from '@/components/shared/JsonLd'
import { generateBreadcrumbSchema, generateWebPageSchema, SITE_CONFIG } from '@/lib/constants/seo'
import { useBlogPosts, useBlogCategories } from '@/hooks/queries'
import { getBlogImageUrl } from '@/services/blog-service'
import {
  BLOG_POSTS,
  BLOG_CATEGORIES as STATIC_CATEGORIES,
  getBlogPostsByCategory,
  type BlogCategory,
} from '@/lib/data/blog-posts'
import { Search } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { formatBlogDate } from '@/lib/formatUtils'

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Productivity: { bg: 'bg-blue-100', text: 'text-blue-800' },
  'Tips & Tricks': { bg: 'bg-green-100', text: 'text-green-800' },
  'Product News': { bg: 'bg-amber-100', text: 'text-amber-800' },
  Tutorial: { bg: 'bg-purple-100', text: 'text-purple-800' },
  All: { bg: 'bg-primary', text: 'text-primary-foreground' },
}

const getCategoryColors = (category: string) => {
  return CATEGORY_COLORS[category] || { bg: 'bg-secondary', text: 'text-secondary-foreground' }
}

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const {
    data: dynamicPosts,
    isLoading: postsLoading,
    isError: postsError,
  } = useBlogPosts({ category: activeCategory })
  const { data: dynamicCategories } = useBlogCategories()

  const useDynamicData = !postsError && dynamicPosts && dynamicPosts.posts.length > 0

  const categories = ['All', ...(dynamicCategories ?? STATIC_CATEGORIES).filter((c) => c !== 'All')]
  const allPosts = useDynamicData ? dynamicPosts.posts : getBlogPostsByCategory(activeCategory as BlogCategory)

  const filteredPosts = searchQuery
    ? allPosts.filter(
        (post) =>
          post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : allPosts

  const getImageSrc = (post: (typeof allPosts)[0]) => {
    if (useDynamicData && 'image_key' in post) {
      return getBlogImageUrl(post.image_key as string | null)
    }
    return 'image' in post ? post.image : undefined
  }

  const getReadTime = (post: (typeof allPosts)[0]) => {
    if ('read_time' in post) return post.read_time as string
    if ('readTime' in post) return post.readTime as string
    return '5 min read'
  }

  const getPublishedAt = (post: (typeof allPosts)[0]) => {
    if ('published_at' in post) return post.published_at as string
    if ('publishedAt' in post) return post.publishedAt as string
    return new Date().toISOString()
  }

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_CONFIG.url },
    { name: 'Blog', url: `${SITE_CONFIG.url}/blog` },
  ])
  const pageSchema = generateWebPageSchema({
    title: 'Blog - Ally',
    description:
      'Tips, tutorials, and insights on productivity, time management, and AI-powered calendar management from the Ally team.',
    url: `${SITE_CONFIG.url}/blog`,
  })

  return (
    <MarketingLayout>
      <JsonLd data={[breadcrumbSchema, pageSchema]} />

      <section className="flex w-full flex-col items-center gap-4 px-4 py-16 sm:px-6 lg:px-20">
        <h1 className="text-4xl font-bold text-foreground sm:text-5xl">The Ally Blog</h1>
        <p className="max-w-[600px] text-center text-lg text-muted-foreground">
          Tips, tutorials, and insights on productivity, time management, and making the most of your AI assistant.
        </p>

        <div className="flex flex-col items-center gap-4 pt-4 sm:flex-row">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-[300px] rounded-lg border-border bg-card pl-11 sm:w-[400px]"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => {
              const isActive = activeCategory === category
              const colors = getCategoryColors(category)
              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`rounded-full px-4 py-2 text-[13px] font-medium transition-colors ${
                    isActive ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {category}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      <section className="w-full px-4 pb-16 sm:px-6 lg:px-20">
        {postsLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-border bg-card">
                <Skeleton className="h-[200px] w-full" />
                <div className="flex flex-col gap-3 p-6">
                  <Skeleton className="h-5 w-24 rounded-full" />
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredPosts.map((post) => {
              const categoryColors = getCategoryColors(post.category)
              const imageSrc = getImageSrc(post)

              return (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-muted-foreground/30">
                    <div className="relative h-[200px] w-full bg-muted">
                      {imageSrc ? (
                        <Image
                          src={imageSrc}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <span className="text-sm text-muted-foreground">Image</span>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-1 flex-col gap-3 p-6">
                      <span
                        className={`w-fit rounded-full px-2.5 py-1 text-[11px] font-medium ${categoryColors.bg} ${categoryColors.text}`}
                      >
                        {post.category}
                      </span>

                      <h2 className="text-lg font-semibold leading-snug text-foreground transition-colors group-hover:text-primary">
                        {post.title}
                      </h2>

                      <p className="line-clamp-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                        {post.excerpt}
                      </p>

                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>{formatBlogDate(getPublishedAt(post))}</span>
                        <span>•</span>
                        <span>{getReadTime(post)}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              )
            })}
          </div>
        ) : (
          <div className="py-16 text-center">
            <h3 className="mb-2 text-xl font-medium text-foreground">No posts found</h3>
            <p className="text-muted-foreground">
              {searchQuery
                ? `No articles match "${searchQuery}". Try a different search term.`
                : "We don't have any posts in this category yet. Check back soon!"}
            </p>
          </div>
        )}
      </section>
    </MarketingLayout>
  )
}
