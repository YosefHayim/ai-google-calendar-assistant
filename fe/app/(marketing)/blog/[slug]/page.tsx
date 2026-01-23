'use client'

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Calendar,
  Check,
  Clock,
  Link as LinkIcon,
  Linkedin,
  Twitter,
  User,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { SITE_CONFIG, generateArticleSchema, generateBreadcrumbSchema } from '@/lib/constants/seo'
import { getBlogPostBySlug, getRelatedPosts as getStaticRelatedPosts } from '@/lib/data/blog-posts'
import { notFound, useParams } from 'next/navigation'
import { useBlogPost, useRelatedPosts } from '@/hooks/queries'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import { JsonLd } from '@/components/shared/JsonLd'
import Link from 'next/link'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { formatBlogDate } from '@/lib/formatUtils'
import { getBlogImageUrl } from '@/services/blog-service'
import { useState } from 'react'

function ShareButtons({ title, url }: { title: string; url: string }) {
  const [showCopyCheck, setShowCopyCheck] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  const encodedTitle = encodeURIComponent(title)
  const encodedUrl = encodeURIComponent(url)

  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 3000)
  }

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url)
    setShowCopyCheck(true)
    showToast('Copied to clipboard!')
    setTimeout(() => setShowCopyCheck(false), 1000)
  }

  const handleTwitterShare = () => {
    window.open(`https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`, '_blank')
    showToast('Opening Twitter...')
  }

  const handleLinkedInShare = () => {
    window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`, '_blank')
    showToast('Opening LinkedIn...')
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <span className="mr-2 text-sm text-muted-foreground dark:text-muted-foreground">Share:</span>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleTwitterShare}>
          <Twitter className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleLinkedInShare}>
          <Linkedin className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={copyToClipboard}>
          {showCopyCheck ? <Check className="h-4 w-4 text-green-600" /> : <LinkIcon className="h-4 w-4" />}
        </Button>
      </div>

      {toastMessage && (
        <div className="fixed bottom-4 right-4 rounded-lg bg-secondary px-4 py-2 text-white shadow-lg duration-300 animate-in fade-in slide-in-from-bottom-2 dark:bg-secondary dark:text-foreground">
          {toastMessage}
        </div>
      )}
    </>
  )
}

export default function BlogPostPage() {
  const params = useParams()
  const slug = params.slug as string

  const { data: dynamicPost, isLoading, isError } = useBlogPost(slug)
  const { data: dynamicRelated } = useRelatedPosts(slug, 3)

  const staticPost = getBlogPostBySlug(slug)
  const staticRelated = getStaticRelatedPosts(slug, 3)

  const useDynamicData = !isError && dynamicPost
  const post = useDynamicData ? dynamicPost : staticPost
  const relatedPosts = useDynamicData && dynamicRelated?.length ? dynamicRelated : staticRelated

  if (isLoading) {
    return (
      <MarketingLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <LoadingSpinner size="lg" />
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
    if (!p) return { name: 'Ask Ally Team', role: 'Team' }
    if (typeof p.author === 'object' && p.author !== null) {
      return p.author as { name: string; role: string }
    }
    return { name: 'Ask Ally Team', role: 'Team' }
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

      {imageSrc && (
        <div className="relative h-[300px] w-full overflow-hidden md:h-[400px] lg:h-[500px]">
          <Image src={imageSrc} alt={post.title} fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent dark:from-zinc-950" />
        </div>
      )}

      <article className={`px-4 py-16 sm:px-6 md:py-24 ${imageSrc ? 'relative z-10 -mt-24' : ''}`}>
        <div className="mx-auto max-w-3xl">
          <Link
            href="/blog"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-primary dark:text-muted-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>

          <header className="mb-12">
            <div className="mb-6 flex items-center gap-3">
              <Badge variant="default">{post.category}</Badge>
              {post.featured && <Badge variant="secondary">Featured</Badge>}
            </div>

            <h1 className="mb-6 text-3xl font-medium leading-tight tracking-tight text-foreground dark:text-primary-foreground md:text-4xl lg:text-5xl">
              {post.title}
            </h1>

            <p className="mb-8 text-xl text-muted-foreground dark:text-muted-foreground">{post.excerpt}</p>

            <div className="flex flex-wrap items-center gap-6 border border-b pb-8 text-sm text-muted-foreground dark:text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <User className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground dark:text-primary-foreground">{author.name}</p>
                  <p className="text-xs">{author.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {formatBlogDate(getPublishedAt(post))}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {getReadTime(post)}
              </div>
            </div>
          </header>

          <div
            className="prose prose-lg prose-zinc max-w-none dark:prose-invert prose-headings:font-medium prose-headings:tracking-tight prose-h2:mb-4 prose-h2:mt-12 prose-h2:text-2xl prose-h3:mb-3 prose-h3:mt-8 prose-h3:text-xl prose-p:mb-4 prose-p:leading-relaxed prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-blockquote:rounded-r-lg prose-blockquote:border-primary prose-blockquote:bg-muted prose-blockquote:px-6 prose-blockquote:py-1 prose-strong:text-foreground prose-code:rounded prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-primary prose-pre:border prose-pre:bg-secondary prose-ol:my-4 prose-ul:my-4 prose-li:leading-relaxed dark:prose-blockquote:bg-secondary dark:prose-strong:text-primary-foreground"
            dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(post.content) }}
          />

          <div className="mt-12 border border-t pt-8">
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-2 text-sm text-muted-foreground dark:text-muted-foreground">Tags:</span>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-8 flex items-center justify-between border-t pt-8">
            <ShareButtons title={post.title} url={postUrl} />
            <Link href="/register">
              <Button className="gap-2">
                Try Ask Ally Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="bg-muted px-4 py-16 dark:bg-secondary/50 sm:px-6 md:py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-8 text-2xl font-medium text-foreground dark:text-primary-foreground md:text-3xl">
              Related Articles
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                  <Card className="group h-full overflow-hidden transition-colors hover:border-zinc-300 dark:hover:border-zinc-700">
                    <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                      {getImageSrc(relatedPost) ? (
                        <Image
                          src={getImageSrc(relatedPost)!}
                          alt={relatedPost.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="h-12 w-12 text-zinc-300 transition-colors group-hover:text-primary/50 dark:text-zinc-700" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-3">
                        {relatedPost.category}
                      </Badge>
                      <h3 className="mb-2 line-clamp-2 font-medium text-foreground transition-colors group-hover:text-primary dark:text-primary-foreground">
                        {relatedPost.title}
                      </h3>
                      <p className="line-clamp-2 text-sm text-muted-foreground dark:text-muted-foreground">
                        {relatedPost.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 py-16 sm:px-6 md:py-24">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-2xl font-medium text-foreground dark:text-primary-foreground md:text-3xl">
            Ready to transform your calendar?
          </h2>
          <p className="mb-8 text-muted-foreground dark:text-muted-foreground">
            Join thousands of professionals who use Ask Ally to manage their time more effectively.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="w-full gap-2 sm:w-auto">
                Get Started Free
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/blog">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Read More Articles
              </Button>
            </Link>
          </div>
        </div>
      </section>
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
