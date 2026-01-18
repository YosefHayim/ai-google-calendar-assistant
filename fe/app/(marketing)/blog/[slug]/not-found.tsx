import Link from 'next/link'
import MarketingLayout from '@/components/marketing/MarketingLayout'
import { Button } from '@/components/ui/button'
import { BookOpen, ArrowLeft, Home } from 'lucide-react'

export default function BlogPostNotFound() {
  return (
    <MarketingLayout>
      <section className="py-24 md:py-32 px-4 sm:px-6">
        <div className="max-w-2xl mx-auto text-center">
          <div className="w-20 h-20 rounded-2xl bg-secondary dark:bg-secondary flex items-center justify-center mx-auto mb-8">
            <BookOpen className="w-10 h-10 text-muted-foreground dark:text-zinc-600" />
          </div>

          <h1 className="text-3xl md:text-4xl font-medium text-foreground dark:text-primary-foreground mb-4">Article Not Found</h1>

          <p className="text-lg text-muted-foreground dark:text-muted-foreground mb-8">
            The blog post you&apos;re looking for doesn&apos;t exist or has been moved.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/blog">
              <Button variant="outline" className="gap-2 w-full sm:w-auto">
                <ArrowLeft className="w-4 h-4" />
                Back to Blog
              </Button>
            </Link>
            <Link href="/">
              <Button className="gap-2 w-full sm:w-auto">
                <Home className="w-4 h-4" />
                Go Home
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </MarketingLayout>
  )
}
