"use client"

import { type ReactNode, useState, useEffect, useCallback } from "react"
import * as ReactDOM from "react-dom"

interface ModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}

export function Modal({ open, onOpenChange, children }: ModalProps) {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
    return () => setIsMounted(false)
  }, [])

  const handleClose = useCallback(() => {
    onOpenChange(false)
  }, [onOpenChange])

  if (!isMounted) {
    return null
  }

  return ReactDOM.createPortal(
    <div className={`fixed inset-0 z-50 ${open ? "" : "hidden"}`} onClick={handleClose}>
      <div className="fixed inset-0 w-full h-full bg-black/50" onClick={handleClose} />
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="relative z-50 bg-white rounded-lg dark:bg-gray-800" onClick={(e) => e.stopPropagation()}>
          {children}
        </div>
      </div>
    </div>,
    document.body,
  )
}

