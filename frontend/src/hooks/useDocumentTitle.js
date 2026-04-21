import { useEffect } from 'react'

const SUFFIX = ' — ProLink'

export default function useDocumentTitle(title) {
  useEffect(() => {
    if (!title) return
    const prev = document.title
    document.title = title + SUFFIX
    return () => { document.title = prev }
  }, [title])
}
