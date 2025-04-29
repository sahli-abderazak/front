"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertCircle, ArrowLeft, CheckCircle2, Home } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Header from "../../../components/index/header"
import Footer from "../../../components/index/footer"
import PersonalityTest from "../../../components/testPerso/personality-test"
import "../../../components/styles/test-personnalite.css"
import "../../../components/styles/index.css"

export default function TestPersonnalitePage({
  params,
}: {
  params: Promise<{ candidat: string; offre: string }>
}) {
  // Unwrap the params Promise using React.use()
  const { candidat, offre } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offreDetails, setOffreDetails] = useState<any>(null)
  const [testCompleted, setTestCompleted] = useState(false)
  const [securityViolations, setSecurityViolations] = useState<Record<string, number>>({})

  // Parse IDs from params, ensuring they're valid numbers
  const candidatId = candidat ? Number.parseInt(candidat, 10) : null
  const offreId = offre ? Number.parseInt(offre, 10) : null

  useEffect(() => {
    // Validate IDs
    if (!candidatId || isNaN(candidatId) || !offreId || isNaN(offreId)) {
      setError("Identifiants de candidat ou d'offre invalides")
      setLoading(false)
      return
    }

    // Fetch job details
    const fetchOffreDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/offreDetail/${offreId}`)
        if (!response.ok) {
          throw new Error(`Impossible de récupérer les détails de l'offre: ${response.status}`)
        }
        const data = await response.json()
        setOffreDetails(data)
      } catch (error) {
        console.error("Erreur lors de la récupération des détails de l'offre:", error)
        // Don't set error here, as the test can continue without job details
      } finally {
        setLoading(false)
      }
    }

    fetchOffreDetails()
  }, [candidatId, offreId, candidat, offre])

  const handleTestComplete = () => {
    setTestCompleted(true)
    // Redirect to jobs page after a delay
    setTimeout(() => {
      router.push("/jobs")
    }, 5000)
  }

  // Handle security violations from the test
  const handleSecurityViolation = (type: string, count: number) => {
    setSecurityViolations((prev) => ({
      ...prev,
      [type]: count,
    }))

    // Log violations to console for debugging
    console.log(`Security violation detected: ${type}, count: ${count}`)

    // Si on a trop de violations, on sort du mode plein écran
    if (hasTooManyViolations() && document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error("Erreur lors de la sortie du mode plein écran:", err))
    }
  }

  // Check if there are too many security violations
  const hasTooManyViolations = () => {
    const totalViolations = Object.values(securityViolations).reduce((sum, count) => sum + count, 0)
    return totalViolations >= 5 // Considère 5 violations totales comme trop
  }

  return (
    <div className="personality-test-page">
      <Header />

      <main className="personality-test-main">
        <div className="personality-test-container">
          {/* Breadcrumb and title */}
          <div className="breadcrumb-container">
            <div className="breadcrumb">
              <Link href="/" className="breadcrumb-link">
                <Home className="breadcrumb-icon" />
                Accueil
              </Link>
              <span className="breadcrumb-separator">/</span>
              <Link href="/jobs" className="breadcrumb-link">
                Offres d'emploi
              </Link>
              <span className="breadcrumb-separator">/</span>
              {offreDetails ? (
                <Link href={`/jobsDetail/${offreId}`} className="breadcrumb-link">
                  {offreDetails.poste}
                </Link>
              ) : (
                <span className="breadcrumb-text">Détail de l'offre</span>
              )}
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">Test de personnalité</span>
            </div>

            <div className="page-header">
              <div className="page-title-container">
                <h1 className="page-title">Test de personnalité</h1>
                <p className="page-subtitle">
                  {offreDetails
                    ? `Pour le poste de ${offreDetails.poste} chez ${offreDetails.societe}`
                    : "Évaluez votre compatibilité avec le poste"}
                </p>
              </div>

              <Button variant="outline" size="sm" onClick={() => router.back()} className="back-button">
                <ArrowLeft className="back-button-icon" />
                Retour
              </Button>
            </div>
          </div>

          {/* Main content */}
          <Card className="test-card">
            <CardContent className="test-card-content">
              {loading ? (
                <div className="loading-container">
                  <div className="loading-spinner"></div>
                  <p className="loading-text">Chargement du test de personnalité...</p>
                </div>
              ) : error ? (
                <div className="error-container">
                  <Alert variant="destructive" className="error-alert">
                    <AlertCircle className="error-icon" />
                    <AlertTitle>Erreur</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                  <div className="error-action">
                    <Button onClick={() => router.push("/jobs")}>Retour aux offres d'emploi</Button>
                  </div>
                </div>
              ) : hasTooManyViolations() ? (
                <div className="error-container">
                  <Alert variant="destructive" className="error-alert">
                    <AlertCircle className="error-icon" />
                    <AlertTitle>Test interrompu</AlertTitle>
                    <AlertDescription>
                      Nous avons détecté plusieurs tentatives de contourner les règles du test. Votre session a été
                      interrompue pour des raisons de sécurité.
                    </AlertDescription>
                  </Alert>
                  <div className="error-action">
                    <Button onClick={() => router.push("/jobs")}>Retour aux offres d'emploi</Button>
                  </div>
                  <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                    <h4 className="font-medium text-red-700 mb-2">Violations de sécurité détectées :</h4>
                    <ul className="list-disc pl-5 text-sm text-red-600">
                      {Object.entries(securityViolations).map(([type, count]) => (
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
              ) : testCompleted ? (
                <div className="success-container">
                  <div className="success-icon-container">
                    <CheckCircle2 className="success-icon" />
                  </div>
                  <h2 className="success-title">Test complété avec succès !</h2>
                  <p className="success-message">
                    Merci d'avoir complété le test de personnalité. Votre candidature a été enregistrée et sera examinée
                    par notre équipe.
                  </p>
                  <div className="success-actions">
                    <Button onClick={() => router.push("/jobs")}>Voir d'autres offres</Button>
                    <Button variant="outline" onClick={() => router.push("/")}>
                      Retour à l'accueil
                    </Button>
                  </div>
                  <p className="redirect-message">Vous serez redirigé automatiquement dans quelques secondes...</p>
                </div>
              ) : (
                <div className="test-container">
                  <div className="test-instructions">
                    <h2 className="instructions-title">Instructions</h2>
                    <p className="instructions-text">
                      Ce test de personnalité nous aidera à évaluer votre compatibilité avec le poste. Il comporte Un questionnaire à choix multiples.
                      <br />
                      <br />
                      Veuillez répondre honnêtement à toutes les questions. Il n'y a pas de bonnes ou mauvaises
                      réponses.
                    </p>
                    <Alert className="mb-4 bg-amber-50 border-amber-200">
                      <AlertCircle className="h-4 w-4 text-amber-600" />
                      <AlertDescription className="text-amber-800">
                        Pour garantir l'intégrité du test, veuillez noter que :
                        <ul className="list-disc pl-5 mt-2 text-sm">
                          <li>Le copier-coller est désactivé pendant le test</li>
                          <li>Vous devez rester sur cette page jusqu'à la fin du test</li>
                          <li>Le test s'exécutera en mode plein écran</li>
                          <li>Toute tentative de contourner ces mesures sera enregistrée</li>
                        </ul>
                      </AlertDescription>
                    </Alert>
                  </div>

                  {candidatId && offreId ? (
                    <PersonalityTest candidatId={candidatId} offreId={offreId} onTestComplete={handleTestComplete} />
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="error-icon" />
                      <AlertTitle>Erreur</AlertTitle>
                      <AlertDescription>Identifiants manquants pour le test</AlertDescription>
                    </Alert>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  )
}