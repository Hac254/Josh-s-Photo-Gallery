import { fetchFolderContents } from "@/app/actions"
import { Gallery } from "@/components/gallery"
import { ErrorBoundary } from "@/components/error-boundary"

interface PageProps {
  params: {
    id: string
  }
}

export default async function FolderPage({ params }: PageProps) {
  try {
    const data = await fetchFolderContents(params.id)
    return <Gallery initialData={data} />
  } catch (error) {
    return <ErrorBoundary error={error as Error} reset={() => window.location.reload()} />
  }
}

