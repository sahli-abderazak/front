"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface ImageAnalysisTestProps {
  candidatId: number
  offreId: number
  onComplete: (analysis: string) => void
}

export default function ImageAnalysisTest({ candidatId, offreId, onComplete }: ImageAnalysisTestProps) {
  const [loading, setLoading] = useState(true)
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [imagePrompt, setImagePrompt] = useState<string>("")
  const [description, setDescription] = useState("")
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)

  // Use ref to prevent multiple API calls
  const apiCallInProgress = useRef(false)
  const imageLoaded = useRef(false)

  // Fetch the image when component mounts
  useEffect(() => {
    if (!apiCallInProgress.current && !imageLoaded.current) {
      fetchImage()
    }
  }, [candidatId, offreId])

  const fetchImage = async () => {
    // Prevent multiple simultaneous API calls
    if (apiCallInProgress.current) {
      console.log("API call already in progress, skipping duplicate fetch")
      return
    }

    // Don't fetch if we already have an image
    if (imageLoaded.current && imageUrl) {
      console.log("Image already loaded, skipping fetch")
      return
    }

    try {
      apiCallInProgress.current = true
      setLoading(true)
      setError(null)

      const response = await fetch("http://127.0.0.1:8000/api/generate-image-question", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidat_id: candidatId,
          offre_id: offreId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur lors de la génération de l'image: ${response.status}`)
      }

      const data = await response.json()

      if (data.image_url) {
        setImageUrl(data.image_url)
        setImagePrompt(data.description_auto || "")
        console.log("Image générée avec succès:", data.image_url)
        imageLoaded.current = true
      } else {
        throw new Error("Aucune URL d'image n'a été retournée")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError(`Impossible de générer l'image: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setLoading(false)
      apiCallInProgress.current = false
    }
  }

  const handleSubmit = async () => {
    if (!description.trim()) {
      setError("Veuillez écrire une description de l'image avant de continuer.")
      return
    }

    if (!imageUrl || !imagePrompt) {
      setError("Informations d'image manquantes. Veuillez réessayer.")
      return
    }

    try {
      setAnalyzing(true)
      setError(null)

      const response = await fetch("http://127.0.0.1:8000/api/analyze-personality", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          image_url: imageUrl,
          image_prompt: imagePrompt,
          description: description,
          candidat_id: candidatId,
          offre_id: offreId,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur lors de l'analyse: ${response.status}`)
      }

      const data = await response.json()

      if (data.personality_analysis) {
        setAnalysis(data.personality_analysis)
        setCompleted(true)

        // Call the onComplete callback with the analysis
        if (onComplete) {
          onComplete(data.personality_analysis)
        }
      } else {
        throw new Error("Aucune analyse n'a été retournée")
      }
    } catch (error) {
      console.error("Erreur:", error)
      setError(`Impossible d'analyser la description: ${error instanceof Error ? error.message : String(error)}`)
    } finally {
      setAnalyzing(false)
    }
  }

  const handleRetry = () => {
    imageLoaded.current = false
    fetchImage()
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p className="loading-text">Génération de l'image en cours...</p>
      </div>
    )
  }

  if (error && !imageUrl) {
    return (
      <Alert variant="destructive" className="mb-4">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
        <div className="mt-4">
          <Button onClick={handleRetry} className="retry-button">
            Réessayer
          </Button>
        </div>
      </Alert>
    )
  }

  if (completed && analysis) {
    return (
      <div className="success-container">
        <div className="success-icon-container">
          <CheckCircle2 className="success-icon" />
        </div>
        <h3 className="success-title">Analyse complétée</h3>
        <div className="success-message">
          <div className="bg-[#ecfdf5] p-4 rounded-lg border border-[#a7f3d0] mb-4 text-left">
            <h4 className="font-medium text-[#065f46] mb-2">Analyse de votre personnalité</h4>
            <p className="text-[#047857]">{analysis}</p>
          </div>
          <p className="text-sm text-[#64748b]">
            Cette analyse est basée sur votre description de l'image et sera prise en compte dans votre candidature.
          </p>
        </div>
        <Button onClick={() => window.scrollTo(0, 0)} className="next-button">
          Continuer
        </Button>
      </div>
    )
  }

  return (
    <div className="question-card">
      <h4 className="question-text">Analyse d'image</h4>

      <div className="mb-6">
        <p className="text-[#64748b] mb-4">
          Observez attentivement l'image ci-dessous et décrivez ce que vous y voyez, ce que vous ressentez, et comment
          vous interprétez la situation représentée.
        </p>

        {error && (
          <Alert variant="destructive" className="error-message">
            <AlertCircle className="error-icon-small" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {imageUrl && (
          <div className="flex flex-col items-center space-y-6">
            <div className="relative w-full max-w-md overflow-hidden rounded-lg border border-[#e2e8f0] shadow-sm">
              <img
                src={imageUrl || "/placeholder.svg"}
                alt="Situation professionnelle"
                className="w-full h-auto object-cover"
                onError={() => setError("Impossible de charger l'image. Veuillez réessayer.")}
              />
            </div>
            <div className="w-full space-y-2">
              <label htmlFor="description" className="block text-sm font-medium text-[#0c4a6e]">
                Votre description:
              </label>
              <Textarea
                id="description"
                placeholder="Décrivez ce que vous voyez dans cette image, comment vous interprétez la situation, et ce que vous feriez dans ce contexte..."
                className="min-h-[150px] border-[#e2e8f0] focus:border-[#0369a1] focus:ring-[#0369a1]"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={analyzing}
              />
              <p className="text-xs text-[#64748b]">
                Minimum 50 caractères. Votre description sera analysée pour déterminer certains traits de personnalité.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="navigation-buttons">
        <Button variant="outline" onClick={handleRetry} disabled={analyzing} className="prev-button">
          Générer une autre image
        </Button>
        <Button onClick={handleSubmit} disabled={analyzing || description.length < 50} className="next-button">
          {analyzing ? (
            <>
              <span className="loading-spinner-small"></span>
              Analyse en cours...
            </>
          ) : (
            "Analyser ma description"
          )}
        </Button>
      </div>
    </div>
  )
}