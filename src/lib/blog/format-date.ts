export function formatBlogDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString('en-AU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}
