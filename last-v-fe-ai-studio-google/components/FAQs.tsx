
import React from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion'

const faqItems = [
    {
        id: 'item-1',
        question: 'Why do you charge for "Interactions"?',
        answer: 'We believe in a transparent value exchange. Every interaction uses advanced neural reasoning to audit or adjust your operations. By measuring interactions, we ensure you only pay for the command you actually exercise over your schedule.',
    },
    {
        id: 'item-2',
        question: 'What is "Total Sovereignty"?',
        answer: 'The Executive plan for $7/mo grants you uncapped access to our neural arbitrator. This is for high-volume owners who need 24/7 oversight across multiple complex calendars with priority neural processing.',
    },
    {
        id: 'item-3',
        question: 'Can I audit my own time data?',
        answer: 'Yes. Our Intelligence dashboard provides granular insights into your focus ratio and context switching costs. We believe you should own your time data as much as you own your business.',
    },
    {
        id: 'item-4',
        question: 'Is my data used for AI training?',
        answer: 'Absolutely not. We believe your private office should remain private. Your schedule is stored in an encrypted silo and is never used to train foundational models. Your sovereignty is our priority.',
    },
    {
        id: 'item-5',
        question: 'How do custom credit packs scale?',
        answer: 'For businesses with seasonal workloads, custom credits ($1 = 100 actions) allow you to scale your command up or down without changing your subscription. They never expire and act as an operational reserve.',
    },
]

export default function FAQs() {
    return (
        <section className="py-16 md:py-24 w-full">
            <div className="mx-auto max-w-4xl px-6">
                <div className="space-y-12">
                    <h2 className="text-zinc-900 dark:text-zinc-100 text-center text-4xl font-medium tracking-normal">Common Inquiries</h2>

                    <Accordion
                        type="single"
                        collapsible
                        className="-mx-2 sm:mx-0">
                        {faqItems.map((item) => (
                            <div
                                className="group"
                                key={item.id}>
                                <AccordionItem
                                    value={item.id}
                                    className="data-[state=open]:bg-zinc-50 dark:data-[state=open]:bg-zinc-900 peer rounded-md border-none px-5 py-1 data-[state=open]:border-none md:px-7">
                                    <AccordionTrigger className="cursor-pointer text-base text-zinc-900 dark:text-zinc-100 hover:no-underline">{item.question}</AccordionTrigger>
                                    <AccordionContent>
                                        <p className="text-base text-zinc-500 dark:text-zinc-400">{item.answer}</p>
                                    </AccordionContent>
                                </AccordionItem>
                                <hr className="mx-5 -mb-px group-last:hidden peer-data-[state=open]:opacity-0 border-zinc-200 dark:border-zinc-800 md:mx-7" />
                            </div>
                        ))}
                    </Accordion>

                    <p className="text-zinc-500 dark:text-zinc-400 text-center">
                        Need an organization-wide deployment? Contact our{' '}
                        <a
                            href="/contact"
                            className="text-primary font-medium hover:underline">
                            operations team
                        </a>
                    </p>
                </div>
            </div>
        </section>
    )
}
