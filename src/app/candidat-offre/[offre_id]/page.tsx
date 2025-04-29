"use client"

import type React from "react"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import {
  User,
  Mail,
  Phone,
  Calendar,
  Briefcase,
  Download,
  ArrowLeft,
  AlertCircle,
  Clock,
  MapPin,
  GraduationCap,
  Search,
  X,
  FileText,
  CheckCircle2,
  XCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { DashboardHeaderRec } from "@/app/components/recruteur/dashboard-header_rec"
import { DashboardSidebarRec } from "@/app/components/recruteur/dashboard-sidebar_rec"

interface TestQuestion {
  trait: string
  question: string
  options: {
    text: string
    score: number
  }[]
}

interface TestResponse {
  candidat_id: number
  offre_id: number
  questions: TestQuestion[]
  answers: {
    question_index: number
    selected_option_index: number
    score: number
  }[]
  scores: {
    total: number
    ouverture: number
    conscience: number
    extraversion: number
    agreabilite: number
    stabilite: number
  }
  completed_at: string
}

interface Candidat {
  id: number
  nom: string
  prenom: string
  email: string
  telephone?: string
  tel?: string
  cv: string | null
  lettre_motivation?: string | null
  date_candidature: string
  created_at?: string
  updated_at?: string
  status: string
  pays?: string
  ville?: string
  codePostal?: string
  niveauExperience?: string
  niveauEtude?: string
  offre: {
    id: number
    poste: string
    departement: string
  }
}

interface Offre {
  id: number
  poste: string
  departement: string
}

interface MatchingScore {
  matching_score: number
  evaluation: string
  points_forts: string
  ecarts: string
}

export default function CandidatOffrePage({ params }: { params: Promise<{ offre_id: string }> }) {
  // Utiliser React.use pour déballer les paramètres de route
  const resolvedParams = use(params)
  const offre_id = resolvedParams.offre_id

  const router = useRouter()
  const [candidats, setCandidats] = useState<Candidat[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [offre, setOffre] = useState<Offre | null>(null)

  // États pour la recherche
  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredCandidats, setFilteredCandidats] = useState<Candidat[]>([])

  useEffect(() => {
    const checkUserRole = async () => {
      try {
        const token = sessionStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
          return
        }

        const response = await fetch("http://127.0.0.1:8000/api/users/profile", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des données")
        }

        const userData = await response.json()

        // Si l'utilisateur n'est pas un recruteur, rediriger vers le dashboard
        if (userData.role !== "recruteur") {
          router.push("/dashbord")
          return
        }

        // Continuer avec le chargement des données si l'utilisateur est un recruteur
        fetchCandidats(token)
      } catch (error) {
        console.error("Erreur:", error)
        router.push("/auth/login")
      }
    }

    const fetchCandidats = async (token: string) => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/candidatsByOffre/${offre_id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 404) {
            setError("Offre non trouvée")
          } else if (response.status === 401) {
            sessionStorage.removeItem("token")
            router.push("/auth/login")
            return
          } else {
            throw new Error("Erreur lors de la récupération des candidats")
          }
        }

        const data = await response.json()
        console.log("Données des candidats:", data) // Pour déboguer

        // Trier les candidats en mode LIFO (Last In, First Out)
        // Utiliser date_candidature ou created_at pour le tri
        const sortedCandidats = [...data].sort((a, b) => {
          const dateA = new Date(a.date_candidature || a.created_at || 0).getTime()
          const dateB = new Date(b.date_candidature || b.created_at || 0).getTime()
          return dateB - dateA // Ordre décroissant pour LIFO
        })

        setCandidats(sortedCandidats)
        setFilteredCandidats(sortedCandidats)

        // Extraire les informations de l'offre du premier candidat s'il existe
        if (data.length > 0 && data[0].offre) {
          setOffre(data[0].offre)
        }
      } catch (error) {
        console.error("Erreur:", error)
        setError("Une erreur est survenue lors du chargement des candidats")
      } finally {
        setLoading(false)
      }
    }

    checkUserRole()
  }, [offre_id, router])

  // Filtrer les candidats en fonction du terme de recherche
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setFilteredCandidats(candidats)
      return
    }

    const normalizedSearchTerm = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    const filtered = candidats.filter((candidat) => {
      const normalizedNom = candidat.nom
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      const normalizedPrenom = candidat.prenom
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
      const fullName = `${normalizedPrenom} ${normalizedNom}`

      return (
        normalizedNom.includes(normalizedSearchTerm) ||
        normalizedPrenom.includes(normalizedSearchTerm) ||
        fullName.includes(normalizedSearchTerm)
      )
    })

    setFilteredCandidats(filtered)
  }, [searchTerm, candidats])

  // Obtenir les suggestions pour l'autocomplétion
  const getSuggestions = () => {
    if (searchTerm.trim() === "") return []

    const normalizedSearchTerm = searchTerm
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")

    return candidats
      .filter((candidat) => {
        const normalizedNom = candidat.nom
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
        const normalizedPrenom = candidat.prenom
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")

        return normalizedNom.includes(normalizedSearchTerm) || normalizedPrenom.includes(normalizedSearchTerm)
      })
      .slice(0, 5) // Limiter à 5 suggestions
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setShowSuggestions(true)
  }

  const handleSuggestionClick = (candidat: Candidat) => {
    setSearchTerm(`${candidat.prenom} ${candidat.nom}`)
    setShowSuggestions(false)
  }

  const clearSearch = () => {
    setSearchTerm("")
    setFilteredCandidats(candidats)
  }

  const handleRetour = () => {
    router.back()
  }

  const suggestions = getSuggestions()

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <DashboardHeaderRec />
      <div className="container mx-auto p-4 md:p-6 lg:p-8 pt-6">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-6">
          <div className="hidden md:block md:col-span-1 lg:col-span-1">
            <div className="sticky top-20">
              <DashboardSidebarRec />
            </div>
          </div>
          <div className="md:col-span-5 lg:col-span-5 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
              <div className="text-sm text-muted-foreground italic flex items-center">
                <AlertCircle className="w-3.5 h-3.5 mr-1.5" />
                Les statistiques de correspondance avec l'offre sont générées par l'IA
              </div>
            </div>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <Button
                  variant="ghost"
                  onClick={handleRetour}
                  className="mb-2 text-muted-foreground hover:text-foreground"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Retour aux offres
                </Button>
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Candidats pour l'offre</h1>
                {offre && (
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      {offre.departement}
                    </Badge>
                    <p className="text-lg font-medium">{offre.poste}</p>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-100 px-3 py-1">
                  <User className="w-4 h-4 mr-2" />
                  {candidats.length} candidat{candidats.length > 1 ? "s" : ""}
                </Badge>
              </div>
            </div>

            {/* Barre de recherche */}
            {!loading && !error && candidats.length > 0 && (
              <div className="relative">
                <div className="flex items-center border rounded-lg overflow-hidden bg-white shadow-sm">
                  <div className="pl-3 text-gray-400">
                    <Search className="h-5 w-5" />
                  </div>
                  <Input
                    type="text"
                    placeholder="Rechercher par nom ou prénom..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="flex-1 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    onFocus={() => setShowSuggestions(true)}
                    onBlur={() => {
                      // Délai pour permettre le clic sur une suggestion
                      setTimeout(() => setShowSuggestions(false), 200)
                    }}
                  />
                  {searchTerm && (
                    <Button variant="ghost" size="icon" onClick={clearSearch} className="h-9 w-9 mr-1">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                {/* Liste de suggestions */}
                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-auto">
                    {suggestions.map((candidat) => (
                      <div
                        key={candidat.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                        onMouseDown={() => handleSuggestionClick(candidat)}
                      >
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>
                          {candidat.prenom} {candidat.nom}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {loading ? (
              <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                  <p className="text-xl font-medium text-center">{error}</p>
                  <Button onClick={handleRetour} className="mt-6">
                    Retourner aux offres
                  </Button>
                </CardContent>
              </Card>
            ) : candidats.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                  <p className="text-xl font-medium text-center">Aucun candidat n'a postulé à cette offre</p>
                  <Button onClick={handleRetour} className="mt-6">
                    Retourner aux offres
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-6">
                <Tabs defaultValue="tous" className="w-full">
                  <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
                    <TabsTrigger
                      value="tous"
                      className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
                    >
                      Tous les candidats
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="tous" className="pt-6">
                    {filteredCandidats.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-12 text-center">
                        <AlertCircle className="h-12 w-12 text-amber-500 mb-4" />
                        <p className="text-xl font-medium">Aucun candidat ne correspond à votre recherche</p>
                        <Button onClick={clearSearch} className="mt-6">
                          Réinitialiser la recherche
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredCandidats.map((candidat) => (
                          <CandidatCard key={candidat.id} candidat={candidat} offreId={Number(offre_id)} />
                        ))}
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant pour afficher une question et sa réponse
function QuestionItem({
  question,
  questionIndex,
  selectedOptionIndex,
  isOpen,
  onToggle,
}: {
  question: TestQuestion
  questionIndex: number
  selectedOptionIndex: number
  isOpen: boolean
  onToggle: () => void
}) {
  const selectedOption = question.options[selectedOptionIndex]

  return (
    <div className="border rounded-lg mb-3 overflow-hidden">
      <div
        className={`flex items-start justify-between p-4 cursor-pointer ${
          isOpen ? "bg-primary/5" : "hover:bg-gray-50"
        }`}
        onClick={onToggle}
      >
        <div className="flex items-start text-left">
          <span className="font-medium mr-2">Q{questionIndex + 1}.</span>
          <span className="text-sm">{question.question}</span>
        </div>
        <div className="ml-2 flex-shrink-0">
          {isOpen ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
        </div>
      </div>

      {isOpen && (
        <div className="p-4 pt-0 border-t">
          <div className="text-sm text-gray-500 mb-3">
            Trait évalué: <span className="font-medium">{question.trait}</span>
          </div>

          <div className="space-y-2">
            <div className="text-sm font-medium">Options:</div>
            {question.options.map((option, oIndex) => (
              <div
                key={oIndex}
                className={`flex items-center p-2 rounded-md ${
                  selectedOptionIndex === oIndex
                    ? "bg-primary/10 border border-primary/30"
                    : "bg-gray-50 border border-gray-100"
                }`}
              >
                {selectedOptionIndex === oIndex ? (
                  <CheckCircle2 className="w-4 h-4 mr-2 text-primary flex-shrink-0" />
                ) : (
                  <div className="w-4 h-4 mr-2 rounded-full border border-gray-300 flex-shrink-0" />
                )}
                <span className="text-sm">{option.text}</span>
                <span className="ml-auto text-xs text-gray-500">Score: {option.score}</span>
              </div>
            ))}
          </div>

          {selectedOption && (
            <div className="mt-4 pt-2 border-t border-gray-100">
              <div className="text-sm font-medium">Réponse sélectionnée:</div>
              <div className="flex items-center mt-1">
                <CheckCircle2 className="w-4 h-4 mr-2 text-green-600" />
                <span className="text-sm">{selectedOption.text}</span>
                <Badge variant="outline" className="ml-auto bg-gray-50 text-gray-700">
                  Score: {selectedOption.score}
                </Badge>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// Modify the CandidatCard component to ensure all cards have the same height
function CandidatCard({ candidat, offreId }: { candidat: Candidat; offreId: number }) {
  const [matchingScore, setMatchingScore] = useState<MatchingScore | null>(null)
  const [loadingScore, setLoadingScore] = useState(false)
  const [testResponse, setTestResponse] = useState<TestResponse | null>(null)
  const [loadingTest, setLoadingTest] = useState(false)
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(null)

  useEffect(() => {
    const fetchMatchingScore = async () => {
      try {
        setLoadingScore(true)
        const token = sessionStorage.getItem("token")
        if (!token) return

        const response = await fetch(`http://127.0.0.1:8000/api/showMatchingScore/${candidat.id}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setMatchingScore(data)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération du score de matching:", error)
      } finally {
        setLoadingScore(false)
      }
    }

    const fetchTestResponse = async () => {
      try {
        setLoadingTest(true)
        const token = sessionStorage.getItem("token")
        if (!token) return

        const response = await fetch(`http://127.0.0.1:8000/api/test-responses/${candidat.id}/${offreId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setTestResponse(data)
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des réponses au test:", error)
      } finally {
        setLoadingTest(false)
      }
    }

    fetchMatchingScore()
    fetchTestResponse()
  }, [candidat.id, offreId])

  // Formater la date et l'heure de candidature
  const formatDateAndTime = (dateString: string | undefined) => {
    // Si la date n'est pas définie, utiliser une valeur par défaut
    if (!dateString) {
      return { date: "Non spécifiée", time: "" }
    }

    try {
      // Essayer différents formats de date
      let date: Date

      // Vérifier si la date est au format MySQL (YYYY-MM-DD HH:MM:SS)
      if (dateString.includes(" ") && dateString.length > 16) {
        date = new Date(dateString.replace(" ", "T"))
      } else {
        // Essayer le format standard
        date = new Date(dateString)
      }

      // Vérifier si la date est valide
      if (isNaN(date.getTime())) {
        console.error("Date invalide:", dateString)
        return { date: "Non spécifiée", time: "" }
      }

      const formattedDate = date.toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      })

      const formattedTime = date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      })

      return { date: formattedDate, time: formattedTime }
    } catch (error) {
      console.error("Erreur de formatage de date:", error)
      return { date: "Non spécifiée", time: "" }
    }
  }

  // Utiliser created_at si date_candidature n'est pas disponible
  const dateToUse = candidat.date_candidature || candidat.created_at
  const { date, time } = formatDateAndTime(dateToUse)

  // Utiliser tel ou telephone selon ce qui est disponible
  const telephone = candidat.telephone || candidat.tel || null

  // Fonction pour déterminer la couleur du badge de matching score
  const getMatchingScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-100 text-green-800 border-green-200"
    if (score >= 60) return "bg-blue-100 text-blue-800 border-blue-200"
    if (score >= 40) return "bg-amber-100 text-amber-800 border-amber-200"
    return "bg-red-100 text-red-800 border-red-200"
  }

  // Fonction pour déterminer la couleur du badge de score de trait
  const getTraitScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-50 text-green-700 border-green-100"
    if (score >= 60) return "bg-blue-50 text-blue-700 border-blue-100"
    if (score >= 40) return "bg-amber-50 text-amber-700 border-amber-100"
    return "bg-red-50 text-red-700 border-red-100"
  }

  // Gérer l'ouverture/fermeture des questions
  const toggleQuestion = (index: number) => {
    if (openQuestionIndex === index) {
      setOpenQuestionIndex(null)
    } else {
      setOpenQuestionIndex(index)
    }
  }

  return (
    <Card className="overflow-hidden border-gray-200 hover:border-blue-300 transition-colors duration-200 shadow-sm hover:shadow flex flex-col h-full">
      <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 pb-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold flex items-center">
              <User className="w-5 h-5 mr-2 text-primary" />
              {candidat.prenom} {candidat.nom}
            </CardTitle>
          </div>
          <div className="flex gap-2">
            {/* Matching Score Badge */}
            {loadingScore ? (
              <div className="h-8 w-24 bg-gray-100 animate-pulse rounded-full"></div>
            ) : matchingScore ? (
              <Badge
                variant="outline"
                className={`${getMatchingScoreColor(matchingScore.matching_score)} px-3 py-1 font-medium`}
              >
                Correspondance avec l'offre: {matchingScore.matching_score}%
              </Badge>
            ) : null}

            {candidat.cv && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(candidat.cv!, "_blank")}
                className="text-blue-600 border-blue-200 hover:bg-blue-50"
              >
                <Download className="h-4 w-4 mr-1" />
                CV
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="p-4 pt-3 pb-2 flex-grow">
        <div className="grid grid-cols-1 gap-2.5">
          <div className="flex items-center">
            <Mail className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
            <a href={`mailto:${candidat.email}`} className="text-blue-600 hover:underline truncate">
              {candidat.email}
            </a>
          </div>

          {telephone && (
            <div className="flex items-center">
              <Phone className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
              <a href={`tel:${telephone}`} className="text-blue-600 hover:underline">
                {telephone}
              </a>
            </div>
          )}

          {/* Adresse */}
          {(candidat.ville || candidat.pays || candidat.codePostal) && (
            <div className="flex items-start">
              <MapPin className="w-4 h-4 mr-2 mt-0.5 text-gray-500 flex-shrink-0" />
              <div className="text-gray-700">
                {candidat.ville && <span>{candidat.ville}</span>}
                {candidat.codePostal && (
                  <span>{candidat.ville ? `, ${candidat.codePostal}` : candidat.codePostal}</span>
                )}
                {candidat.pays && (
                  <span>{candidat.ville || candidat.codePostal ? `, ${candidat.pays}` : candidat.pays}</span>
                )}
              </div>
            </div>
          )}

          {/* Niveau d'expérience */}
          {candidat.niveauExperience && (
            <div className="flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700">
                Expérience: <span className="font-medium">{candidat.niveauExperience}</span>
              </span>
            </div>
          )}

          {/* Niveau d'étude */}
          {candidat.niveauEtude && (
            <div className="flex items-center">
              <GraduationCap className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700">
                Études: <span className="font-medium">{candidat.niveauEtude}</span>
              </span>
            </div>
          )}

          {/* Test de personnalité */}
          {loadingTest ? (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 rounded-full border-2 border-t-primary border-r-transparent border-b-transparent border-l-transparent animate-spin"></div>
                <span className="text-sm text-gray-500">Chargement des résultats du test...</span>
              </div>
            </div>
          ) : testResponse ? (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-gray-700 flex items-center">
                  <FileText className="w-4 h-4 mr-1.5 text-primary" />
                  Test de personnalité complété
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm" className="text-xs">
                      Voir les détails
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                      <DialogTitle>
                        Résultats du test de personnalité - {candidat.prenom} {candidat.nom}
                      </DialogTitle>
                      <DialogDescription>
                        Test complété le{" "}
                        {formatDateAndTime(testResponse.completed_at).date +
                          " à " +
                          formatDateAndTime(testResponse.completed_at).time}
                      </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                      {/* Scores par trait */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Scores par trait de personnalité</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
                          <div className="border rounded-lg p-3 flex flex-col items-center">
                            <span className="text-sm text-gray-500 mb-1">Ouverture</span>
                            <Badge
                              variant="outline"
                              className={`${getTraitScoreColor(testResponse.scores.ouverture)} px-3 py-1 font-medium`}
                            >
                              {testResponse.scores.ouverture}%
                            </Badge>
                          </div>
                          <div className="border rounded-lg p-3 flex flex-col items-center">
                            <span className="text-sm text-gray-500 mb-1">Conscience</span>
                            <Badge
                              variant="outline"
                              className={`${getTraitScoreColor(testResponse.scores.conscience)} px-3 py-1 font-medium`}
                            >
                              {testResponse.scores.conscience}%
                            </Badge>
                          </div>
                          <div className="border rounded-lg p-3 flex flex-col items-center">
                            <span className="text-sm text-gray-500 mb-1">Extraversion</span>
                            <Badge
                              variant="outline"
                              className={`${getTraitScoreColor(testResponse.scores.extraversion)} px-3 py-1 font-medium`}
                            >
                              {testResponse.scores.extraversion}%
                            </Badge>
                          </div>
                          <div className="border rounded-lg p-3 flex flex-col items-center">
                            <span className="text-sm text-gray-500 mb-1">Agréabilité</span>
                            <Badge
                              variant="outline"
                              className={`${getTraitScoreColor(testResponse.scores.agreabilite)} px-3 py-1 font-medium`}
                            >
                              {testResponse.scores.agreabilite}%
                            </Badge>
                          </div>
                          <div className="border rounded-lg p-3 flex flex-col items-center">
                            <span className="text-sm text-gray-500 mb-1">Stabilité</span>
                            <Badge
                              variant="outline"
                              className={`${getTraitScoreColor(testResponse.scores.stabilite)} px-3 py-1 font-medium`}
                            >
                              {testResponse.scores.stabilite}%
                            </Badge>
                          </div>
                        </div>
                      </div>

                      {/* Questions et réponses */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Questions et réponses</h3>
                        <div className="space-y-1">
                          {testResponse.questions.map((question, qIndex) => {
                            // Trouver la réponse correspondante
                            const answer = testResponse.answers.find((a) => a.question_index === qIndex)
                            const selectedOptionIndex = answer ? answer.selected_option_index : 0

                            return (
                              <QuestionItem
                                key={qIndex}
                                question={question}
                                questionIndex={qIndex}
                                selectedOptionIndex={selectedOptionIndex}
                                isOpen={openQuestionIndex === qIndex}
                                onToggle={() => toggleQuestion(qIndex)}
                              />
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Afficher un résumé des scores */}
              <div className="mt-2 grid grid-cols-5 gap-1">
                {Object.entries(testResponse.scores)
                  .slice(1)
                  .map(([trait, score], index) => (
                    <div key={trait} className="flex flex-col items-center">
                      <span className="text-xs text-gray-500 truncate w-full text-center">
                        {trait === "ouverture"
                          ? "Ouv."
                          : trait === "conscience"
                            ? "Cons."
                            : trait === "extraversion"
                              ? "Extr."
                              : trait === "agreabilite"
                                ? "Agré."
                                : trait === "stabilite"
                                  ? "Stab."
                                  : trait}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${getTraitScoreColor(score as number)} text-xs px-2 py-0.5 mt-1`}
                      >
                        {score}%
                      </Badge>
                    </div>
                  ))}
              </div>
            </div>
          ) : (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="flex items-center text-sm text-gray-500">
                <XCircle className="w-4 h-4 mr-1.5 text-gray-400" />
                Aucun résultat de test disponible
              </div>
            </div>
          )}

          {/* Matching Score Details - only show if we have data */}
          {matchingScore && (
            <div className="mt-2 pt-2 border-t border-gray-100">
              <div className="text-xs font-semibold uppercase text-gray-500 mb-1">Évaluation</div>
              <p className="text-sm text-gray-700">{matchingScore.evaluation}</p>

              {matchingScore.points_forts && (
                <div className="mt-1.5">
                  <div className="text-xs font-semibold uppercase text-green-600">Points forts</div>
                  <p className="text-sm text-gray-700">{matchingScore.points_forts}</p>
                </div>
              )}

              {matchingScore.ecarts && (
                <div className="mt-1.5">
                  <div className="text-xs font-semibold uppercase text-amber-600">Écarts</div>
                  <p className="text-sm text-gray-700">{matchingScore.ecarts}</p>
                </div>
              )}
            </div>
          )}
        </div>
      </CardContent>

      {/* Pied de carte avec bordure supérieure */}
      <CardFooter className="p-3 bg-gray-50 flex items-center justify-between border-t border-gray-200 mt-auto">
        <div className="flex items-center text-sm text-gray-500">
          <Calendar className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
          <span>Postuler le {date}</span>
        </div>
        {time && (
          <div className="flex items-center text-sm text-gray-500">
            <Clock className="w-3.5 h-3.5 mr-1.5 text-gray-400" />
            <span>à {time}</span>
          </div>
        )}
      </CardFooter>
    </Card>
  )
}
