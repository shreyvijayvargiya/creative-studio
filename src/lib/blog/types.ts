export interface BlogPostMeta {
  name: string
  slug: string
  title: string
  description: string
  tags: string[]
  publishedAt: string
  image?: string
  filePath: string
}

export interface BlogPost extends BlogPostMeta {
  content: string
}

export interface BlogIndexFile {
  posts: BlogPostMeta[]
}
