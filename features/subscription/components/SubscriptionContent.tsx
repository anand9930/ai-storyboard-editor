'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import type { BillingPeriod, SubscriptionPlan, FAQItem } from '../types';

const PLANS: SubscriptionPlan[] = [
  {
    id: 'basic',
    name: 'Basic Plan',
    monthlyPrice: 10,
    yearlyPrice: 8,
    discount: 20,
    features: [
      { text: 'Limited generations (~200 images / month)' },
      { text: 'SD video generation' },
      { text: 'General commercial terms' },
      { text: 'Optional credit top ups' },
      { text: '3 concurrent fast image jobs' },
      { text: '1 concurrent fast video job' },
      { text: 'Use editor on uploaded images' },
    ],
  },
  {
    id: 'standard',
    name: 'Standard Plan',
    monthlyPrice: 30,
    yearlyPrice: 24,
    discount: 20,
    features: [
      { text: 'Fast generations', highlight: '15h' },
      { text: 'SD and HD video generation' },
      { text: 'General commercial terms' },
      { text: 'Optional credit top ups' },
      { text: '3 concurrent fast image jobs' },
      { text: '3 concurrent fast video jobs' },
      { text: 'Unlimited Relaxed image generations' },
      { text: 'Use editor on uploaded images' },
    ],
  },
  {
    id: 'pro',
    name: 'Pro Plan',
    monthlyPrice: 60,
    yearlyPrice: 48,
    discount: 20,
    features: [
      { text: 'Fast generations', highlight: '30h' },
      { text: 'SD and HD video generation' },
      { text: 'General commercial terms' },
      { text: 'Optional credit top ups' },
      { text: '12 concurrent fast image jobs' },
      { text: '6 concurrent fast video jobs' },
      { text: 'Unlimited Relaxed image and SD video generations' },
      { text: 'Stealth mode generation' },
      { text: 'Use editor on uploaded images' },
    ],
  },
  {
    id: 'mega',
    name: 'Mega Plan',
    monthlyPrice: 120,
    yearlyPrice: 96,
    discount: 20,
    features: [
      { text: 'Fast generations', highlight: '60h' },
      { text: 'SD and HD video generation' },
      { text: 'General commercial terms' },
      { text: 'Optional credit top ups' },
      { text: '12 concurrent fast image jobs' },
      { text: '12 concurrent fast video jobs' },
      { text: 'Unlimited Relaxed image and SD video generations' },
      { text: 'Stealth mode generation' },
      { text: 'Use editor on uploaded images' },
    ],
  },
];

const FAQ_ITEMS: FAQItem[] = [
  {
    id: 'where-subscription',
    question: 'Where is my subscription?',
    answer:
      'Your subscription details can be found in your account settings. Navigate to the account page to view your current plan, billing history, and manage your subscription preferences.',
  },
  {
    id: 'fast-hours',
    question: 'What are Fast hours?',
    answer:
      'Fast hours represent priority processing time for your generations. When you use Fast mode, your images and videos are generated with higher priority in the queue, resulting in faster completion times.',
  },
  {
    id: 'relax-mode',
    question: 'What is Relax Mode? Is it unlimited?',
    answer:
      'Relax Mode allows you to generate images without using your Fast hours. Generations in Relax Mode are queued with lower priority but are unlimited for subscribers on Standard plans and above.',
  },
  {
    id: 'run-out-fast',
    question: 'What if I run out of Fast time?',
    answer:
      'If you run out of Fast time, you can continue generating using Relax Mode at no additional cost. Alternatively, you can purchase additional credits or wait until your Fast hours reset at the start of your next billing cycle.',
  },
  {
    id: 'explore-page',
    question: 'What is the Explore page?',
    answer:
      'The Explore page is a community gallery where users can discover and get inspired by creations from other members. You can browse trending generations, search by style, and find prompts that others have used.',
  },
  {
    id: 'hide-creations',
    question: "What if I don't want my creations to appear on the Explore page?",
    answer:
      'Pro and Mega plan subscribers have access to Stealth Mode, which keeps your generations private. Enable Stealth Mode in your settings to prevent your creations from appearing in the public Explore gallery.',
  },
  {
    id: 'commercial-use',
    question: 'Can I use my creations commercially?',
    answer:
      'Yes, all paid subscription plans include general commercial terms. You own the rights to use your generated images and videos for commercial purposes, subject to our terms of service.',
  },
  {
    id: 'cancel-plan',
    question: 'Can I cancel my subscription plan?',
    answer:
      'You can cancel your subscription at any time from your account settings. Your access will continue until the end of your current billing period, and you will not be charged for the next cycle.',
  },
  {
    id: 'upgrade-downgrade',
    question: 'Can I upgrade or downgrade my subscription plan?',
    answer:
      'Yes, you can change your plan at any time. Upgrades take effect immediately with prorated billing. Downgrades will take effect at the start of your next billing cycle.',
  },
  {
    id: 'delete-account',
    question: 'How can I delete my account?',
    answer:
      'To delete your account, go to Account Settings and select the option to delete your account. Please note that this action is permanent and will remove all your data, including generated images and subscription history.',
  },
  {
    id: 'survey-data',
    question: 'Where can I find and manage my survey data?',
    answer:
      'Your survey responses and preferences can be accessed and managed in the Privacy section of your account settings. You can update your preferences or request data deletion at any time.',
  },
];

