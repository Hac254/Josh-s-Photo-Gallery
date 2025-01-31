export interface DriveFile {
  id: string
  name: string
  mimeType: string
  thumbnailLink?: string
  webContentLink?: string
  viewLink: string
  parents?: string[]
}

export interface BreadcrumbItem {
  id: string
  name: string
}

export interface FolderContent {
  files: DriveFile[]
  folders: BreadcrumbItem[]
  breadcrumb: BreadcrumbItem[]
}

// Convert base64 to base64url
function base64ToBase64url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "")
}

// Create URL-safe base64 encoded string
function urlsafeBase64(obj: object): string {
  return base64ToBase64url(Buffer.from(JSON.stringify(obj)).toString("base64"))
}

async function createJWT() {
  const privateKey = process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n")
  const clientEmail = process.env.GOOGLE_CLIENT_EMAIL

  if (!privateKey || !clientEmail) {
    throw new Error("Missing Google credentials")
  }

  const now = Math.floor(Date.now() / 1000)

  const header = {
    alg: "RS256",
    typ: "JWT",
  }

  const claimSet = {
    iss: clientEmail,
    scope: [
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.readonly",
      "https://www.googleapis.com/auth/drive.metadata.readonly"
    ].join(' '),
    aud: "https://oauth2.googleapis.com/token",
    exp: now + 3600,
    iat: now,
  }

  const encodedHeader = urlsafeBase64(header)
  const encodedClaimSet = urlsafeBase64(claimSet)
  const signatureInput = `${encodedHeader}.${encodedClaimSet}`

  // Convert private key to CryptoKey
  const binaryKey = Buffer.from(privateKey, 'utf-8')
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8',
    binaryKey,
    {
      name: 'RSASSA-PKCS1-v1_5',
      hash: 'SHA-256',
    },
    false,
    ['sign']
  )

  // Sign the input
  const encoder = new TextEncoder()
  const signatureBytes = await crypto.subtle.sign(
    'RSASSA-PKCS1-v1_5',
    cryptoKey,
    encoder.encode(signatureInput)
  )

  // Convert signature to base64url
  const signature = base64ToBase64url(
    Buffer.from(signatureBytes).toString('base64')
  )

  return `${signatureInput}.${signature}`
}

let cachedToken: string | null = null
let tokenExpiry = 0

export async function getAccessToken() {
  const now = Date.now()
  if (!cachedToken || now >= tokenExpiry) {
    try {
      // Debug logging
      console.log('Creating new access token...')
      console.log('Client email:', process.env.GOOGLE_CLIENT_EMAIL)
      console.log('Private key length:', process.env.GOOGLE_PRIVATE_KEY?.length)
      
      const jwt = await createJWT()
      
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
          assertion: jwt,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: { message: response.statusText } }))
        console.error('Token response error:', errorData)
        throw new Error(errorData.error?.message || "Failed to get access token")
      }

      const data = await response.json()
      console.log('Successfully obtained access token')
      
      cachedToken = data.access_token
      tokenExpiry = now + 3500000 // Set expiry to slightly less than 1 hour
    } catch (error) {
      console.error("Error getting access token:", error)
      throw new Error("Failed to authenticate with Google Drive")
    }
  }

  return cachedToken
}

async function fetchFromDrive(endpoint: string, options: RequestInit = {}) {
  const accessToken = await getAccessToken()
  const response = await fetch(`https://www.googleapis.com/drive/v3/${endpoint}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      ...options.headers,
    },
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: { message: response.statusText } }))
    throw new Error(error.error?.message || "Drive API error")
  }

  return response.json()
}

async function getFolderBreadcrumb(folderId: string): Promise<BreadcrumbItem[]> {
  const breadcrumb: BreadcrumbItem[] = []
  let currentFolderId = folderId

  while (currentFolderId) {
    try {
      const folder = await fetchFromDrive(`files/${currentFolderId}?fields=id,name,parents`)
      breadcrumb.unshift({
        id: folder.id,
        name: folder.name
      })

      if (!folder.parents || folder.parents.length === 0) {
        break
      }

      currentFolderId = folder.parents[0]
    } catch (error) {
      console.error("Error fetching folder:", error)
      break
    }
  }

  return breadcrumb
}

interface DriveApiFile {
  id?: string
  name?: string
  mimeType: string
  thumbnailLink?: string
  webContentLink?: string
  webViewLink?: string
  parents?: string[]
}

export function getImageUrl(fileId: string, thumbnail = false) {
  // Always use the direct file endpoint
  return `/api/image/${fileId}`
}

export async function listFolderContents(folderId: string): Promise<FolderContent> {
  try {
    console.log('Accessing folder ID:', folderId);

    const query = `'${folderId}' in parents and trashed = false`
    const fields = "files(id,name,mimeType,thumbnailLink,webContentLink,webViewLink,parents)"

    const response = await fetchFromDrive(
      `files?q=${encodeURIComponent(query)}&fields=${encodeURIComponent(
        fields
      )}&pageSize=1000&supportsAllDrives=true&includeItemsFromAllDrives=true`,
    )

    console.log('API Response:', response);

    const items = response.files || []
    
    const files = items
      .filter((item: DriveApiFile) => item.mimeType.startsWith("image/"))
      .map((file: DriveApiFile) => {
        console.log('Processing file:', file);
        return {
          id: file.id!,
          name: file.name!,
          mimeType: file.mimeType,
          thumbnailLink: file.thumbnailLink,
          webContentLink: file.webContentLink,
          viewLink: file.webViewLink!,
          parents: file.parents
        };
      });

    const folders = items
      .filter((item: DriveApiFile) => item.mimeType === "application/vnd.google-apps.folder")
      .map((folder: DriveApiFile) => ({
        id: folder.id!,
        name: folder.name!
      }))

    const breadcrumb = await getFolderBreadcrumb(folderId)

    return {
      files,
      folders,
      breadcrumb
    }
  } catch (error) {
    console.error("Error fetching folder contents:", error)
    throw new Error(`Failed to fetch folder contents: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function testDriveConnection() {
  try {
    const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
    if (!folderId) throw new Error('No folder ID specified')
    
    const contents = await listFolderContents(folderId)
    console.log('Successfully connected to Google Drive')
    console.log(`Found ${contents.files.length} files and ${contents.folders.length} folders`)
    return true
  } catch (error) {
    console.error('Drive connection test failed:', error)
    return false
  }
}

