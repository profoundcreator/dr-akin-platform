"use client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Reveal } from "@/components/ui/reveal";
import { openEnquiryModal } from "@/lib/enquiry";

export function HeroSection() {
  return (
    <section className="ploy-section pt-8 lg:pt-12">
      <div className="ploy-container">
        <div className="grid items-center gap-12 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16">
          <Reveal className="space-y-8">
            <div className="space-y-4">
              <p className="ploy-kicker">Executive Leadership & Transformation</p>
              <Heading as="h1" size="display" className="ploy-text-balance">
                Building leaders who transform organisations from the inside out.
              </Heading>
              <p className="max-w-xl text-lg leading-relaxed text-[var(--ploy-text-secondary)] ploy-text-pretty">
                Dr. Akin Akinpelu partners with executives and enterprises to unlock
                human potential, drive cultural change, and deliver measurable business
                impact across Africa and beyond.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <Button
                type="button"
                variant="primary"
                size="lg"
                showArrow
                className="group"
                onClick={openEnquiryModal}
              >
                Book a conversation
              </Button>
              <Button variant="secondary" size="lg" href="/resources">
                Explore the library
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.15} className="relative">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--ploy-radius-xl)] bg-[var(--ploy-background-tertiary)] shadow-[var(--ploy-shadow-lg)]">
              <img
                src="/images/dr-akin-portrait.svg"
                alt="Dr. Akin Akinpelu — Executive coach and author"
                className="size-full object-cover object-top"
                loading="eager"
              />

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[oklch(0.21_0.005_70/0.85)] via-[oklch(0.21_0.005_70/0.45)] to-transparent p-8">
                <blockquote className="space-y-3 text-[var(--ploy-text-inverse)]">
                  <p className="text-lg font-medium leading-relaxed ploy-text-balance">
                    &ldquo;Leadership is not a title. It is the courage to create clarity
                    when the path is uncertain.&rdquo;
                  </p>
                  <footer className="text-sm text-[var(--ploy-text-inverse)]/70">
                    — Dr. Akin Akinpelu
                  </footer>
                </blockquote>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
