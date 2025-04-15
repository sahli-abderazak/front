"use client"

import { useState, useEffect, use } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
} from "lucide-react"
import { DashboardHeaderRec } from "@/app/components/recruteur/dashboard-header_rec"
import { DashboardSidebarRec } from "@/app/components/recruteur/dashboard-sidebar_rec"

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

  useEffect(() => {
    const fetchCandidats = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          router.push("/auth/login")
          return
        }

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
            localStorage.removeItem("token")
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

    fetchCandidats()
  }, [offre_id, router])

  const handleRetour = () => {
    router.back()
  }

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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {candidats.map((candidat) => (
                        <CandidatCard key={candidat.id} candidat={candidat} />
                      ))}
                    </div>
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

// Modify the CandidatCard component to ensure all cards have the same height
function CandidatCard({ candidat }: { candidat: Candidat }) {
  const [matchingScore, setMatchingScore] = useState<MatchingScore | null>(null)
  const [loadingScore, setLoadingScore] = useState(false)

  useEffect(() => {
    const fetchMatchingScore = async () => {
      try {
        setLoadingScore(true)
        const token = localStorage.getItem("token")
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

    fetchMatchingScore()
  }, [candidat.id])

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