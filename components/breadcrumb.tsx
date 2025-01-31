import Link from "next/link"
import { ChevronRight, FolderIcon } from "lucide-react"

interface BreadcrumbProps {
  items: {
    id: string
    name: string
  }[]
}

export function Breadcrumb({ items }: BreadcrumbProps) {
  return (
    <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
      {items.map((item, index) => (
        <div key={item.id} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          <Link href={`/folder/${item.id}`} className="flex items-center hover:text-foreground">
            <FolderIcon className="h-4 w-4 mr-1" />
            {item.name}
          </Link>
        </div>
      ))}
    </nav>
  )
}

