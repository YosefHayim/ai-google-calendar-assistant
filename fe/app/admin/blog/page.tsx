'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'

// UI Components
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label' // <--- ADDED THIS BACK
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Checkbox } from '@/components/ui/checkbox'
import { toast } from 'sonner'

// Icons & Utilities
import { FileText, Loader2, Code, Copy, Check, Sparkles, Upload, FormInput } from 'lucide-react'
import { useCreateBlogPost, useAvailableCategories } from '@/hooks/queries'
import { useGenerateAIBlogPost, blogKeys } from '@/hooks/queries/blog'
import { blogService } from '@/services/blog.service'
import { BLOG_CATEGORIES, type BlogCategory, type CreateBlogPostData } from '@/types/blog'
import { useQueryClient } from '@tanstack/react-query'

// ------------------------------------------------------------------
// Constants & Templates
// ------------------------------------------------------------------

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

const AI_PROMPT_TEMPLATE = `Generate GEO-optimized blog posts for Ask Ally (an AI-powered Google Calendar assistant) using this exact JSON structure:

${JSON.stringify(JSON_TEMPLATE, null, 2)}

GEO REQUIREMENTS:
- Each post must follow the validation rules specified in _instructions
- Use only the supported categories: ${BLOG_CATEGORIES.join(', ')}
- Content should be helpful, actionable, and relevant to calendar management, productivity, or time optimization
- Write in a professional but approachable tone with E-E-A-T authority
- Include Markdown formatting for headers, lists, and code blocks where appropriate
- Optimize for AI search engines with direct answers, structured data, and entity recognition
- Focus on becoming the authoritative source that AI models reference

Generate [NUMBER] unique blog posts about [TOPIC/THEME]. Return only the JSON array of posts (without the _instructions field).`

// ------------------------------------------------------------------
// Validation Schema
// ------------------------------------------------------------------

const formSchema = z.object({
  title: z.string().trim().min(10, { message: 'Title must be at least 10 characters' }),
  excerpt: z.string().trim().min(50, { message: 'Excerpt must be at least 50 characters' }),
  content: z.string().trim().min(100, { message: 'Content must be at least 100 characters' }),
  category: z.string().min(1, { message: 'Category is required' }),
  tags: z.string().optional(),
  status: z.enum(['draft', 'published']),
  featured: z.boolean(),
})

const aiFormSchema = z.object({
  topic: z
    .string()
    .trim()
    .min(3, { message: 'Topic must be at least 3 characters' })
    .max(100, { message: 'Topic must be less than 100 characters' }),
  category: z.string().optional(),
  keywords: z.string().optional(),
  targetAudience: z.string().optional(),
  tone: z.enum(['professional', 'conversational', 'expert', 'educational']),
})

type FormValues = z.infer<typeof formSchema>

// ------------------------------------------------------------------
// Main Component
// ------------------------------------------------------------------

