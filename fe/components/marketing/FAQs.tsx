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
    <section className="w-full py-16 md:py-24">
      <div className="mx-auto max-w-4xl px-6">
        <div className="space-y-22">
          <h2 className="text-center text-4xl font-medium tracking-normal text-foreground">{t('faq.title')}</h2>

          <Accordion type="single" collapsible className="-mx-2 sm:mx-0">
            {faqItems.map((item) => (
              <div className="group" key={item.id}>
                <AccordionItem
                  value={item.id}
                  className="peer rounded-md border-none px-5 py-1 data-[state=open]:border-none data-[state=open]:bg-muted data-[state=open]:bg-secondary md:px-7"
                >
                  <AccordionTrigger className="cursor-pointer text-base text-foreground hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-base text-muted-foreground">{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
                <hr className="mx-5 -mb-px group-last:hidden peer-data-[state=open]:opacity-0 md:mx-7" />
              </div>
            ))}
          </Accordion>

          <p className="text-center text-muted-foreground">
            {t('faq.contactCta')}{' '}
            <a href="/contact" className="font-medium text-primary hover:underline">
              {t('faq.operationsTeam')}
            </a>
          </p>
        </div>
      </div>
    </section>
  )
}
