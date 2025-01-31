"use server"

import { listFolderContents } from "@/lib/google-drive"
import { cache } from "react"

export const fetchFolderContents = cache(async (folderId?: string) => {
  try {
    const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    if (!rootFolderId) {
      throw new Error("Google Drive folder ID not configured")
    }

    return await listFolderContents(folderId || rootFolderId)
  } catch (error) {
    console.error("Error in fetchFolderContents:", error)
    throw new Error(error instanceof Error ? error.message : "Failed to fetch folder contents")
  }
})

