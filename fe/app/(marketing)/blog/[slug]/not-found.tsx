import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowLeft, Home } from 'lucide-react'

export default function BlogPostNotFound() {
  return (
    <MarketingLayout>
      <section className="px-4 py-24 sm:px-6 md:py-32">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-secondary dark:bg-secondary">
            <BookOpen className="h-10 w-10 text-muted-foreground dark:text-zinc-600" />
          </div>

          <h1 className="mb-4 text-3xl font-medium text-foreground dark:text-primary-foreground md:text-4xl">
            Article Not Found
          </h1>

          <p className="mb-8 text-lg text-muted-foreground dark:text-muted-foreground">
            The blog post you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Link href="/blog">
              <Button variant="outline" className="w-full gap-2 sm:w-auto">
                <ArrowLeft className="h-4 w-4" />
                Back to Blog
              </Button>
            </Link>
            <Link href="/">
              <Button className="w-full gap-2 sm:w-auto">
                <Home className="h-4 w-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
