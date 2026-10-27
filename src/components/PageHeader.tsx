import type { ReactNode } from 'react'
import { useEffect } from 'react'

interface PageHeaderProps {
  title: string
  description?: string
  extra?: ReactNode
}

/** Page heading with a slot for page-level controls; also sets the document title. */
export default function PageHeader({ title, description, extra }: PageHeaderProps) {
  useEffect(() => {
    document.title = `${title} - Pulse`
  }, [title])

  return (
    <div className="page-header">
      <div>
        <h1 className="page-header__title">{title}</h1>
        {description ? <p className="page-header__description">{description}</p> : null}
      </div>
      {extra ? <div className="page-header__extra">{extra}</div> : null}
    </div>
  )
}
