'use client'

import { useState } from 'react'
import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { JsonLd } from '@/components/shared/JsonLd'
import { generateBreadcrumbSchema, generateWebPageSchema, SITE_CONFIG } from '@/lib/constants/seo'
import {
  BLOG_POSTS,
  BLOG_CATEGORIES,
  getFeaturedPost,
  getBlogPostsByCategory,
  type BlogCategory,
} from '@/lib/data/blog-posts'
import { BookOpen, ArrowRight, Calendar, Clock, User, Mail, Sparkles } from 'lucide-react'
import { formatBlogDate } from '@/lib/formatUtils'
import { newsletterService } from '@/services/newsletter.service'
import { toast } from 'sonner'

export default function BlogPage() {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [activeCategory, setActiveCategory] = useState<BlogCategory>('All')

  const filteredPosts = getBlogPostsByCategory(activeCategory)
  const featuredPost = getFeaturedPost()
  const regularPosts = activeCategory === 'All' ? filteredPosts.filter((post) => !post.featured) : filteredPosts

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
      <section className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <BookOpen className="w-4 h-4" />
              Blog
            </div>
            <h1 className="text-4xl md:text-5xl font-medium tracking-tight text-zinc-900 dark:text-zinc-100 mb-4">
              Insights & Updates
            </h1>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
              Tips on productivity, time management, and AI-powered calendar management. Learn how to make the most of
              your time.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {BLOG_CATEGORIES.map((category) => (
              <button
                key={category}
                onClick={() => setActiveCategory(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  activeCategory === category
                    ? 'bg-primary text-white'
                    : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {featuredPost && activeCategory === 'All' && (
            <div className="mb-12">
              <Link href={`/blog/${featuredPost.slug}`}>
                <Card className="overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-video md:aspect-auto relative overflow-hidden bg-gradient-to-br from-primary/20 via-purple-500/20 to-pink-500/20 min-h-[250px]">
                      {featuredPost.image ? (
                        <>
                          <img
                            src={featuredPost.image}
                            alt={featuredPost.title}
                            className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
                          <div className="absolute bottom-4 left-4">
                            <span className="text-sm text-white/90 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                              Featured Article
                            </span>
                          </div>
                        </>
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="text-center p-8">
                            <Sparkles className="w-16 h-16 text-primary/60 mx-auto mb-4 group-hover:scale-110 transition-transform" />
                            <span className="text-sm text-zinc-500 dark:text-zinc-400">Featured Article</span>
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-6 md:p-8 flex flex-col justify-center">
                      <div className="flex items-center gap-3 mb-4">
                        <Badge variant="default">{featuredPost.category}</Badge>
                        <span className="text-sm text-zinc-500 dark:text-zinc-400">Featured</span>
                      </div>
                      <h2 className="text-2xl md:text-3xl font-medium text-zinc-900 dark:text-zinc-100 mb-3 group-hover:text-primary transition-colors">
                        {featuredPost.title}
                      </h2>
                      <p className="text-zinc-500 dark:text-zinc-400 mb-6">{featuredPost.excerpt}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4 text-sm text-zinc-500 dark:text-zinc-400">
                          <span className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {featuredPost.author.name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {formatBlogDate(featuredPost.publishedAt)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {featuredPost.readTime}
                          </span>
                        </div>
                        <Button variant="ghost" className="gap-2">
                          Read More
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            </div>
          )}

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {regularPosts.map((post) => (
              <Link key={post.slug} href={`/blog/${post.slug}`}>
                <Card className="h-full overflow-hidden border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                  <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                    {post.image ? (
                      <img
                        src={post.image}
                        alt={post.title}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-700 group-hover:text-primary/50 transition-colors" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Badge variant="secondary">{post.category}</Badge>
                    </div>
                    <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 line-clamp-2">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
                      <span className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {post.author.name}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {post.readTime}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="w-16 h-16 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-zinc-900 dark:text-zinc-100 mb-2">No posts found</h3>
              <p className="text-zinc-500 dark:text-zinc-400">
                We don&apos;t have any posts in this category yet. Check back soon!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-16 md:py-24 px-4 sm:px-6 bg-zinc-50 dark:bg-zinc-900/50">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Mail className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-2xl md:text-3xl font-medium text-zinc-900 dark:text-zinc-100 mb-4">
            Subscribe to our newsletter
          </h2>
          <p className="text-zinc-500 dark:text-zinc-400 mb-8">
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
            className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="flex-1 h-12"
              required
              disabled={isSubmitting}
            />
            <Button type="submit" size="lg" className="gap-2" disabled={isSubmitting}>
              {isSubmitting ? 'Subscribing...' : 'Subscribe'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </form>
          <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-4">
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
