'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { FileText, Loader2, Code, Copy, Check, Sparkles } from 'lucide-react'
import { useCreateBlogPost, useAvailableCategories } from '@/hooks/queries'
import { BLOG_CATEGORIES, type BlogCategory, type CreateBlogPostData } from '@/types/blog'
import { toast } from 'sonner'

const JSON_TEMPLATE = {
  posts: [
    {
      title: 'Your Blog Post Title Here (minimum 10 characters)',
      excerpt:
        'A compelling summary of your blog post that appears in previews. Should be at least 50 characters and hook the reader.',
      content: `## Introduction

Write your blog post content here using Markdown formatting.

### Key Points

- Point 1: Explain the main concept
- Point 2: Provide practical examples  
- Point 3: Share actionable tips

### Detailed Section

Go deeper into your topic with detailed explanations, code examples, or step-by-step guides.

\`\`\`javascript
// You can include code blocks
const example = 'Like this';
\`\`\`

### Conclusion

Wrap up with key takeaways and a call to action.`,
      category: 'Productivity',
      featured: false,
      status: 'published',
      tags: ['productivity', 'tips', 'calendar'],
      author: {
        name: 'Author Name',
        role: 'Content Writer',
      },
      read_time: '5 min read',
      seo: {
        title: 'SEO Title - Keep under 60 characters',
        description: 'SEO meta description for search engines. Keep under 160 characters for best results.',
        keywords: ['keyword1', 'keyword2', 'keyword3'],
      },
    },
  ],
  _instructions: {
    categories: [
      'Productivity',
      'Time Management',
      'AI & Technology',
      'Tips & Tricks',
      'Work-Life Balance',
      'Meeting Efficiency',
    ],
    validation_rules: {
      title: 'Minimum 10 characters, should be compelling and SEO-friendly',
      excerpt: 'Minimum 50 characters, appears in post previews and search results',
      content: 'Minimum 100 characters, supports full Markdown formatting',
      category: 'Must be one of the supported categories listed above',
      status: 'Either "draft" or "published"',
      tags: 'Array of lowercase strings, comma-separated topics',
    },
    tips: [
      'Use engaging titles that include keywords',
      'Write excerpts that make readers want to click',
      'Structure content with headers (##, ###) for readability',
      'Include practical examples and actionable advice',
      'Add relevant tags for discoverability',
      'Set featured: true only for your best content',
    ],
  },
}

const AI_PROMPT_TEMPLATE = `Generate blog posts for Ask Ally (an AI-powered Google Calendar assistant) using this exact JSON structure:

${JSON.stringify(JSON_TEMPLATE, null, 2)}

REQUIREMENTS:
- Each post must follow the validation rules specified in _instructions
- Use only the supported categories: ${BLOG_CATEGORIES.join(', ')}
- Content should be helpful, actionable, and relevant to calendar management, productivity, or time optimization
- Write in a professional but approachable tone
- Include Markdown formatting for headers, lists, and code blocks where appropriate

Generate [NUMBER] unique blog posts about [TOPIC/THEME]. Return only the JSON array of posts (without the _instructions field).`

