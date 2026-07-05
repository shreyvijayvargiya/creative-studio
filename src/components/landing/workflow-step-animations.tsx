import { Cloud, FileText, Mail, PenLine, TableProperties, UserPlus } from 'lucide-react'
import { motion } from 'motion/react'

import { cn } from '#/lib/utils'

export function AccountCreateAnimation({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-full min-h-36 items-center justify-center overflow-hidden bg-linear-to-br from-violet-500/10 via-violet-500/5 to-transparent dark:from-violet-500/20',
        className,
      )}
    >
      <motion.div
        className="absolute size-24 rounded-full bg-violet-500/10"
        animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative flex size-16 items-center justify-center rounded-2xl bg-violet-600 text-white shadow-lg shadow-violet-600/30"
      >
        <UserPlus className="size-8" strokeWidth={1.75} />
      </motion.div>

      <motion.div
        className="absolute top-6 left-6 flex items-center gap-1.5 rounded-full border border-border/60 bg-card/90 px-2.5 py-1 text-[10px] font-medium shadow-sm backdrop-blur-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: [0, -4, 0] }}
        transition={{ delay: 0.2, duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Mail className="size-3 text-violet-500" />
        Email sign-up
      </motion.div>

      <motion.div
        className="absolute right-6 bottom-6 flex items-center gap-1.5 rounded-full border border-border/60 bg-card/90 px-2.5 py-1 text-[10px] font-medium shadow-sm backdrop-blur-sm"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: [0, -3, 0] }}
        transition={{ delay: 0.4, duration: 2.8, repeat: Infinity }}
      >
        <span className="text-xs font-bold text-violet-600">G</span>
        Google OAuth
      </motion.div>
    </div>
  )
}

export function BudgetGridAnimation({ className }: { className?: string }) {
  const rows = ['Income', 'Expenses', 'Net']

  return (
    <div
      className={cn(
        'relative flex h-full min-h-36 items-center justify-center overflow-hidden bg-linear-to-br from-orange-500/10 via-orange-500/5 to-transparent p-4 dark:from-orange-500/15',
        className,
      )}
    >
      <div className="w-full max-w-[11rem] overflow-hidden rounded-xl border border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
        <div className="flex items-center gap-2 border-b border-border/60 bg-muted/50 px-2.5 py-1.5">
          <TableProperties className="size-3 text-orange-500" />
          <span className="text-[10px] font-medium text-muted-foreground">Budget grid</span>
        </div>
        <div className="space-y-1.5 p-2">
          {rows.map((row, index) => (
            <motion.div
              key={row}
              className="flex items-center justify-between gap-2 rounded-md bg-muted/40 px-2 py-1"
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.35, duration: 0.4 }}
            >
              <span className="text-[10px] text-muted-foreground">{row}</span>
              <motion.span
                className="text-[10px] font-semibold text-foreground"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: index * 0.35 + 0.2 }}
              >
                {index === 2 ? '$12,400' : index === 0 ? '$48,200' : '$35,800'}
              </motion.span>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function SignDocumentAnimation({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-full min-h-36 items-center justify-center overflow-hidden bg-linear-to-br from-emerald-500/10 via-emerald-500/5 to-transparent dark:from-emerald-500/15',
        className,
      )}
    >
      <motion.div
        className="relative flex size-20 flex-col items-center justify-center rounded-xl border border-border/60 bg-card shadow-sm"
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
      >
        <FileText className="size-8 text-emerald-600 dark:text-emerald-400" strokeWidth={1.5} />
        <span className="mt-1 text-[9px] font-medium text-muted-foreground">ATO PDF</span>

        <motion.div
          className="absolute -right-2 -bottom-2 flex size-8 items-center justify-center rounded-full bg-emerald-600 text-white shadow-md"
          animate={{ rotate: [0, -8, 8, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        >
          <PenLine className="size-4" strokeWidth={2} />
        </motion.div>
      </motion.div>

      <motion.svg
        className="absolute bottom-8 left-1/2 h-6 w-20 -translate-x-1/2 text-emerald-500"
        viewBox="0 0 80 24"
        fill="none"
      >
        <motion.path
          d="M4 18 C20 6, 40 22, 76 8"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.2, ease: 'easeInOut' }}
        />
      </motion.svg>
    </div>
  )
}

export function CloudStoreAnimation({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'relative flex h-full min-h-36 items-center justify-center overflow-hidden bg-linear-to-br from-fuchsia-500/10 via-fuchsia-500/5 to-transparent dark:from-fuchsia-500/15',
        className,
      )}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <Cloud className="size-12 text-fuchsia-600 dark:text-fuchsia-400" strokeWidth={1.5} />
      </motion.div>

      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="absolute flex size-8 items-center justify-center rounded-lg border border-border/60 bg-card text-fuchsia-600 shadow-sm dark:text-fuchsia-400"
          style={{ left: `${28 + index * 18}%`, bottom: '18%' }}
          animate={{ y: [0, -48, -48], opacity: [0, 1, 0], scale: [0.8, 1, 0.9] }}
          transition={{
            duration: 2.4,
            repeat: Infinity,
            delay: index * 0.5,
            ease: 'easeOut',
          }}
        >
          <FileText className="size-4" strokeWidth={1.75} />
        </motion.div>
      ))}
    </div>
  )
}

const STEP_ANIMATIONS = {
  '01': AccountCreateAnimation,
  '02': BudgetGridAnimation,
  '03': SignDocumentAnimation,
  '04': CloudStoreAnimation,
} as const

export function WorkflowStepAnimation({ step }: { step: string }) {
  const Animation = STEP_ANIMATIONS[step as keyof typeof STEP_ANIMATIONS] ?? AccountCreateAnimation
  return <Animation />
}
