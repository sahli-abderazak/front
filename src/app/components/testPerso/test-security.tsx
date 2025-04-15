"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

interface TestSecurityProps {
  onViolation?: (type: string, count: number) => void
  maxViolations?: number
  children: React.ReactNode
}

export default function TestSecurity({ onViolation, maxViolations = 3, children }: TestSecurityProps) {
  const [violations, setViolations] = useState<{ type: string; timestamp: number }[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showWarning, setShowWarning] = useState(false)
  const [warningMessage, setWarningMessage] = useState("")

  // Group violations by type and count them
  const violationCounts = violations.reduce(
    (acc, violation) => {
      acc[violation.type] = (acc[violation.type] || 0) + 1
      return acc
    },
    {} as Record<string, number>,
  )

  // Check if any violation type exceeds the maximum allowed
  const hasExceededMaxViolations = Object.values(violationCounts).some((count) => count >= maxViolations)

  useEffect(() => {
    // Prevent copy, paste, cut
    const preventCopyPaste = (e: ClipboardEvent) => {
      e.preventDefault()
      recordViolation("clipboard")
      showTemporaryWarning("Copier-coller n'est pas autorisé pendant ce test.")
    }

    // Prevent right-click context menu
    const preventContextMenu = (e: MouseEvent) => {
      e.preventDefault()
      recordViolation("contextmenu")
      showTemporaryWarning("Le menu contextuel n'est pas autorisé pendant ce test.")
    }

    // Prevent keyboard shortcuts
    const preventKeyboardShortcuts = (e: KeyboardEvent) => {
      // Prevent Ctrl+C, Ctrl+V, Ctrl+X, Ctrl+P, F12, Alt+Tab
      if (
        (e.ctrlKey && (e.key === "c" || e.key === "v" || e.key === "x" || e.key === "p")) ||
        e.key === "F12" ||
        e.key === "PrintScreen" ||
        (e.altKey && e.key === "Tab")
      ) {
        e.preventDefault()
        recordViolation("keyboard")
        showTemporaryWarning("Les raccourcis clavier ne sont pas autorisés pendant ce test.")
      }
    }

    // Track tab visibility changes
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        recordViolation("tabswitch")
        // This will show when they return to the tab
        showTemporaryWarning("Vous avez quitté l'onglet du test. Cela sera signalé.")
      }
    }

    // Track window focus
    const handleWindowBlur = () => {
      recordViolation("windowblur")
      showTemporaryWarning("Vous avez quitté la fenêtre du test. Cela sera signalé.")
    }

    // Request fullscreen on start
    const requestFullscreenMode = () => {
      try {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen()
          setIsFullscreen(true)
        }
      } catch (error) {
        console.error("Fullscreen request failed:", error)
      }
    }

    // Handle fullscreen change
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false)
        recordViolation("fullscreen")
        showTemporaryWarning("Vous avez quitté le mode plein écran. Cela sera signalé.")
      } else {
        setIsFullscreen(true)
      }
    }

    // Add all event listeners
    document.addEventListener("copy", preventCopyPaste)
    document.addEventListener("paste", preventCopyPaste)
    document.addEventListener("cut", preventCopyPaste)
    document.addEventListener("contextmenu", preventContextMenu)
    document.addEventListener("keydown", preventKeyboardShortcuts)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    document.addEventListener("fullscreenchange", handleFullscreenChange)
    window.addEventListener("blur", handleWindowBlur)

    // Initial fullscreen request with user interaction
    const handleInitialClick = () => {
      requestFullscreenMode()
      document.removeEventListener("click", handleInitialClick)
    }
    document.addEventListener("click", handleInitialClick)

    // Cleanup
    return () => {
      document.removeEventListener("copy", preventCopyPaste)
      document.removeEventListener("paste", preventCopyPaste)
      document.removeEventListener("cut", preventCopyPaste)
      document.removeEventListener("contextmenu", preventContextMenu)
      document.removeEventListener("keydown", preventKeyboardShortcuts)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
      window.removeEventListener("blur", handleWindowBlur)
      document.removeEventListener("click", handleInitialClick)

      // Exit fullscreen on component unmount
      if (document.fullscreenElement) {
        document.exitFullscreen().catch((err) => console.error(err))
      }
    }
  }, [])

  // Record a security violation
  const recordViolation = (type: string) => {
    const newViolation = { type, timestamp: Date.now() }
    setViolations((prev) => [...prev, newViolation])

    // Calculate the count for this specific violation type
    const typeCount = violations.filter((v) => v.type === type).length + 1

    // Call the onViolation callback if provided
    if (onViolation) {
      onViolation(type, typeCount)
    }
  }

  // Show a temporary warning message
  const showTemporaryWarning = (message: string) => {
    setWarningMessage(message)
    setShowWarning(true)
    setTimeout(() => {
      setShowWarning(false)
    }, 5000)
  }

  return (
    <div className="test-security-container">
      {showWarning && (
        <Alert
          variant="destructive"
          className="test-security-warning mb-4 fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md"
        >
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{warningMessage}</AlertDescription>
        </Alert>
      )}

      {/* Si trop de violations, on n'affiche plus la demande de plein écran */}
      {!isFullscreen && !hasExceededMaxViolations && (
        <div className="fullscreen-prompt fixed inset-0 bg-black/80 flex flex-col items-center justify-center z-50 p-4 text-center">
          <div className="bg-white p-6 rounded-lg max-w-md">
            <h3 className="text-xl font-bold mb-4">Mode plein écran requis</h3>
            <p className="mb-4">
              Pour assurer l'intégrité du test, veuillez passer en mode plein écran en cliquant sur le bouton
              ci-dessous.
            </p>
            <button
              onClick={() => document.documentElement.requestFullscreen()}
              className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
            >
              Passer en plein écran
            </button>
          </div>
        </div>
      )}

      {hasExceededMaxViolations ? (
        <div className="violation-exceeded bg-red-50 border border-red-200 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-red-700 mb-2">Trop de violations de sécurité détectées</h3>
          <p className="text-red-600 mb-4">
            Nous avons détecté plusieurs tentatives de contourner les règles du test. Votre session a été signalée et
            pourrait être invalidée.
          </p>
          <div className="text-sm text-red-500">
            <p>Violations détectées:</p>
            <ul className="list-disc pl-5 mt-2">
              {Object.entries(violationCounts).map(([type, count]) => (
                <li key={type}>
                  {type === "clipboard" && `Tentatives de copier-coller: ${count}`}
                  {type === "tabswitch" && `Changements d'onglet: ${count}`}
                  {type === "windowblur" && `Sorties de la fenêtre: ${count}`}
                  {type === "keyboard" && `Raccourcis clavier interdits: ${count}`}
                  {type === "contextmenu" && `Ouvertures du menu contextuel: ${count}`}
                  {type === "fullscreen" && `Sorties du mode plein écran: ${count}`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        children
      )}
    </div>
  )
}