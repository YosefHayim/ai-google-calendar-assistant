'use client'

import React, { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { FileText, Loader2 } from 'lucide-react'
import { useCreateBlogPost, useAvailableCategories } from '@/hooks/queries'
import { BLOG_CATEGORIES, type BlogCategory, type CreateBlogPostData } from '@/types/blog'

export default function AdminBlogPage() {
  const [title, setTitle] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [category, setCategory] = useState<BlogCategory>('Productivity')
  const [tags, setTags] = useState('')
  const [featured, setFeatured] = useState(false)
  const [status, setStatus] = useState<'draft' | 'published'>('published')
  const [errors, setErrors] = useState<Record<string, string>>({})

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

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Create Blog Post</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Write and publish new blog articles</p>
      </div>

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
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTitle('')
                setExcerpt('')
                setContent('')
                setCategory('Productivity')
                setTags('')
                setFeatured(false)
                setStatus('published')
                setErrors({})
              }}
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
      </Card>
    </div>
  )
}
