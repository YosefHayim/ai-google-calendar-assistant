'use client'

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { useTranslation } from 'react-i18next'

const FAQ_KEYS = ['interactions', 'sovereignty', 'audit', 'dataTraining', 'credits'] as const

export default function FAQs() {
  const { t } = useTranslation()

  const faqItems = FAQ_KEYS.map((key, index) => ({
    id: `item-${index + 1}`,
    question: t(`faq.questions.${key}.question`),
    answer: t(`faq.questions.${key}.answer`),
  }))

  return (
    <section className="py-16 md:py-24 w-full">
      <div className="mx-auto max-w-4xl px-6">
        <div className="space-y-22">
          <h2 className="text-zinc-900 dark:text-zinc-100 text-center text-4xl font-medium tracking-normal">
            {t('faq.title')}
          </h2>

          <Accordion type="single" collapsible className="-mx-2 sm:mx-0">
            {faqItems.map((item) => (
              <div className="group" key={item.id}>
                <AccordionItem
                  value={item.id}
                  className="data-[state=open]:bg-zinc-50 dark:data-[state=open]:bg-zinc-900 peer rounded-md border-none px-5 py-1 data-[state=open]:border-none md:px-7"
                >
                  <AccordionTrigger className="cursor-pointer text-base text-zinc-900 dark:text-zinc-100 hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-base text-zinc-500 dark:text-zinc-400">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
                <hr className="mx-5 -mb-px group-last:hidden peer-data-[state=open]:opacity-0 border-zinc-200 dark:border-zinc-800 md:mx-7" />
              </div>
            ))}
          </Accordion>

          <p className="text-zinc-500 dark:text-zinc-400 text-center">
            {t('faq.contactCta')}{' '}
            <a href="/contact" className="text-primary font-medium hover:underline">
              {t('faq.operationsTeam')}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