export default function AdminBlogPage() {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<BlogCategory>('Productivity')
  const [tags, setTags] = useState('')
  const [featured, setFeatured] = useState(false)
  const [status, setStatus] = useState<'draft' | 'published'>('published')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [copied, setCopied] = useState<'template' | 'prompt' | null>(null)

  const { data: availableCategories } = useAvailableCategories()
  const createPost = useCreateBlogPost()

  const categories = availableCategories?.length ? availableCategories : BLOG_CATEGORIES

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!title.trim()) {
      newErrors.title = 'Title is required'
    } else if (title.trim().length < 10) {
      newErrors.title = 'Title must be at least 10 characters'
    }

    if (!excerpt.trim()) {
      newErrors.excerpt = 'Excerpt is required'
    } else if (excerpt.trim().length < 50) {
      newErrors.excerpt = 'Excerpt must be at least 50 characters'
    }

    if (!content.trim()) {
      newErrors.content = 'Content is required'
    } else if (content.trim().length < 100) {
      newErrors.content = 'Content must be at least 100 characters'
    }

    if (!category) {
      newErrors.category = 'Category is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    const postData: CreateBlogPostData = {
      title: title.trim(),
      excerpt: excerpt.trim(),
      content: content.trim(),
      category,
      featured,
      status,
      tags: tags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean),
    }

    createPost.mutate(postData, {
      onSuccess: () => {
        setTitle('')
        setExcerpt('')
        setContent('')
        setCategory('Productivity')
        setTags('')
        setFeatured(false)
        setStatus('published')
        setErrors({})
      },
    })
  }

  const handleCopy = async (type: 'template' | 'prompt') => {
    const textToCopy = type === 'template' ? JSON.stringify(JSON_TEMPLATE, null, 2) : AI_PROMPT_TEMPLATE

    try {
      await navigator.clipboard.writeText(textToCopy)
      setCopied(type)
      toast.success('Copied to clipboard!')
      setTimeout(() => setCopied(null), 2000)
    } catch {
      toast.error('Failed to copy')
    }
  }

  const clearForm = () => {
    setTitle('')
    setExcerpt('')
    setContent('')
    setCategory('Productivity')
    setTags('')
    setFeatured(false)
    setStatus('published')
    setErrors({})
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Create Blog Post</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Write and publish new blog articles</p>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="editor" className="gap-2">
            <FileText className="w-4 h-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="json" className="gap-2">
            <Code className="w-4 h-4" />
            JSON Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6">
          <Card className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">
                  Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="title"
                  placeholder="Enter a compelling title for your post..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={errors.title ? 'border-red-500' : ''}
                />
                {errors.title && <p className="text-sm text-red-500">{errors.title}</p>}
                <p className="text-xs text-zinc-500">Minimum 10 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">
                  Excerpt <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="excerpt"
                  placeholder="Write a short description that summarizes your post..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  rows={3}
                  className={errors.excerpt ? 'border-red-500' : ''}
                />
                {errors.excerpt && <p className="text-sm text-red-500">{errors.excerpt}</p>}
                <p className="text-xs text-zinc-500">Minimum 50 characters. This appears in post previews.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">
                  Content <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="content"
                  placeholder="Write your blog post content in Markdown format..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={12}
                  className={errors.content ? 'border-red-500' : ''}
                />
                {errors.content && <p className="text-sm text-red-500">{errors.content}</p>}
                <p className="text-xs text-zinc-500">Minimum 100 characters. Supports Markdown formatting.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="category">
                    Category <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value as BlogCategory)}
                    className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-700 rounded-md bg-white dark:bg-zinc-900 text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  {errors.category && <p className="text-sm text-red-500">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags</Label>
                  <Input
                    id="tags"
                    placeholder="react, typescript, calendar..."
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                  />
                  <p className="text-xs text-zinc-500">Comma-separated list of tags</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="published"
                        checked={status === 'published'}
                        onChange={() => setStatus('published')}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm">Published</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="radio"
                        name="status"
                        value="draft"
                        checked={status === 'draft'}
                        onChange={() => setStatus('draft')}
                        className="w-4 h-4 text-primary"
                      />
                      <span className="text-sm">Draft</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Featured</Label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="w-4 h-4 rounded border-zinc-300 text-primary focus:ring-primary"
                    />
                    <span className="text-sm">Mark as featured post</span>
                  </label>
                  <p className="text-xs text-zinc-500">Featured posts appear prominently on the blog</p>
                </div>
              </div>

              {tags && (
                <div className="flex flex-wrap gap-2">
                  {tags
                    .split(',')
                    .map((t) => t.trim())
                    .filter(Boolean)
                    .map((tag, index) => (
                      <Badge key={index} variant="secondary">
                        {tag}
                      </Badge>
                    ))}
                </div>
              )}

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                <Button type="button" variant="outline" onClick={clearForm}>
                  Clear Form
                </Button>
                <Button type="submit" disabled={createPost.isPending}>
                  {createPost.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Create Post
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="mt-6 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-zinc-900 dark:text-white">AI Prompt Template</h3>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleCopy('prompt')} className="gap-2">
                  {copied === 'prompt' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied === 'prompt' ? 'Copied!' : 'Copy Prompt'}
                </Button>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Copy this prompt and paste it to any AI (ChatGPT, Claude, etc.) to generate blog posts. Replace
                [NUMBER] and [TOPIC/THEME] with your requirements.
              </p>
              <div className="relative">
                <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-[300px] overflow-y-auto">
                  {AI_PROMPT_TEMPLATE}
                </pre>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-zinc-900 dark:text-white">JSON Payload Structure</h3>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleCopy('template')} className="gap-2">
                  {copied === 'template' ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
                  {copied === 'template' ? 'Copied!' : 'Copy JSON'}
                </Button>
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                This is the expected payload structure for creating blog posts. The{' '}
                <code className="px-1 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded text-xs">_instructions</code> field
                contains validation rules and tips.
              </p>
              <div className="relative">
                <pre className="bg-zinc-950 text-zinc-100 p-4 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-[500px] overflow-y-auto">
                  <code>{JSON.stringify(JSON_TEMPLATE, null, 2)}</code>
                </pre>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="space-y-3">
              <h3 className="font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Supported Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {BLOG_CATEGORIES.map((cat) => (
                  <Badge key={cat} variant="secondary">
                    {cat}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                When generating posts with AI, ensure the category field uses one of these exact values.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-zinc-900 dark:text-white mb-4">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">1.</span>
                <span>
                  <strong>Copy the AI Prompt</strong> and paste it into ChatGPT, Claude, or any other AI assistant
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">2.</span>
                <span>
                  <strong>Customize the request</strong> by replacing [NUMBER] with how many posts you want and
                  [TOPIC/THEME] with your desired subject
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">3.</span>
                <span>
                  <strong>Review the generated JSON</strong> and make any necessary edits before importing
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">4.</span>
                <span>
                  <strong>Use the Editor tab</strong> to manually create individual posts or import the AI-generated
                  content
                </span>
              </li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
