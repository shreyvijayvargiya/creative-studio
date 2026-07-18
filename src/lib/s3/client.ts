import { aws } from '@better-upload/server/clients'

export function getAwsCredentials(): {
  accessKeyId: string
  secretAccessKey: string
  region: string
} {
  const accessKeyId =
    process.env.AWS_ACCESS_KEY_ID?.trim() ||
    process.env.AWS_S3_ACCESS_KEY_ID?.trim() ||
    ''
  const secretAccessKey =
    process.env.AWS_SECRET_ACCESS_KEY?.trim() ||
    process.env.AWS_S3_SECRET_ACCESS_KEY?.trim() ||
    ''
  const region =
    process.env.AWS_REGION?.trim() ||
    process.env.AWS_S3_REGION?.trim() ||
    'us-east-1'

  return { accessKeyId, secretAccessKey, region }
}

/**
 * AWS S3 client for Better Upload + server helpers.
 */
export function getS3Client() {
  const { accessKeyId, secretAccessKey, region } = getAwsCredentials()

  if (!accessKeyId || !secretAccessKey) {
    throw new Error(
      'AWS S3 is not configured.',
    )
  }

  return aws({ accessKeyId, secretAccessKey, region })
}

export function getS3BucketName(): string {
  const bucket =
    process.env.AWS_S3_BUCKET?.trim() || process.env.S3_BUCKET_NAME?.trim()

  if (!bucket) {
    throw new Error(
      'AWS S3 bucket is not configured. Set AWS_S3_BUCKET in .env, then restart the server.',
    )
  }

  return bucket
}

export function getS3ConfigStatus(): {
  configured: boolean
  missing: string[]
  bucket: string | null
  region: string
} {
  const { accessKeyId, secretAccessKey, region } = getAwsCredentials()
  const bucket =
    process.env.AWS_S3_BUCKET?.trim() || process.env.S3_BUCKET_NAME?.trim() || null

  const missing: string[] = []
  if (!accessKeyId) missing.push('AWS_ACCESS_KEY_ID')
  if (!secretAccessKey) missing.push('AWS_SECRET_ACCESS_KEY')
  if (!bucket) missing.push('AWS_S3_BUCKET')

  return {
    configured: missing.length === 0,
    missing,
    bucket,
    region,
  }
}

export function isS3Configured(): boolean {
  return getS3ConfigStatus().configured
}
