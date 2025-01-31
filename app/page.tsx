import { Gallery } from '@/components/gallery'
import { listFolderContents } from '@/lib/google-drive'

export default async function Home() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    if (!folderId) {
      throw new Error('No folder ID specified')
    }

    const folderContent = await listFolderContents(folderId)
    
    // Debug logging
    console.log('Folder ID:', folderId)
    console.log('Files found:', folderContent.files.length)
    console.log('Sample file:', folderContent.files[0])
    console.log('Folders found:', folderContent.folders.length)
    console.log('Breadcrumb:', folderContent.breadcrumb)

    return <Gallery initialData={folderContent} />
  } catch (error) {
    console.error('Error in page:', error)
    return <div>Error loading gallery: {(error as Error).message}</div>
  }
}

