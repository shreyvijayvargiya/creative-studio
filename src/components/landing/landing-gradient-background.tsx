export function LandingGradientBackground() {
  return (
    <div className="absolute inset-0 -z-10 bg-background">
      <div className="absolute inset-0 bg-linear-to-br from-violet-950/20 via-background to-fuchsia-950/10 dark:from-violet-950/50 dark:via-background dark:to-fuchsia-950/25" />
      <div className="absolute -top-40 -left-40 h-[38rem] w-[38rem] rounded-full bg-violet-500/10 blur-3xl dark:bg-violet-500/20" />
      <div className="absolute -bottom-60 -right-40 h-[44rem] w-[44rem] rounded-full bg-violet-500/8 blur-3xl dark:bg-fuchsia-500/15" />
    </div>
  )
}