function PricingCard({
  plan,
  billingPeriod,
}: {
  plan: SubscriptionPlan;
  billingPeriod: BillingPeriod;
}) {
  const isYearly = billingPeriod === 'yearly';
  const currentPrice = isYearly ? plan.yearlyPrice : plan.monthlyPrice;
  const originalPrice = plan.monthlyPrice;
  const isPopular = plan.id === 'standard';

  return (
    <Card
      className={cn(
        'relative flex flex-col shadow-none',
        isPopular && 'border-primary'
      )}
    >
      {isPopular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
          Popular
        </Badge>
      )}

      <CardHeader>
        <CardTitle className="text-lg">{plan.name}</CardTitle>
        <div className="flex items-baseline gap-sm pt-sm">
          {isYearly && (
            <span className="text-base text-muted-foreground line-through">
              ${originalPrice}
            </span>
          )}
          <span className="text-4xl font-bold">${currentPrice}</span>
          <span className="text-sm text-muted-foreground">/ month</span>
        </div>
        {isYearly && (
          <CardDescription>{plan.discount}% off billed annually</CardDescription>
        )}
      </CardHeader>

      <CardContent className="flex flex-1 flex-col gap-lg">
        <Button className="w-full" variant={isPopular ? 'default' : 'outline'}>
          Subscribe
        </Button>

        <Separator />

        <ul className="flex flex-col gap-sm text-sm text-muted-foreground">
          {plan.features.map((feature, index) => (
            <li key={index} className="flex items-start gap-sm">
              <Check className="mt-0.5 size-4 shrink-0" />
              <span>
                {feature.highlight && (
                  <span className="font-semibold text-foreground">
                    {feature.highlight}{' '}
                  </span>
                )}
                {feature.text}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}

export function SubscriptionContent() {
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('yearly');

  return (
    <main className="flex-1 overflow-auto">
      <div className="mx-auto flex max-w-6xl flex-col gap-section p-lg py-xl">
        {/* Header Section */}
        <section className="flex flex-col items-center gap-lg text-center">
          <div className="flex flex-col gap-sm">
            <h1 className="text-3xl font-bold">Purchase a subscription</h1>
            <p className="text-muted-foreground">
              Choose the plan that works for you
            </p>
          </div>

          {/* Billing Toggle */}
          <Tabs
            value={billingPeriod}
            onValueChange={(value) => setBillingPeriod(value as BillingPeriod)}
          >
            <TabsList>
              <TabsTrigger value="yearly">Yearly Billing</TabsTrigger>
              <TabsTrigger value="monthly">Monthly Billing</TabsTrigger>
            </TabsList>
          </Tabs>
        </section>

        {/* Pricing Cards */}
        <section className="grid grid-cols-1 gap-lg sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <PricingCard
              key={plan.id}
              plan={plan}
              billingPeriod={billingPeriod}
            />
          ))}
        </section>

        {/* FAQ Section */}
        <section className="flex flex-col gap-lg">
          <h2 className="text-center text-2xl font-bold">
            Frequently Asked Questions
          </h2>
          <div className="mx-auto w-full max-w-3xl">
            <Accordion type="single" collapsible className="w-full">
              {FAQ_ITEMS.map((item) => (
                <AccordionItem key={item.id} value={item.id}>
                  <AccordionTrigger className="text-left hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>

          {/* FAQ Footer */}
          <p className="text-center text-sm text-muted-foreground">
            {"Can't find the answer you're looking for? Read the "}
            <Button variant="link" className="h-auto p-0 text-primary">
              Getting Started Guide
            </Button>
            {' or '}
            <Button variant="link" className="h-auto p-0 text-primary">
              contact support
            </Button>
            .
          </p>
        </section>
      </div>
    </main>
  );
}
