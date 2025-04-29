"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { CheckCircle2, AlertCircle, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import TestSecurity from "./test-security"

interface Option {
  text: string
  score: number
}

interface TestQuestion {
  trait: string
  question: string
  options: Option[]
}

interface PersonalityTestProps {
  candidatId: number
  offreId: number
  onTestComplete?: () => void
}

const PersonalityTest: React.FC<PersonalityTestProps> = ({ candidatId, offreId, onTestComplete }) => {
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<Option | null>(null)
  const [totalScore, setTotalScore] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [testCompleted, setTestCompleted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [answers, setAnswers] = useState<(Option | null)[]>([])
  const [testStage, setTestStage] = useState<"qcm" | "image" | "completed" | "timeout">("qcm")
  const [personalityAnalysis, setPersonalityAnalysis] = useState<string | null>(null)
  const [securityViolations, setSecurityViolations] = useState<Record<string, number>>({})

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState(10 * 60) // 10 minutes in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Use refs to track initialization state and prevent multiple API calls
  const isInitialRender = useRef(true)
  const questionsInitialized = useRef(false)
  const apiCallInProgress = useRef(false)

  // Initialize timer when component mounts
  useEffect(() => {
    // Start the timer
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Time's up - clear interval and set timeout state
          if (timerRef.current) {
            clearInterval(timerRef.current)
          }
          // Set timeout state which will trigger the timeout UI
          setTestStage("timeout")
          return 0
        }
        return prev - 1
      })
    }, 1000)

    // Cleanup timer on unmount
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [])

  // Clear timer when test is completed
  useEffect(() => {
    if (testStage === "completed" && timerRef.current) {
      clearInterval(timerRef.current)
    }
  }, [testStage])

  // Fetch questions when component mounts
  useEffect(() => {
    if (!apiCallInProgress.current && !questionsInitialized.current) {
      fetchQuestions()
    }
  }, [candidatId, offreId])

  // Initialize answers array when questions are loaded
  useEffect(() => {
    if (questions.length > 0 && !questionsInitialized.current) {
      console.log("Initializing answers array for the first time")
      setAnswers(new Array(questions.length).fill(null))
      questionsInitialized.current = true
    }
  }, [questions])

  // Update selected option when changing questions
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length && !isInitialRender.current) {
      console.log(`Updating selected option for question ${currentQuestionIndex}`)
      setSelectedOption(answers[currentQuestionIndex])
    }

    // Mark initial render as complete after the first run
    if (isInitialRender.current) {
      isInitialRender.current = false
    }
  }, [currentQuestionIndex, answers, questions])

  // Format time remaining as MM:SS
  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const fetchQuestions = async () => {
    // Prevent multiple simultaneous API calls
    if (apiCallInProgress.current) {
      console.log("API call already in progress, skipping duplicate fetch")
      return
    }

    try {
      apiCallInProgress.current = true
      setLoading(true)
      setError(null)
      console.log(`Récupération des questions pour candidat ID: ${candidatId}, offre ID: ${offreId}`)

      // Ensure IDs are numbers
      const candidatIdNumber = Number(candidatId)
      const offreIdNumber = Number(offreId)

      if (isNaN(candidatIdNumber) || isNaN(offreIdNumber)) {
        throw new Error("IDs de candidat ou d'offre invalides")
      }

      const response = await fetch(`http://127.0.0.1:8000/api/generate-test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidat_id: candidatIdNumber,
          offre_id: offreIdNumber,
        }),
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`Erreur HTTP: ${response.status}, message: ${errorText}`)
        throw new Error(`Erreur lors de la récupération des questions: ${response.status}`)
      }

      const data = await response.json()
      console.log("Questions reçues:", data)

      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setQuestions(data.questions)
      } else {
        throw new Error("Format de réponse invalide ou aucune question trouvée")
      }
    } catch (error) {
      console.error(`Erreur: ${error instanceof Error ? error.message : String(error)}`)
      setError("Impossible de charger les questions du test. Veuillez réessayer.")
    } finally {
      setLoading(false)
      apiCallInProgress.current = false
    }
  }

  const handleOptionSelect = (option: Option) => {
    // Store the answer in the answers array
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = option
    setAnswers(newAnswers)

    // Update selected option for display
    setSelectedOption(option)
    setError(null)
  }

  const goToNextQuestion = () => {
    if (!selectedOption) {
      setError("Veuillez sélectionner une réponse.")
      return
    }

    // Store the current answer
    const newAnswers = [...answers]
    newAnswers[currentQuestionIndex] = selectedOption
    setAnswers(newAnswers)

    if (currentQuestionIndex < questions.length - 1) {
      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    } else {
      // Calculate final score from all answers
      const finalScore = newAnswers.reduce((total, answer) => total + (answer ? answer.score : 0), 0)
      setTotalScore(finalScore)
      submitQcmTest()
    }
  }

  const goToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
      setError(null)
    }
  }

  const submitQcmTest = async () => {
    try {
      setSubmitting(true)

      // Préparer les données des réponses pour le stockage
      const answersData = answers
        .map((answer, index) => {
          if (!answer) return null

          // Trouver l'index de l'option sélectionnée
          const optionIndex = questions[index].options.findIndex(
            (opt) => opt.text === answer.text && opt.score === answer.score,
          )

          return {
            question_index: index,
            selected_option_index: optionIndex !== -1 ? optionIndex : 0,
            score: answer.score,
          }
        })
        .filter((a) => a !== null)

      // Ensure we have valid IDs
      const candidatIdNumber = Number(candidatId)
      const offreIdNumber = Number(offreId)

      if (isNaN(candidatIdNumber) || isNaN(offreIdNumber)) {
        throw new Error("Identifiants de candidat ou d'offre invalides")
      }

      console.log(`Envoi du score pour candidat ID: ${candidatIdNumber}, offre ID: ${offreIdNumber}`)

      // Nous n'avons plus besoin de calculer les scores ici, le backend s'en chargera
      // avec la nouvelle formule de pourcentage
      const storeScoreResponse = await fetch(`http://127.0.0.1:8000/api/store-score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidat_id: candidatIdNumber,
          offre_id: offreIdNumber,
          score_total: totalScore,
          questions: questions, // Envoyer toutes les questions
          answers: answersData, // Envoyer toutes les réponses avec les index
        }),
      })

      if (!storeScoreResponse.ok) {
        const errorData = await storeScoreResponse.json()
        throw new Error(errorData.error || `Erreur HTTP ${storeScoreResponse.status}`)
      }

      const data = await storeScoreResponse.json()
      console.log(`Score enregistré avec succès:`, data)

      // Move directly to completed stage
      setTestStage("completed")
      setTestCompleted(true)

      // Call onTestComplete callback if provided
      if (onTestComplete) {
        setTimeout(() => {
          onTestComplete()
        }, 3000)
      }
    } catch (error) {
      console.error(`Erreur: ${error instanceof Error ? error.message : String(error)}`)
      setError(`Erreur lors de l'enregistrement du score: ${error instanceof Error ? error.message : String(error)}`)

      // Even if there's an error, move to completed stage after a delay
      setTimeout(() => {
        setTestStage("completed")
      }, 2000)
    } finally {
      setSubmitting(false)
    }
  }

  // Navigation directe vers une question spécifique
  const navigateToQuestion = (index: number) => {
    if (index >= 0 && index < questions.length) {
      // Sauvegarder la réponse actuelle avant de naviguer
      if (selectedOption) {
        const newAnswers = [...answers]
        newAnswers[currentQuestionIndex] = selectedOption
        setAnswers(newAnswers)
      }

      setCurrentQuestionIndex(index)
      setError(null)
    }
  }

  // Handle security violations
  const handleSecurityViolation = (type: string, count: number) => {
    setSecurityViolations((prev) => ({
      ...prev,
      [type]: count,
    }))

    // Log the violation to the console
    console.log(`Security violation: ${type}, count: ${count}`)
  }

  // Render timeout screen
  if (testStage === "timeout") {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold">Temps écoulé</h3>
        <p className="text-muted-foreground">
          Le temps alloué pour ce test est écoulé. Votre candidature n'a pas pu être complétée.
        </p>
        <Button variant="outline" onClick={() => window.history.back()}>
          Retour
        </Button>
      </div>
    )
  }

  if (loading && testStage === "qcm") {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-4">
        <div className="h-12 w-12 rounded-full border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
        <p className="text-muted-foreground">Chargement des questions...</p>
      </div>
    )
  }

  if (testStage === "completed") {
    return (
      <div className="flex flex-col items-center justify-center p-8 space-y-6 text-center">
        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-green-100">
          <CheckCircle2 className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold">Test terminé avec succès !</h3>
        <p className="text-muted-foreground">Votre candidature a été enregistrée avec succès.</p>
      </div>
    )
  }

  if (error && testStage === "qcm") {
    return (
      <div className="p-6 space-y-4">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button onClick={fetchQuestions}>Réessayer</Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Retour
          </Button>
        </div>
      </div>
    )
  }

  if (!questions.length && testStage === "qcm") {
    return (
      <div className="p-6 space-y-4">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Aucune question n'a été trouvée pour ce test.</AlertDescription>
        </Alert>
        <div className="flex gap-4">
          <Button onClick={fetchQuestions}>Réessayer</Button>
          <Button variant="outline" onClick={() => window.history.back()}>
            Retour
          </Button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = currentQuestionIndex > 0 ? (currentQuestionIndex / questions.length) * 100 : 0

  return (
    <TestSecurity onViolation={handleSecurityViolation} maxViolations={5}>
      <div className="p-4 space-y-6">
        {/* Timer display */}
        <div className="flex items-center justify-center gap-2 text-lg font-medium">
          <Clock className="h-5 w-5" />
          <span className={`${timeRemaining < 60 ? "text-red-500 animate-pulse" : ""}`}>
            Temps restant: {formatTime(timeRemaining)}
          </span>
        </div>

        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-medium">
              Question {currentQuestionIndex + 1} sur {questions.length}
            </h3>
            <span className="text-sm text-muted-foreground">{Math.round(progress)}% complété</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        {/* Question card */}
        <div className="border rounded-lg p-6 space-y-6 shadow-sm">
          <div className="space-y-2">
            <h4 className="text-lg font-medium">{currentQuestion.question}</h4>
            <p className="text-sm text-muted-foreground">Trait: {currentQuestion.trait}</p>
          </div>

          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center p-3 rounded-md border cursor-pointer transition-colors ${
                  selectedOption === option ? "bg-primary/10 border-primary" : "hover:bg-muted/50"
                }`}
                onClick={() => handleOptionSelect(option)}
              >
                <div className="flex-shrink-0 mr-3">
                  <div
                    className={`h-5 w-5 rounded-full border flex items-center justify-center ${
                      selectedOption === option ? "border-primary" : "border-muted-foreground"
                    }`}
                  >
                    {selectedOption === option && <div className="h-3 w-3 rounded-full bg-primary"></div>}
                  </div>
                </div>
                <span className="text-sm">{option.text}</span>
              </div>
            ))}
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Navigation buttons */}
          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex === 0 || submitting}
            >
              Question précédente
            </Button>

            <Button onClick={goToNextQuestion} disabled={!selectedOption || submitting}>
              {submitting ? (
                <>
                  <div className="h-4 w-4 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin mr-2"></div>
                  Traitement...
                </>
              ) : currentQuestionIndex === questions.length - 1 ? (
                "Terminer le test"
              ) : (
                "Question suivante"
              )}
            </Button>
          </div>
        </div>

        {/* Question counter pills */}
        <div className="flex flex-wrap gap-2 justify-center">
          {questions.map((_, index) => (
            <div
              key={index}
              className={`h-8 w-8 rounded-full flex items-center justify-center text-sm cursor-pointer transition-colors ${
                index === currentQuestionIndex
                  ? "bg-primary text-primary-foreground"
                  : answers[index]
                    ? "bg-primary/20 text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
              onClick={() => navigateToQuestion(index)}
            >
              {index + 1}
            </div>
          ))}
        </div>
      </div>
    </TestSecurity>
  )
}

export default PersonalityTest
