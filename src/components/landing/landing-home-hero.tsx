import { Link } from '@tanstack/react-router'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import {
  ArrowRight,
  Calculator,
  Cloud,
  FileText,
  PenLine,
  Sparkles,
} from 'lucide-react'

import { HERO_HOME_STATS } from '#/components/landing/landing-content'
import { Button } from '#/components/ui/button'
import { cn } from '#/lib/utils'

interface FloatingCardProps {
  icon: ReactNode
  title: string
  subtitle: string
  className?: string
  delay?: number
}

function FloatingCard({
  icon,
  title,
  subtitle,
  className,
}: FloatingCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16, scale: 0.92 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      className={cn(
        'absolute hidden items-center gap-2.5 rounded-lg bg-card/20 px-3 py-2.5 shadow-lg shadow-blue-500/5 backdrop-blur-sm sm:flex sm:gap-3 sm:px-4 sm:py-3',
        className,
      )}
    >
      <motion.div
        animate={{ y: [0, -5, 0] }}
        
        className="flex w-full items-center gap-2.5 sm:gap-3"
      >
        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-muted sm:size-10">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{title}</p>
          <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </motion.div>
    </motion.div>
  )
}

interface HeroDeviceFrameProps {
  src: string
  alt: string
  className?: string
  floatDelay?: number
  entranceDelay?: number
}

function HeroGlassFrame({
  src,
  alt,
  className,
  floatDelay = 0,
  entranceDelay = 0,
}: HeroDeviceFrameProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, scale: 0.94 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        duration: 0.9,
        delay: entranceDelay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={cn('relative', className)}
    >
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: floatDelay,
        }}
        className="relative"
      >
        {/* Outer glass halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-3 rounded-[1.75rem] border-2 border-white/50 bg-white/10 shadow-[0_8px_40px_-12px_rgba(59,130,246,0.35)] backdrop-blur-md sm:-inset-4 sm:rounded-[2rem] dark:border-white/20 dark:bg-white/[0.06]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -inset-1 rounded-[1.5rem] border border-white/30 sm:rounded-[1.75rem] dark:border-white/10"
        />

        {/* Glass panel */}
        <div className="relative rounded-[1.35rem] bg-white/40 p-2 shadow-2xl shadow-blue-500/10 ring-1 ring-white/60 backdrop-blur-sm sm:rounded-[1.5rem] sm:p-2.5 dark:bg-white/10 dark:ring-white/20">
          <div className="overflow-hidden rounded-[1.1rem] bg-background/95 ring-1 ring-border/20 sm:rounded-[1.25rem]">
            <img
              src={src}
              alt={alt}
              className="block aspect-[16/10] w-full object-cover object-top"
              loading="eager"
              decoding="async"
            />
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

function HeroVisual() {
  return (
    <div className="relative mx-auto flex w-full items-center justify-center overflow-visible lg:mx-0 lg:justify-end">
      <motion.div
        aria-hidden
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.2, delay: 0.3 }}
        className="pointer-events-none absolute top-1/2 left-1/2 h-[min(100%,28rem)] w-[min(100%,28rem)] -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/20 blur-3xl"
      />

      <div className="relative h-[22rem] w-full max-w-[36rem] sm:h-[26rem] lg:h-[30rem] lg:max-w-[42rem]">
        {/* Back panel */}
        <HeroGlassFrame
          src="/hero-banner-2.png"
          alt="Finance CRM budget planner dashboard"
          className="absolute top-0 left-0 z-10 w-[92%] -rotate-2 sm:w-[88%]"
          floatDelay={0.6}
          entranceDelay={0.3}
        />

        {/* Front panel */}
        <HeroGlassFrame
          src="/hero-banner.png"
          alt="Finance CRM documents dashboard"
          className="absolute right-0 bottom-0 z-20 w-[96%] rotate-1 sm:w-[92%]"
          floatDelay={0}
          entranceDelay={0.1}
        />

        <FloatingCard
          icon={<Cloud className="size-5 text-sky-600 dark:text-sky-400" />}
          title="Drive backup"
          subtitle="Per-user OAuth"
          className="-top-20 -left-4 z-30 sm:-left-8"
          delay={0.45}
        />
        <FloatingCard
          icon={<FileText className="size-5 text-blue-600 dark:text-blue-400" />}
          title="ATO PDF ready"
          subtitle="Generated in minutes"
          className="top-[28%] -left-6 z-30 sm:-left-10"
          delay={0}
        />
        <FloatingCard
          icon={<PenLine className="size-5 text-emerald-600 dark:text-emerald-400" />}
          title="E-sign collected"
          subtitle="DocuSeal embedded"
          className="right-0 bottom-[32%] z-30 sm:-right-6"
          delay={0.15}
        />
        <FloatingCard
          icon={<Calculator className="size-5 text-orange-600 dark:text-orange-400" />}
          title="Budget synced"
          subtitle="Client workspace"
          className="-bottom-2 left-[12%] z-30 sm:left-[8%]"
          delay={0.3}
        />
      </div>
    </div>
  )
}

