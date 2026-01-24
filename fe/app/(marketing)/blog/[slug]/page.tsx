'use client'

import { ArrowLeft, Calendar, Clock } from 'lucide-react'
import { SITE_CONFIG, generateArticleSchema, generateBreadcrumbSchema } from '@/lib/constants/seo'
import { getBlogPostBySlug, getRelatedPosts as getStaticRelatedPosts } from '@/lib/data/blog-posts'
import { notFound, useParams } from 'next/navigation'
import { useBlogPost, useRelatedPosts } from '@/hooks/queries'

import Image from 'next/image'
import { JsonLd } from '@/components/shared/JsonLd'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { formatBlogDate } from '@/lib/formatUtils'
import { getBlogImageUrl } from '@/services/blog-service'

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  Productivity: { bg: 'bg-blue-100', text: 'text-blue-800' },
  'Tips & Tricks': { bg: 'bg-green-100', text: 'text-green-800' },
  'Product News': { bg: 'bg-amber-100', text: 'text-amber-800' },
  Tutorial: { bg: 'bg-purple-100', text: 'text-purple-800' },
}

const getCategoryColors = (category: string) => {
  return CATEGORY_COLORS[category] || { bg: 'bg-secondary', text: 'text-secondary-foreground' }
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: dynamicPost, isLoading, isError } = useBlogPost(slug)
  const { data: dynamicRelated } = useRelatedPosts(slug, 2)

  const staticPost = getBlogPostBySlug(slug)
  const staticRelated = getStaticRelatedPosts(slug, 2)

  const useDynamicData = !isError && dynamicPost
  const post = useDynamicData ? dynamicPost : staticPost
  const relatedPosts = useDynamicData && dynamicRelated?.length ? dynamicRelated : staticRelated

  if (isLoading) {
    return (
      <MarketingLayout>
        <div className="flex w-full justify-center px-4 py-12 sm:px-6 lg:px-20">
          <div className="flex w-full max-w-[720px] flex-col gap-8">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-[400px] w-full rounded-xl" />
            <div className="flex flex-col gap-4">
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-3/4" />
            </div>
          </div>
        </div>
      </MarketingLayout>
    )
  }

  if (!post) {
    notFound()
  }

  const getImageSrc = (p: typeof post) => {
    if (!p) return undefined
    if (useDynamicData && 'image_key' in p) {
      return getBlogImageUrl(p.image_key as string | null)
    }
    return 'image' in p ? p.image : undefined
  }

  const getAuthor = (p: typeof post) => {
    if (!p) return { name: 'Ally Team', role: 'Team', initials: 'AT' }
    if (typeof p.author === 'object' && p.author !== null) {
      const author = p.author as { name: string; role?: string }
      const initials = author.name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
      return { name: author.name, role: author.role || 'Team', initials }
    }
    return { name: 'Ally Team', role: 'Team', initials: 'AT' }
  }

  const getReadTime = (p: typeof post) => {
    if (!p) return '5 min read'
    if ('read_time' in p) return p.read_time as string
    if ('readTime' in p) return p.readTime as string
    return '5 min read'
  }

  const getPublishedAt = (p: typeof post) => {
    if (!p) return new Date().toISOString()
    if ('published_at' in p) return p.published_at as string
    if ('publishedAt' in p) return p.publishedAt as string
    return new Date().toISOString()
  }

  const getUpdatedAt = (p: typeof post) => {
    if (!p) return undefined
    if ('updated_at' in p) return p.updated_at as string | undefined
    if ('updatedAt' in p) return p.updatedAt as string | undefined
    return undefined
  }

  const postUrl = `${SITE_CONFIG.url}/blog/${post.slug}`
  const author = getAuthor(post)
  const imageSrc = getImageSrc(post)
  const categoryColors = getCategoryColors(post.category)

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: 'Home', url: SITE_CONFIG.url },
    { name: 'Blog', url: `${SITE_CONFIG.url}/blog` },
    { name: post.title, url: postUrl },
  ])

  const articleSchema = generateArticleSchema({
    title: post.title,
    description: post.excerpt,
    datePublished: getPublishedAt(post),
    dateModified: getUpdatedAt(post) || getPublishedAt(post),
    author: author.name,
    image: `${SITE_CONFIG.url}/og-blog-${post.slug}.png`,
  })

  return (
    <MarketingLayout>
      <JsonLd data={[breadcrumbSchema, articleSchema]} />

      <article className="flex w-full justify-center px-4 py-12 sm:px-6 lg:px-20">
        <div className="flex w-full max-w-[720px] flex-col gap-8">
          <Link
            href="/blog"
            className="flex w-fit items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <div className="flex flex-col gap-4">
            <span
              className={`w-fit rounded-full px-3 py-1 text-xs font-medium ${categoryColors.bg} ${categoryColors.text}`}
            >
              {post.category}
            </span>

            <h1 className="text-3xl font-bold leading-tight text-foreground sm:text-4xl lg:text-[40px]">
              {post.title}
            </h1>

            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatBlogDate(getPublishedAt(post))}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{getReadTime(post)}</span>
              </div>
            </div>
          </div>

          <div className="relative h-[300px] w-full overflow-hidden rounded-xl bg-muted sm:h-[400px]">
            {imageSrc ? (
              <Image src={imageSrc} alt={post.title} fill sizes="720px" className="object-cover" priority />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <span className="text-muted-foreground">Featured Image</span>
              </div>
            )}
          </div>

          <div
            className="prose prose-lg max-w-none prose-headings:font-semibold prose-headings:text-foreground prose-h2:mt-8 prose-h2:text-2xl prose-p:leading-relaxed prose-p:text-muted-foreground prose-a:text-primary prose-strong:text-foreground prose-ol:text-muted-foreground prose-ul:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(post.content) }}
          />

          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-6">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary text-xl font-semibold text-primary-foreground">
              {author.initials}
            </div>
            <div className="flex flex-col gap-1">
              <span className="font-semibold text-foreground">{author.name}</span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {author.role} at Ally. Passionate about productivity and helping people make the most of their time.
              </span>
            </div>
          </div>

          {relatedPosts.length > 0 && (
            <div className="flex flex-col gap-6">
              <h2 className="text-2xl font-semibold text-foreground">Related Articles</h2>
              <div className="grid gap-6 sm:grid-cols-2">
                {relatedPosts.map((relatedPost) => {
                  const relatedCategoryColors = getCategoryColors(relatedPost.category)
                  const relatedImageSrc = getImageSrc(relatedPost)

                  return (
                    <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                      <article className="group flex flex-col overflow-hidden rounded-xl border border-border bg-card transition-colors hover:border-muted-foreground/30">
                        <div className="relative h-[140px] w-full bg-muted">
                          {relatedImageSrc ? (
                            <Image
                              src={relatedImageSrc}
                              alt={relatedPost.title}
                              fill
                              sizes="(max-width: 768px) 100vw, 360px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center">
                              <span className="text-xs text-muted-foreground">Image</span>
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2 p-4">
                          <span
                            className={`w-fit rounded-full px-2 py-0.5 text-[10px] font-medium ${relatedCategoryColors.bg} ${relatedCategoryColors.text}`}
                          >
                            {relatedPost.category}
                          </span>
                          <h3 className="line-clamp-2 text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
                            {relatedPost.title}
                          </h3>
                        </div>
                      </article>
                    </Link>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </article>
    </MarketingLayout>
  )
}

function formatMarkdownToHtml(markdown: string): string {
  let html = markdown
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h1>$1</h1>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/```([\s\S]*?)```/gim, '<pre><code>$1</code></pre>')
    .replace(/`(.*?)`/gim, '<code>$1</code>')
    .replace(/\[(.*?)\]\((.*?)\)/gim, '<a href="$2">$1</a>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>')
    .replace(/^\d+\. (.*$)/gim, '<li>$1</li>')
    .replace(/\n\n/gim, '</p><p>')
    .replace(/\n/gim, '<br>')

  html = html.replace(/(<li>[\s\S]*?<\/li>)/gim, (match) => {
    if (!match.includes('<ul>') && !match.includes('<ol>')) {
      return '<ul>' + match + '</ul>'
    }
    return match
  })

  html = html.replace(/<\/ul><br><ul>/gim, '')
  html = html.replace(/<\/ul><ul>/gim, '')

  if (!html.startsWith('<')) {
    html = '<p>' + html + '</p>'
  }

  return html
}
