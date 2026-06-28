import { getSupabaseAdmin } from '#/lib/supabase/admin'

export interface UserDriveConnection {
  refreshToken: string
  googleEmail: string | null
  appFolderId: string | null
  connectedAt: string
}

export interface UserDriveConnectionStatus {
  connected: boolean
  googleEmail: string | null
  connectedAt: string | null
}

function isMissingConnectionsTableError(message: string): boolean {
  return message.includes('user_google_drive_connections')
}

export async function getUserDriveConnection(
  userId: string,
): Promise<UserDriveConnection | null> {
  const supabase = getSupabaseAdmin()

  const { data, error } = await supabase
    .from('user_google_drive_connections')
    .select('refresh_token, google_email, app_folder_id, connected_at')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) {
    if (isMissingConnectionsTableError(error.message)) {
      return null
    }

    throw new Error(`Failed to load Google Drive connection: ${error.message}`)
  }

  if (!data?.refresh_token) {
    return null
  }

  return {
    refreshToken: data.refresh_token,
    googleEmail: data.google_email ?? null,
    appFolderId: data.app_folder_id ?? null,
    connectedAt: data.connected_at,
  }
}

export async function getUserDriveConnectionStatus(
  userId: string,
): Promise<UserDriveConnectionStatus> {
  const connection = await getUserDriveConnection(userId)

  return {
    connected: connection != null,
    googleEmail: connection?.googleEmail ?? null,
    connectedAt: connection?.connectedAt ?? null,
  }
}

export async function saveUserDriveConnection(
  userId: string,
  input: {
    refreshToken: string
    googleEmail: string | null
    appFolderId?: string | null
  },
): Promise<void> {
  const supabase = getSupabaseAdmin()
  const existing = await getUserDriveConnection(userId)

  const { error } = await supabase.from('user_google_drive_connections').upsert(
    {
      user_id: userId,
      refresh_token: input.refreshToken,
      google_email: input.googleEmail,
      app_folder_id: input.appFolderId ?? existing?.appFolderId ?? null,
      connected_at: existing?.connectedAt ?? new Date().toISOString(),
    },
    { onConflict: 'user_id' },
  )

  if (error) {
    throw new Error(`Failed to save Google Drive connection: ${error.message}`)
  }
}

export async function updateUserDriveAppFolderId(
  userId: string,
  appFolderId: string,
): Promise<void> {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('user_google_drive_connections')
    .update({ app_folder_id: appFolderId })
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to update Google Drive folder: ${error.message}`)
  }
}

export async function deleteUserDriveConnection(
  userId: string,
): Promise<void> {
  const supabase = getSupabaseAdmin()

  const { error } = await supabase
    .from('user_google_drive_connections')
    .delete()
    .eq('user_id', userId)

  if (error) {
    throw new Error(`Failed to disconnect Google Drive: ${error.message}`)
  }
}

export async function userHasDriveConnection(userId: string): Promise<boolean> {
  const connection = await getUserDriveConnection(userId)
  return connection != null
}
