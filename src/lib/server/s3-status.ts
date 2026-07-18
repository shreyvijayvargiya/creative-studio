import { createServerFn } from '@tanstack/react-start'

import { getS3ConfigStatus } from '#/lib/s3/client'

/** Client can check whether Better Upload → S3 is ready. */
export const getS3UploadStatus = createServerFn({ method: 'GET' }).handler(
  async () => getS3ConfigStatus(),
)
