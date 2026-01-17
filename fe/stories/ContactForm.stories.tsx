import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { ContactForm } from '@/components/contact/ContactForm'

const meta: Meta<typeof ContactForm> = {
  title: 'Forms/ContactForm',
  component: ContactForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A comprehensive contact form with file attachments support, drag-and-drop upload, validation, and success state. Used for customer support inquiries.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="w-full max-w-xl p-8 bg-background rounded-xl border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">Contact Us</h2>
        <p className="text-zinc-500 dark:text-zinc-400 mb-6">Have a question or need help? Fill out the form below.</p>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Default empty state of the contact form ready for user input.',
      },
    },
  },
}

export const FormFields: Story = {
  render: () => (
    <div className="space-y-8">
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Form Features:</h3>
        <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Name and email fields (required)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Subject line for categorization
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" />
            Message textarea for detailed inquiries
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            File attachments (up to 5 files, 10MB each)
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            Drag-and-drop file upload
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Form validation with error messages
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            Loading state during submission
          </li>
          <li className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary" />
            Success confirmation on completion
          </li>
        </ul>
      </div>
      <ContactForm />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Overview of all contact form features and capabilities.',
      },
    },
  },
}

export const SupportedFileTypes: Story = {
  render: () => (
    <div className="space-y-6">
      <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
        <h3 className="font-semibold text-zinc-700 dark:text-zinc-300 mb-4">Supported Attachments:</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">Images</h4>
            <ul className="space-y-1 text-zinc-500 dark:text-zinc-400">
              <li>JPEG, PNG, GIF, WebP</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">Documents</h4>
            <ul className="space-y-1 text-zinc-500 dark:text-zinc-400">
              <li>PDF, TXT</li>
              <li>Word (.doc, .docx)</li>
              <li>Excel (.xls, .xlsx)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">Other</h4>
            <ul className="space-y-1 text-zinc-500 dark:text-zinc-400">
              <li>ZIP archives</li>
              <li>CSV files</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium text-zinc-800 dark:text-zinc-200 mb-2">Limits</h4>
            <ul className="space-y-1 text-zinc-500 dark:text-zinc-400">
              <li>Max 5 files</li>
              <li>10MB per file</li>
            </ul>
          </div>
        </div>
      </div>
      <ContactForm />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Information about supported file types for attachments.',
      },
    },
  },
}

export const InPageContext: Story = {
  render: () => (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Get in Touch</h1>
        <p className="text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto">
          Our support team is here to help. Send us a message and we&apos;ll respond within 24 hours.
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 bg-white dark:bg-zinc-950 p-8 rounded-xl border border-zinc-200 dark:border-zinc-800">
          <ContactForm />
        </div>
        <div className="space-y-6">
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Email</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">support@askally.ai</p>
          </div>
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Response Time</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">Usually within 24 hours</p>
          </div>
          <div className="p-6 bg-zinc-50 dark:bg-zinc-900 rounded-lg">
            <h3 className="font-semibold text-zinc-800 dark:text-zinc-200 mb-2">Enterprise</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm">
              For enterprise inquiries, contact enterprise@askally.ai
            </p>
          </div>
        </div>
      </div>
    </div>
  ),
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        story: 'Contact form as it appears in a full page context with surrounding content.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="min-h-screen bg-background p-8">
        <Story />
      </div>
    ),
  ],
}