function LandingHomeHeroBackground() {
  return (
    <div className="absolute inset-0 -z-10 h-full w-full">
      <div className="absolute inset-0 bg-linear-to-br from-blue-950/30 via-background to-fuchsia-950/20 dark:from-blue-950/50 dark:to-fuchsia-950/30" />
      <div className="absolute top-1/4 left-1/4 h-125 w-125 rounded-full bg-blue-500/8 blur-3xl" />
      <div className="absolute right-1/4 bottom-1/4 h-100 w-100 rounded-full bg-blue-500/5 blur-3xl" />
    </div>
  )
}

export function LandingHomeHero() {
  return (
    <section className="relative flex h-screen min-h-screen flex-col justify-center overflow-hidden bg-background pt-20 pb-12 sm:pt-24 sm:pb-16">
      <LandingHomeHeroBackground />
      <img
        alt=""
        loading="lazy"
        width={1000}
        height={1000}
        decoding="async"
        className="absolute inset-0 z-0 w-full md:-translate-y-1/12 dark:hidden"
        src="/clouds-bg.webp"
      />

      <div className="relative z-10 mx-auto grid w-full max-w-7xl flex-1 items-center gap-10 px-4 sm:gap-12 sm:px-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12 lg:px-8">
        <div className="mx-auto w-full max-w-xl lg:mx-0">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="mb-4 inline-flex max-w-full items-center gap-2 rounded-full border border-blue-100/80 bg-blue-50/50 px-3 py-1.5 text-xs text-zinc-700 sm:mb-6 sm:px-4 sm:text-sm dark:border-blue-500/30 dark:bg-blue-950/40 dark:text-blue-300"
          >
            <Sparkles className="size-4 shrink-0" />
            Built for accounting practices
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="text-3xl font-bold tracking-tight text-balance text-foreground sm:text-4xl lg:text-6xl lg:leading-[1.1]"
          >
            The workspace for{' '}
            <span className="text-blue-600 dark:text-blue-400">accounting</span>{' '}
            <span className="text-muted-500 dark:text-blue-400">delivered.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="mt-4 text-sm leading-7 text-muted-foreground sm:mt-6 sm:text-base sm:leading-7 lg:text-lg"
          >
            Plan client budgets, generate ATO-ready tax PDFs, collect e-signatures,
            and store documents securely —{' '}
            <span className="font-semibold text-foreground">
              all in one calm workspace.
            </span>
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="mt-6 flex flex-col gap-3 sm:mt-8 sm:flex-row sm:items-center"
          >
            <Button
              asChild
              size="lg"
              className="h-11 w-full rounded-full bg-blue-600 px-6 text-sm font-medium text-white shadow-lg shadow-blue-600/25 hover:bg-blue-700 sm:h-12 sm:w-auto sm:text-base"
            >
              <Link to="/dashboard">
                Get started free
                <ArrowRight className="size-4" />
              </Link>
            </Button>
            <p className="text-center text-xs text-muted-foreground sm:text-left sm:text-sm">
              Free to start · No credit card required
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="mt-8 grid grid-cols-3 gap-3 border-t border-border/60 pt-6 sm:mt-12 sm:gap-6 sm:pt-8"
          >
            {HERO_HOME_STATS.map((stat) => (
              <div key={stat.label} className="min-w-0 text-center sm:text-left">
                <p className="text-xl font-bold tracking-tight text-foreground sm:text-2xl lg:text-3xl">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[11px] leading-tight text-muted-foreground sm:mt-1 sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </div>

        <HeroVisual />
      </div>
    </section>
  )
}
