'use client'

import { useParams, notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { JsonLd } from '@/components/shared/JsonLd'
import { generateBreadcrumbSchema, generateArticleSchema, SITE_CONFIG } from '@/lib/constants/seo'
import { useBlogPost, useRelatedPosts } from '@/hooks/queries'
import { getBlogImageUrl } from '@/services/blog.service'
import { getBlogPostBySlug, getRelatedPosts as getStaticRelatedPosts } from '@/lib/data/blog-posts'
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Twitter,
  Linkedin,
  Link as LinkIcon,
  BookOpen,
  ArrowRight,
  Check,
} from 'lucide-react'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { formatBlogDate } from '@/lib/formatUtils'
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
        <span className="text-sm text-muted-foreground dark:text-muted-foreground mr-2">Share:</span>
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
        <div className="fixed bottom-4 right-4 bg-secondary dark:bg-secondary text-white dark:text-foreground px-4 py-2 rounded-lg shadow-lg animate-in fade-in slide-in-from-bottom-2 duration-300">
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
        <div className="flex justify-center items-center min-h-[60vh]">
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
        <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden">
          <Image src={imageSrc} alt={post.title} fill sizes="100vw" className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-white dark:from-zinc-950 via-transparent to-transparent" />
        </div>
      )}

      <article className={`py-16 md:py-24 px-4 sm:px-6 ${imageSrc ? '-mt-24 relative z-10' : ''}`}>
        <div className="max-w-3xl mx-auto">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground dark:text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          <header className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <Badge variant="default">{post.category}</Badge>
              {post.featured && <Badge variant="secondary">Featured</Badge>}
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight text-foreground dark:text-primary-foreground mb-6 leading-tight">
              {post.title}
            </h1>

            <p className="text-xl text-muted-foreground dark:text-muted-foreground mb-8">{post.excerpt}</p>

            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground dark:text-muted-foreground pb-8 border-b border dark:border">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium text-foreground dark:text-primary-foreground">{author.name}</p>
                  <p className="text-xs">{author.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {formatBlogDate(getPublishedAt(post))}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                {getReadTime(post)}
              </div>
            </div>
          </header>

          <div
            className="prose prose-zinc dark:prose-invert prose-lg max-w-none
              prose-headings:font-medium prose-headings:tracking-tight
              prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
              prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
              prose-p:leading-relaxed prose-p:mb-4
              prose-li:leading-relaxed
              prose-a:text-primary prose-a:no-underline hover:prose-a:underline
              prose-strong:text-foreground dark:prose-strong:text-primary-foreground
              prose-code:text-primary prose-code:bg-primary/10 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
              prose-pre:bg-secondary prose-pre:border prose-pre:border
              prose-blockquote:border-primary prose-blockquote:bg-muted dark:prose-blockquote:bg-secondary prose-blockquote:py-1 prose-blockquote:px-6 prose-blockquote:rounded-r-lg
              prose-ul:my-4 prose-ol:my-4"
            dangerouslySetInnerHTML={{ __html: formatMarkdownToHtml(post.content) }}
          />

          <div className="mt-12 pt-8 border-t border dark:border">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm text-muted-foreground dark:text-muted-foreground mr-2">Tags:</span>
              {post.tags.map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border dark:border flex items-center justify-between">
            <ShareButtons title={post.title} url={postUrl} />
            <Link href="/register">
              <Button className="gap-2">
                Try Ask Ally Free
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </article>

      {relatedPosts.length > 0 && (
        <section className="py-16 md:py-24 px-4 sm:px-6 bg-muted dark:bg-secondary/50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium text-foreground dark:text-primary-foreground mb-8">Related Articles</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <Link key={relatedPost.slug} href={`/blog/${relatedPost.slug}`}>
                  <Card className="h-full overflow-hidden border dark:border hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors group">
                    <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900">
                      {getImageSrc(relatedPost) ? (
                        <Image
                          src={getImageSrc(relatedPost)!}
                          alt={relatedPost.title}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <BookOpen className="w-12 h-12 text-zinc-300 dark:text-zinc-700 group-hover:text-primary/50 transition-colors" />
                        </div>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <Badge variant="secondary" className="mb-3">
                        {relatedPost.category}
                      </Badge>
                      <h3 className="font-medium text-foreground dark:text-primary-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                        {relatedPost.title}
                      </h3>
                      <p className="text-sm text-muted-foreground dark:text-muted-foreground line-clamp-2">{relatedPost.excerpt}</p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-16 md:py-24 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-medium text-foreground dark:text-primary-foreground mb-4">
            Ready to transform your calendar?
          </h2>
          <p className="text-muted-foreground dark:text-muted-foreground mb-8">
            Join thousands of professionals who use Ask Ally to manage their time more effectively.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                Get Started Free
                <ArrowRight className="w-4 h-4" />
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
