import { RejectUpload, route, type Router } from '@better-upload/server'

import { getS3BucketName, getS3Client } from '#/lib/s3/client'
import { getSupabaseServerClient } from '#/lib/supabase/server'

async function requireUploadUser() {
  const supabase = getSupabaseServerClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    throw new RejectUpload('You must be signed in to upload files')
  }

  return user
}

function safeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 180)
}

/**
 * Better Upload router — bank statements / accounting files → AWS S3.
 * Supabase remains auth + DB only.
 */
export function createUploadRouter(): Router {
  return {
    client: getS3Client(),
    bucketName: getS3BucketName(),
    routes: {
      /** Single PDF bank statement */
      'bank-statements': route({
        fileTypes: ['application/pdf'],
        maxFileSize: 8 * 1024 * 1024,
        signedUrlExpiresIn: 300,
        onBeforeUpload: async ({ file }) => {
          const user = await requireUploadUser()
          const key = `bank-statements/${user.id}/${Date.now()}-${safeFileName(file.name)}`

          return {
            objectInfo: {
              key,
              metadata: {
                userId: user.id,
                originalName: file.name.slice(0, 200),
              },
            },
            metadata: {
              userId: user.id,
            },
          }
        },
        onAfterSignedUrl: async ({ file }) => {
          return {
            metadata: {
              objectKey: file.objectInfo.key,
              fileName: file.name,
            },
          }
        },
      }),

      /** General accounting files (PDF, CSV, images) — not wired to AI chatbot */
      'accounting-files': route({
        multipleFiles: true,
        maxFiles: 10,
        maxFileSize: 8 * 1024 * 1024,
        fileTypes: [
          'application/pdf',
          'text/csv',
          'image/*',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'application/vnd.ms-excel',
        ],
        onBeforeUpload: async ({ files }) => {
          const user = await requireUploadUser()

          return {
            generateObjectInfo: ({ file }) => ({
              key: `accounting/${user.id}/${Date.now()}-${safeFileName(file.name)}`,
              metadata: {
                userId: user.id,
                originalName: file.name.slice(0, 200),
              },
            }),
            metadata: {
              userId: user.id,
              fileCount: files.length,
            },
          }
        },
      }),
    },
  }
}
