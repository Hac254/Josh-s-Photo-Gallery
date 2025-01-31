import Link from "next/link"
import { FolderIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface FolderCardProps {
  id: string
  name: string
  className?: string
}

export function FolderCard({ id, name, className }: FolderCardProps) {
  return (
    <Link
      href={`/folder/${id}`}
      className={cn(
        "group relative flex aspect-square items-center justify-center rounded-lg border-2 border-dashed p-4 hover:border-solid hover:bg-muted/50",
        className,
      )}
    >
      <div className="text-center">
        <FolderIcon className="mx-auto h-12 w-12 text-muted-foreground group-hover:text-foreground" />
        <p className="mt-2 text-sm font-medium text-muted-foreground group-hover:text-foreground line-clamp-2">
          {name}
        </p>
      </div>
    </Link>
  )
}

