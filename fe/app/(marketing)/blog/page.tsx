'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { JsonLd } from '@/components/shared/JsonLd'
import { generateBreadcrumbSchema, generateWebPageSchema, SITE_CONFIG } from '@/lib/constants/seo'
import { useBlogPosts, useBlogCategories, useFeaturedPosts } from '@/hooks/queries'
import { getBlogImageUrl } from '@/services/blog-service'
import {
  BLOG_POSTS,
  BLOG_CATEGORIES as STATIC_CATEGORIES,
  getFeaturedPost,
  getBlogPostsByCategory,
  type BlogCategory,
} from '@/lib/data/blog-posts'
import { BookOpen, ArrowRight, Calendar, Clock, User, Mail, Sparkles } from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatBlogDate } from '@/lib/formatUtils'
import { newsletterService } from '@/services/newsletter-service'
import { toast } from 'sonner'

export default function BlogPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('All')

  const {
    data: dynamicPosts,
    isLoading: postsLoading,
    isError: postsError,
  } = useBlogPosts({ category: activeCategory })
  const { data: dynamicCategories } = useBlogCategories()
  const { data: dynamicFeatured } = useFeaturedPosts()

  const useDynamicData = !postsError && dynamicPosts && dynamicPosts.posts.length > 0

  const categories = dynamicCategories ?? STATIC_CATEGORIES
  const featuredPost = useDynamicData ? dynamicFeatured?.[0] : getFeaturedPost()
  const allPosts = useDynamicData ? dynamicPosts.posts : getBlogPostsByCategory(activeCategory as BlogCategory)
  const regularPosts =
    activeCategory === 'All' && featuredPost ? allPosts.filter((post) => post.slug !== featuredPost.slug) : allPosts

  const getImageSrc = (post: (typeof allPosts)[0]) => {
    if (useDynamicData && 'image_key' in post) {
      return getBlogImageUrl(post.image_key as string | null)
    }
    return 'image' in post ? post.image : undefined
  }

  const getAuthorName = (post: (typeof allPosts)[0]) => {
    if (typeof post.author === 'object' && post.author !== null) {
      return (post.author as { name: string }).name
    }
    return 'Ask Ally Team'
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
    title: 'Blog - Ask Ally',
    description:
      'Tips, tutorials, and insights on productivity, time management, and AI-powered calendar management from the Ask Ally team.',
    url: `${SITE_CONFIG.url}/blog`,
  })

  return (
    <MarketingLayout>
      <JsonLd data={[breadcrumbSchema, pageSchema]} />
      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
              <BookOpen className="h-4 w-4" />
              Blog
            </div>
            <h1 className="mb-4 text-4xl font-medium tracking-tight text-foreground dark:text-primary-foreground md:text-5xl">
              Insights & Updates
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground dark:text-muted-foreground">
              Tips on productivity, time management, and AI-powered calendar management. Learn how to make the most of
              your time.
            </p>
          </div>

          <div className="mb-12 flex flex-wrap justify-center gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-secondary text-zinc-600 hover:bg-accent dark:bg-secondary dark:text-muted-foreground dark:hover:bg-zinc-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {postsLoading && (
            <div className="flex justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          )}

          {!postsLoading && featuredPost && activeCategory === 'All' && (
            <div className="mb-12">
              <Link href={`/blog/${featuredPost.slug}`}>
                <Card className="group overflow-hidden transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
                  <div className="grid gap-0 md:grid-cols-2">
                    <div className="relative aspect-video min-h-[250px] overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 md:aspect-auto">
                      {getImageSrc(featuredPost) ? (
                        <>
                          <Image
                            src={getImageSrc(featuredPost)!}
                            alt={featuredPost.title}
                            fill
                            sizes="(max-width: 768px) 100vw, 50vw"
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <span className="rounded-full bg-foreground/40 px-3 py-1 text-sm text-white/90 backdrop-blur-sm">
                              Featured Article
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="p-8 text-center">
                            <Sparkles className="mx-auto mb-4 h-16 w-16 text-primary/60 transition-transform group-hover:scale-110" />
                            <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                              Featured Article
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="flex flex-col justify-center p-6 md:p-8">
                      <div className="mb-4 flex items-center gap-3">
                        <Badge variant="default">{featuredPost.category}</Badge>
                        <span className="text-sm text-muted-foreground dark:text-muted-foreground">Featured</span>
                      </div>
                      <h2 className="mb-3 text-2xl font-medium text-foreground transition-colors group-hover:text-primary dark:text-primary-foreground md:text-3xl">
                        {featuredPost.title}
                      </h2>
                      <p className="mb-6 text-muted-foreground dark:text-muted-foreground">{featuredPost.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground dark:text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="h-4 w-4" />
                            {getAuthorName(featuredPost)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {formatBlogDate(getPublishedAt(featuredPost))}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {getReadTime(featuredPost)}
                          </span>
                        </div>
                        <Button variant="ghost" className="gap-2">
                          Read: {featuredPost.title}
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </div>
          )}

          {!postsLoading && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {regularPosts.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`}>
                  <Card className="group h-full overflow-hidden transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                      {getImageSrc(post) ? (
                        <Image
                          src={getImageSrc(post)!}
                          alt={post.title}
                          fill
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-zinc-300 transition-colors group-hover:text-primary/50 dark:text-zinc-700" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="mb-3 flex items-center gap-2">
                        <Badge variant="secondary">{post.category}</Badge>
                      </div>
                      <h3 className="mb-2 line-clamp-2 text-lg font-medium text-foreground transition-colors group-hover:text-primary dark:text-primary-foreground">
                        {post.title}
                      </h3>
                      <p className="mb-4 line-clamp-2 text-sm text-muted-foreground dark:text-muted-foreground">
                        {post.excerpt}
                      </p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground dark:text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {getAuthorName(post)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {getReadTime(post)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}

          {!postsLoading && regularPosts.length === 0 && (
            <div className="py-16 text-center">
              <BookOpen className="mx-auto mb-4 h-16 w-16 text-zinc-300 dark:text-zinc-700" />
              <h3 className="mb-2 text-xl font-medium text-foreground dark:text-primary-foreground">No posts found</h3>
              <p className="text-muted-foreground dark:text-muted-foreground">
                We don&apos;t have any posts in this category yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="bg-muted px-4 py-16 dark:bg-secondary/50 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
            <Mail className="h-8 w-8 text-primary" />
          </div>
          <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground md:text-3xl">
            Subscribe to our newsletter
          </h2>
          <p className="mb-8 text-muted-foreground dark:text-muted-foreground">
            Get the latest productivity tips, feature updates, and insights delivered straight to your inbox.
          </p>
          <form
            onSubmit={async (e) => {
              e.preventDefault()
              if (!email) return

              setIsSubmitting(true)
              try {
                await newsletterService.subscribe({ email, source: 'blog' })
                toast.success('Success!', {
                  description: "You've been subscribed to our newsletter.",
                })
                setEmail('')
              } catch (error: any) {
                toast.error('Error', {
                  description: error.response?.data?.message || 'Failed to subscribe. Please try again.',
                })
              } finally {
                setIsSubmitting(false)
              }
            }}
            className="mx-auto flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12 flex-1"
              required
              disabled={isSubmitting}
            />
            <Button type="submit" size="lg" className="gap-2" disabled={isSubmitting}>
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              <ArrowRight className="h-4 w-4" />
            </Button>
          </form>
          <p className="mt-4 text-xs text-muted-foreground dark:text-muted-foreground">
            No spam, unsubscribe at any time. Read our{' '}
            <Link href="/privacy" className="underline hover:text-primary">
              Privacy Policy
            </Link>
            .
          </p>
        </div>
      </section>
    </MarketingLayout>
  )
}