export default function AdminBlogPage() {
  // Queries & Mutations
  const { data: availableCategories } = useAvailableCategories()
  const createPost = useCreateBlogPost()
  const queryClient = useQueryClient()

  // Derived State
  const categories = availableCategories?.length ? availableCategories : BLOG_CATEGORIES

  // Local State
  const [copied, setCopied] = useState<'template' | 'prompt' | null>(null)
  const [bulkJson, setBulkJson] = useState('')
  const [bulkError, setBulkError] = useState<string | null>(null)
  const [isBulkCreating, setIsBulkCreating] = useState(false)
  const [bulkProgress, setBulkProgress] = useState({ current: 0, total: 0 })

  // Form Definition
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      excerpt: '',
      content: '',
      category: 'Productivity',
      tags: '',
      status: 'published',
      featured: false,
    },
  })

  // AI Form Definition
  const aiForm = useForm<z.infer<typeof aiFormSchema>>({
    resolver: zodResolver(aiFormSchema),
    defaultValues: {
      topic: '',
      category: 'Productivity',
      keywords: '',
      targetAudience: 'busy professionals and time-conscious individuals',
      tone: 'professional',
    },
  })

  // AI Generate Mutation
  const generateAI = useGenerateAIBlogPost({
    onSuccess: () => {
      aiForm.reset()
    },
  })

  // ----------------------------------------------------------------
  // Handlers
  // ----------------------------------------------------------------

  const onSubmit = (data: FormValues) => {
    const postData: CreateBlogPostData = {
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      category: data.category as BlogCategory,
      featured: data.featured,
      status: data.status,
      tags: data.tags
        ? data.tags
            .split(',')
            .map((t) => t.trim())
            .filter(Boolean)
        : [],
    }

    createPost.mutate(postData, {
      onSuccess: () => {
        form.reset({
          title: '',
          excerpt: '',
          content: '',
          category: 'Productivity',
          tags: '',
          status: 'published',
          featured: false,
        })
        toast.success('Blog post created successfully!')
      },
      onError: (error) => {
        toast.error(`Failed to create post: ${error.message}`)
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

  const handleBulkSubmit = async () => {
    setBulkError(null)

    let posts: CreateBlogPostData[]
    try {
      const parsed = JSON.parse(bulkJson)
      posts = Array.isArray(parsed) ? parsed : parsed.posts
      if (!Array.isArray(posts) || posts.length === 0) {
        setBulkError('JSON must be an array of posts or an object with a "posts" array')
        return
      }
    } catch {
      setBulkError('Invalid JSON format. Please check your syntax.')
      return
    }

    setIsBulkCreating(true)
    setBulkProgress({ current: 0, total: posts.length })

    let successCount = 0
    let failCount = 0
    const errors: string[] = []

    for (let i = 0; i < posts.length; i++) {
      const post = posts[i]
      try {
        await blogService.create(post)
        successCount++
      } catch (err) {
        failCount++
        errors.push(
          `Post ${i + 1} ("${post.title?.slice(0, 30)}..."): ${err instanceof Error ? err.message : 'Unknown error'}`,
        )
      }
      setBulkProgress({ current: i + 1, total: posts.length })
    }

    setIsBulkCreating(false)
    queryClient.invalidateQueries({ queryKey: blogKeys.all })

    if (successCount > 0 && failCount === 0) {
      toast.success(`Created ${successCount} blog posts successfully!`)
      setBulkJson('')
    } else if (successCount > 0 && failCount > 0) {
      toast.warning(`Created ${successCount} posts, ${failCount} failed`, {
        description: errors.slice(0, 3).join('\n'),
      })
    } else {
      toast.error(`Failed to create posts`, {
        description: errors.slice(0, 3).join('\n'),
      })
    }
  }

  // ----------------------------------------------------------------
  // JSX
  // ----------------------------------------------------------------

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground dark:text-white">Create Blog Post</h1>
        <p className="text-muted-foreground dark:text-muted-foreground mt-1">Write and publish new blog articles</p>
      </div>

      <Tabs defaultValue="editor" className="w-full">
        <TabsList className="grid w-full max-w-lg grid-cols-3">
          <TabsTrigger value="editor" className="gap-2">
            <FileText className="w-4 h-4" />
            Editor
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-2">
            <Sparkles className="w-4 h-4" />
            GEO AI Generate
          </TabsTrigger>
          <TabsTrigger value="json" className="gap-2">
            <Code className="w-4 h-4" />
            JSON Template
          </TabsTrigger>
        </TabsList>

        <TabsContent value="editor" className="mt-6">
          <Tabs defaultValue="form" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="form" className="gap-2">
                <FormInput className="w-4 h-4" />
                Single Post
              </TabsTrigger>
              <TabsTrigger value="bulk" className="gap-2">
                <Upload className="w-4 h-4" />
                Bulk JSON
              </TabsTrigger>
            </TabsList>

            <TabsContent value="form">
              <Card>
                <CardHeader>
                  <CardTitle>New Post Details</CardTitle>
                  <CardDescription>Fill out the form below to create a new blog entry.</CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                      {/* Title */}
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Title <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input placeholder="Enter a compelling title for your post..." {...field} />
                            </FormControl>
                            <FormDescription>Minimum 10 characters.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Excerpt */}
                      <FormField
                        control={form.control}
                        name="excerpt"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Excerpt <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Write a short description that summarizes your post..."
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Minimum 50 characters. This appears in post previews.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Content */}
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Content <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Write your blog post content in Markdown format..."
                                rows={12}
                                className="font-mono text-sm"
                                {...field}
                              />
                            </FormControl>
                            <FormDescription>Minimum 100 characters. Supports Markdown formatting.</FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Category */}
                        <FormField
                          control={form.control}
                          name="category"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Category <span className="text-destructive">*</span>
                              </FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select a category" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {categories.map((cat) => (
                                    <SelectItem key={cat} value={cat}>
                                      {cat}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Tags */}
                        <FormField
                          control={form.control}
                          name="tags"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tags</FormLabel>
                              <FormControl>
                                <Input placeholder="react, typescript, calendar..." {...field} />
                              </FormControl>
                              <FormDescription>Comma-separated list of tags</FormDescription>
                              <FormMessage />
                              {/* Tag Preview */}
                              {field.value && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                  {field.value
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
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Status */}
                        <FormField
                          control={form.control}
                          name="status"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Status</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex gap-4"
                                >
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="published" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">Published</FormLabel>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2 space-y-0">
                                    <FormControl>
                                      <RadioGroupItem value="draft" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">Draft</FormLabel>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Featured */}
                        <FormField
                          control={form.control}
                          name="featured"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel className="cursor-pointer">Featured Post</FormLabel>
                                <FormDescription>Featured posts appear prominently on the blog</FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t ">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() =>
                            form.reset({
                              title: '',
                              excerpt: '',
                              content: '',
                              category: 'Productivity',
                              tags: '',
                              status: 'published',
                              featured: false,
                            })
                          }
                        >
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
                  </Form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bulk">
              <Card className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-foreground dark:text-white mb-2">Bulk Create from JSON</h3>
                  <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                    Paste a JSON array of blog posts to create multiple posts in one request. Use the JSON Template tab
                    for the expected format.
                  </p>
                </div>

                <div className="bg-accent/30 border-accent rounded-lg p-4">
                  <h4 className="font-medium text-accent-foreground mb-2">🤖 GEO/AEO Optimization Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • <strong>Direct Answer First</strong> - Immediate solutions in opening paragraphs
                    </li>
                    <li>
                      • <strong>E-E-A-T Authority</strong> - Establishes expertise and trustworthiness
                    </li>
                    <li>
                      • <strong>Entity Optimization</strong> - Positions Ask Ally as authoritative entity
                    </li>
                    <li>
                      • <strong>Zero-Click Content</strong> - Comprehensive answers for AI search results
                    </li>
                    <li>
                      • <strong>Structured Data</strong> - LLM-parseable content with clear hierarchies
                    </li>
                    <li>
                      • <strong>Multi-Platform Citations</strong> - Content valuable for AI assistants to reference
                    </li>
                  </ul>
                </div>

                <div className="bg-accent/30 border-accent rounded-lg p-4">
                  <h4 className="font-medium text-accent-foreground mb-2">🤖 GEO/AEO Optimization Features</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>
                      • <strong>Direct Answer First</strong> - Immediate solutions in opening paragraphs
                    </li>
                    <li>
                      • <strong>E-E-A-T Authority</strong> - Establishes expertise and trustworthiness
                    </li>
                    <li>
                      • <strong>Entity Optimization</strong> - Positions Ask Ally as authoritative entity
                    </li>
                    <li>
                      • <strong>Zero-Click Content</strong> - Comprehensive answers for AI search results
                    </li>
                    <li>
                      • <strong>Structured Data</strong> - LLM-parseable content with clear hierarchies
                    </li>
                    <li>
                      • <strong>Multi-Platform Citations</strong> - Content valuable for AI assistants to reference
                    </li>
                  </ul>
                </div>

                <div></div>

                <div className="space-y-2">
                  {/* CHANGED FROM FormLabel TO Label TO FIX ERROR */}
                  <Label htmlFor="bulkJson">JSON Payload</Label>
                  <Textarea
                    id="bulkJson"
                    placeholder={`[
  {
    "title": "First Post Title",
    "excerpt": "First post excerpt...",
    "content": "First post content in Markdown...",
    "category": "Productivity",
    "status": "published",
    "tags": ["tag1", "tag2"]
  },
  {
    "title": "Second Post Title",
    ...
  }
]`}
                    value={bulkJson}
                    onChange={(e) => {
                      setBulkJson(e.target.value)
                      setBulkError(null)
                    }}
                    rows={16}
                    className={`font-mono text-sm ${bulkError ? 'border-destructive' : ''}`}
                  />
                  {bulkError && <p className="text-sm text-destructive">{bulkError}</p>}
                  <p className="text-xs text-muted-foreground">
                    Accepts either a JSON array of posts or an object with a &quot;posts&quot; array
                  </p>
                </div>

                {isBulkCreating && bulkProgress.total > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-600 dark:text-muted-foreground">Creating posts...</span>
                      <span className="font-medium">
                        {bulkProgress.current} / {bulkProgress.total}
                      </span>
                    </div>
                    <div className="w-full bg-accent dark:bg-zinc-700 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${(bulkProgress.current / bulkProgress.total) * 100}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t ">
                  <Button type="button" variant="outline" onClick={() => setBulkJson('')} disabled={isBulkCreating}>
                    Clear
                  </Button>
                  <Button onClick={handleBulkSubmit} disabled={isBulkCreating || !bulkJson.trim()}>
                    {isBulkCreating ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Creating {bulkProgress.current}/{bulkProgress.total}...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Create Posts
                      </>
                    )}
                  </Button>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                GEO AI-Powered Blog Generation
              </CardTitle>
              <CardDescription>
                Generate extraordinary GEO-optimized blog posts with AI. Includes Generative Engine Optimization for AI
                search, geo-targeting, entity optimization, and conversion-focused content that ranks in AI Overviews.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...aiForm}>
                <form
                  onSubmit={aiForm.handleSubmit((data) => {
                    const keywords = data.keywords
                      ? data.keywords
                          .split(',')
                          .map((k) => k.trim())
                          .filter(Boolean)
                      : []
                    generateAI.mutate({
                      topic: data.topic,
                      category: data.category as BlogCategory,
                      keywords,
                      targetAudience: data.targetAudience,
                      tone: data.tone,
                    })
                  })}
                  className="space-y-6"
                >
                  {/* Topic */}
                  <FormField
                    control={aiForm.control}
                    name="topic"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Topic <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="e.g., Time Management Techniques, Calendar Optimization, Productivity Hacks"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          The main topic or keyword for your blog post. Will be optimized for SEO.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Category */}
                    <FormField
                      control={aiForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {categories.map((cat) => (
                                <SelectItem key={cat} value={cat}>
                                  {cat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Tone */}
                    <FormField
                      control={aiForm.control}
                      name="tone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tone</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select writing tone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="professional">Professional</SelectItem>
                              <SelectItem value="conversational">Conversational</SelectItem>
                              <SelectItem value="expert">Expert</SelectItem>
                              <SelectItem value="educational">Educational</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Writing style for the generated content</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Keywords */}
                  <FormField
                    control={aiForm.control}
                    name="keywords"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Additional Keywords</FormLabel>
                        <FormControl>
                          <Input placeholder="time management, productivity, calendar, AI assistant" {...field} />
                        </FormControl>
                        <FormDescription>
                          Comma-separated keywords to include in SEO optimization (optional)
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Target Audience */}
                  <FormField
                    control={aiForm.control}
                    name="targetAudience"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Target Audience</FormLabel>
                        <FormControl>
                          <Input placeholder="busy professionals, entrepreneurs, remote workers" {...field} />
                        </FormControl>
                        <FormDescription>
                          Who is this blog post written for? Helps tailor the content and messaging.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="bg-accent/30 border-accent rounded-lg p-4">
                    <h4 className="font-medium text-accent-foreground mb-2">🚀 GEO/AEO Optimization Engine</h4>
                    <ul className="text-sm text-muted-foreground space-y-1">
                      <li>
                        • <strong>Zero-Click Optimization</strong> - Direct answers for AI search results
                      </li>
                      <li>
                        • <strong>E-E-A-T Authority</strong> - Experience, Expertise, Authoritativeness, Trust
                      </li>
                      <li>
                        • <strong>Entity Recognition</strong> - Positions Ask Ally as authoritative calendar AI
                      </li>
                      <li>
                        • <strong>LLM-Structured Content</strong> - Parseable by Large Language Models
                      </li>
                      <li>
                        • <strong>Multi-Platform Citations</strong> - Valuable for AI assistants to reference
                      </li>
                      <li>
                        • <strong>Question-Based Headings</strong> - Optimized for AI Overviews
                      </li>
                    </ul>
                  </div>

                  <div className="flex justify-end gap-3 pt-4 border-t border-border">
                    <Button type="button" variant="outline" onClick={() => aiForm.reset()}>
                      Reset Form
                    </Button>
                    <Button type="submit" disabled={generateAI.isPending} className="gap-2">
                      {generateAI.isPending ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Generating GEO-Optimized Content...
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Generate with GEO AI
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="json" className="mt-6 space-y-6">
          <Card className="p-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold text-foreground dark:text-white">AI Prompt Template</h3>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleCopy('prompt')} className="gap-2">
                  {copied === 'prompt' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied === 'prompt' ? 'Copied!' : 'Copy Prompt'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                Copy this GEO-optimized prompt and paste it to any AI (ChatGPT, Claude, etc.) to generate blog posts
                that rank in AI search results. Replace [NUMBER] and [TOPIC/THEME] with your requirements for Generative
                Engine Optimization.
              </p>
              <div className="relative">
                <pre className="bg-secondary text-primary-foreground p-4 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-[300px] overflow-y-auto">
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
                  <h3 className="font-semibold text-foreground dark:text-white">JSON Payload Structure</h3>
                </div>
                <Button variant="outline" size="sm" onClick={() => handleCopy('template')} className="gap-2">
                  {copied === 'template' ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                  {copied === 'template' ? 'Copied!' : 'Copy JSON'}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                This is the expected payload structure for creating blog posts. The{' '}
                <code className="px-1 py-0.5 bg-secondary dark:bg-secondary rounded text-xs">_instructions</code> field
                contains validation rules and tips.
              </p>
              <div className="relative">
                <pre className="bg-secondary text-primary-foreground p-4 rounded-lg overflow-x-auto text-xs leading-relaxed max-h-[500px] overflow-y-auto">
                  <code>{JSON.stringify(JSON_TEMPLATE, null, 2)}</code>
                </pre>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-primary/5 border-primary/20">
            <div className="space-y-3">
              <h3 className="font-semibold text-foreground dark:text-white flex items-center gap-2">
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
              <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                When generating posts with AI, ensure the category field uses one of these exact values.
              </p>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="font-semibold text-foreground dark:text-white mb-4">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-zinc-600 dark:text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">1.</span>
                <span>
                  <strong>GEO-Optimized Content</strong> - Posts are optimized for AI search engines (Google AI
                  Overviews, ChatGPT, etc.)
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">2.</span>
                <span>
                  <strong>Direct Answers First</strong> - Content provides immediate solutions to rank in zero-click
                  search results
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">3.</span>
                <span>
                  <strong>E-E-A-T Authority</strong> - Establishes Ask Ally as the authoritative AI calendar assistant
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">4.</span>
                <span>
                  <strong>Use the AI Generate Tab</strong> for one-click GEO-optimized blog creation with your custom
                  parameters
                </span>
              </li>
            </ul>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
