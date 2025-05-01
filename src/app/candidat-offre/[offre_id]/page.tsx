"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import { DialogFooter } from "@/components/ui/dialog"

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
  Trash2,
} from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  matchingScore?: number
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

// Composant pour planifier un entretien
function InterviewScheduler({
  candidatId,
  candidatNom,
  candidatPrenom,
  candidatEmail,
  offreId,
  offrePoste,
}: {
  candidatId: number
  candidatNom: string
  candidatPrenom: string
  candidatEmail: string
  offreId: number
  offrePoste: string
}) {
  const [date, setDate] = useState<Date>()
  const [time, setTime] = useState<string>("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  // Ajouter ces nouveaux états
  const [recruiterAddress, setRecruiterAddress] = useState<string>("")
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)

  // Ajouter ces états après les états existants
  const [type, setType] = useState<"en ligne" | "présentiel">("présentiel")
  const [lienOuAdresse, setLienOuAdresse] = useState<string>("")
  const [unavailableHours, setUnavailableHours] = useState<string[]>([])
  const [availableTimeSlots, setAvailableTimeSlots] = useState<string[]>([])

  // Générer les heures disponibles (9h à 17h)
  const timeSlots = Array.from({ length: 9 }, (_, i) => {
    const hour = i + 9
    return `${hour}:00`
  })

  // Ajouter cette fonction après les états
  // Modifier la fonction fetchUnavailableHours pour utiliser la nouvelle API getAvailableHours
  const fetchAvailableHours = async (selectedDate: Date) => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) return

      const formattedDate = selectedDate.toISOString().split("T")[0]

      const response = await fetch(
        `http://127.0.0.1:8000/api/interview/available-hours?date=${formattedDate}&offre_id=${offreId}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (response.ok) {
        const data = await response.json()
        setAvailableTimeSlots(data.available_hours || [])
      }
    } catch (error) {
      console.error("Erreur lors de la récupération des heures disponibles:", error)
      setAvailableTimeSlots([]) // En cas d'erreur, afficher aucune heure disponible
    }
  }

  // Add this function to fetch the recruiter's address
  const fetchRecruiterAddress = async () => {
    try {
      setIsLoadingAddress(true)
      const token = sessionStorage.getItem("token")
      if (!token) return

      const response = await fetch("http://127.0.0.1:8000/api/users/profile", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const userData = await response.json()
        if (userData.adresse) {
          setRecruiterAddress(userData.adresse)
          // If type is présentiel, automatically set the address
          if (type === "présentiel") {
            setLienOuAdresse(userData.adresse)
          }
        }
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de l'adresse du recruteur:", error)
    } finally {
      setIsLoadingAddress(false)
    }
  }

  // Add useEffect to call the fetchRecruiterAddress function when the component mounts
  useEffect(() => {
    fetchRecruiterAddress()
  }, [])

  // Add useEffect to update lienOuAdresse when type changes
  useEffect(() => {
    if (type === "présentiel" && recruiterAddress) {
      setLienOuAdresse(recruiterAddress)
    } else if (type === "en ligne") {
      setLienOuAdresse("")
    }
  }, [type, recruiterAddress])

  // Modify the handleSubmit function to handle the validation and error cases
  const handleSubmit = async () => {
    if (!date || !time) {
      setMessage({ type: "error", text: "Veuillez sélectionner une date et une heure" })
      return
    }

    if (type === "en ligne" && !lienOuAdresse) {
      setMessage({ type: "error", text: "Veuillez fournir un lien Meet pour l'entretien en ligne" })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        throw new Error("Vous n'êtes pas connecté")
      }

      // Formater la date et l'heure pour l'API
      const [hours, minutes] = time.split(":")
      const scheduledDate = date.toISOString().split("T")[0] // Récupérer seulement la partie date (YYYY-MM-DD)
      const formattedDateTime = `${scheduledDate} ${hours}:${minutes}:00` // Format: "YYYY-MM-DD HH:MM:SS"

      const response = await fetch("http://127.0.0.1:8000/api/schedule-interview", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          candidat_id: candidatId,
          offre_id: offreId,
          date_heure: formattedDateTime, // Utiliser le format "YYYY-MM-DD HH:MM:SS" au lieu de ISO
          candidat_email: candidatEmail,
          candidat_nom: candidatNom,
          candidat_prenom: candidatPrenom,
          poste: offrePoste,
          type: type,
          lien_ou_adresse: lienOuAdresse,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        // Check for specific error messages
        if (data && data.message) {
          throw new Error(data.message)
        } else {
          throw new Error("Erreur lors de la planification de l'entretien")
        }
      }

      setMessage({
        type: "success",
        text: `Un email a été envoyé à ${candidatPrenom} ${candidatNom} pour confirmer l'entretien.`,
      })
      setTimeout(() => setIsOpen(false), 2000)
    } catch (error) {
      console.error("Erreur:", error)
      setMessage({ type: "error", text: error instanceof Error ? error.message : "Une erreur est survenue" })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
          Contacter
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Planifier un entretien technique</DialogTitle>
          <DialogDescription>
            Sélectionnez une date et une heure pour l'entretien avec {candidatPrenom} {candidatNom} pour le poste de{" "}
            {offrePoste}.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          {message && (
            <div
              className={`p-3 rounded-md ${
                message.type === "success" ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"
              }`}
            >
              {message.text}
            </div>
          )}
          <div className="grid gap-2">
            <label className="text-sm font-medium">Date de l'entretien</label>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                <Calendar className="h-4 w-4" />
              </div>
              <input
                type="date"
                className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                min={new Date().toISOString().split("T")[0]}
                // Remplacer l'appel à fetchUnavailableHours par fetchAvailableHours dans le onChange de l'input date
                onChange={(e) => {
                  if (e.target.value) {
                    const newDate = new Date(e.target.value)
                    setDate(newDate)
                    fetchAvailableHours(newDate)
                  } else {
                    setDate(undefined)
                    setAvailableTimeSlots([])
                  }
                }}
                value={date ? date.toISOString().split("T")[0] : ""}
              />
            </div>
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Heure de l'entretien</label>
            <Select value={time} onValueChange={setTime}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sélectionner une heure">
                  {time ? (
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      {time}
                    </div>
                  ) : (
                    "Sélectionner une heure"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {date ? (
                  availableTimeSlots.length > 0 ? (
                    availableTimeSlots.map((slot) => (
                      <SelectItem key={slot} value={slot}>
                        {slot}
                      </SelectItem>
                    ))
                  ) : (
                    <div className="p-2 text-center text-sm text-gray-500">
                      Aucun créneau disponible pour cette date
                    </div>
                  )
                ) : (
                  <div className="p-2 text-center text-sm text-gray-500">Veuillez d'abord sélectionner une date</div>
                )}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 mt-2">
            <label className="text-sm font-medium">Type d'entretien</label>
            <div className="flex gap-4">
              <div className="flex items-center">
                <input
                  type="radio"
                  id="presentiel"
                  name="type"
                  value="présentiel"
                  checked={type === "présentiel"}
                  onChange={() => {
                    setType("présentiel")
                    setLienOuAdresse("")
                  }}
                  className="mr-2"
                />
                <label htmlFor="presentiel" className="text-sm">
                  Présentiel
                </label>
              </div>
              <div className="flex items-center">
                <input
                  type="radio"
                  id="enligne"
                  name="type"
                  value="en ligne"
                  checked={type === "en ligne"}
                  onChange={() => {
                    setType("en ligne")
                    setLienOuAdresse("")
                  }}
                  className="mr-2"
                />
                <label htmlFor="enligne" className="text-sm">
                  En ligne
                </label>
              </div>
            </div>
          </div>

          {type === "en ligne" ? (
            <div className="grid gap-2 mt-2">
              <label className="text-sm font-medium">Lien Google Meet</label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <Mail className="h-4 w-4" />
                </div>
                <input
                  type="url"
                  placeholder="https://meet.google.com/..."
                  className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={lienOuAdresse}
                  onChange={(e) => setLienOuAdresse(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div className="grid gap-2 mt-2">
              <label className="text-sm font-medium">
                Adresse
                <span className="text-xs text-gray-500 ml-1">(adresse du recruteur)</span>
              </label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                  <MapPin className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder={isLoadingAddress ? "Chargement de l'adresse..." : "Adresse de l'entretien"}
                  className="w-full rounded-md border border-input bg-background px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={lienOuAdresse}
                  onChange={(e) => setLienOuAdresse(e.target.value)}
                  readOnly={false}
                />
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Annuler
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting ? "Envoi en cours..." : "Planifier et envoyer l'invitation"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
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
  const [deleteMessage, setDeleteMessage] = useState<string | null>(null)

  // États pour la recherche
  const [searchTerm, setSearchTerm] = useState("")
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [filteredCandidats, setFilteredCandidats] = useState<Candidat[]>([])

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

      // Extraire les informations de l'offre du premier candidat s'il existe
      if (data.length > 0 && data[0].offre) {
        setOffre(data[0].offre)
      }

      // Récupérer les scores de matching pour tous les candidats
      const candidatsWithScores = await Promise.all(
        data.map(async (candidat: Candidat) => {
          try {
            const scoreResponse = await fetch(`http://127.0.0.1:8000/api/showMatchingScore/${candidat.id}`, {
              method: "GET",
              headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
              },
            })

            if (scoreResponse.ok) {
              const scoreData = await scoreResponse.json()
              return {
                ...candidat,
                matchingScore: scoreData.matching_score || 0,
              }
            }
            return { ...candidat, matchingScore: 0 }
          } catch (error) {
            console.error(`Erreur lors de la récupération du score pour le candidat ${candidat.id}:`, error)
            return { ...candidat, matchingScore: 0 }
          }
        }),
      )

      // Trier les candidats par score de matching décroissant
      const sortedCandidats = candidatsWithScores.sort((a, b) => b.matchingScore - a.matchingScore)

      setCandidats(sortedCandidats)
      setFilteredCandidats(sortedCandidats)
    } catch (error) {
      console.error("Erreur:", error)
      setError("Une erreur est survenue lors du chargement des candidats")
    } finally {
      setLoading(false)
    }
  }

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

    checkUserRole()
  }, [offre_id, router])

  const handleDeleteCandidat = async (candidatId: number, candidatNom: string, candidatPrenom: string) => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        throw new Error("Vous n'êtes pas connecté")
      }

      const response = await fetch(`http://127.0.0.1:8000/api/candidatSupp/${candidatId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du candidat")
      }

      setDeleteMessage(`Le candidat ${candidatPrenom} ${candidatNom} a été supprimé avec succès.`)

      // Recharger la liste des candidats
      fetchCandidats(token)

      // Effacer le message après 3 secondes
      setTimeout(() => {
        setDeleteMessage(null)
      }, 3000)
    } catch (error) {
      console.error("Erreur:", error)
      setDeleteMessage(error instanceof Error ? error.message : "Une erreur est survenue")
    }
  }

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
            {deleteMessage && (
              <div className="bg-green-50 text-green-800 p-3 rounded-md border border-green-200">{deleteMessage}</div>
            )}
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
                          <CandidatCard
                            key={candidat.id}
                            candidat={candidat}
                            offreId={Number(offre_id)}
                            handleDeleteCandidat={handleDeleteCandidat}
                          />
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

// Modifier le composant PersonalityRadarChart pour un design plus moderne
function PersonalityRadarChart({ scores }: { scores: TestResponse["scores"] }) {
  // Définir les traits et leurs valeurs
  const traits = [
    { name: "Ouverture", value: scores.ouverture },
    { name: "Conscience", value: scores.conscience },
    { name: "Extraversion", value: scores.extraversion },
    { name: "Agréabilité", value: scores.agreabilite },
    { name: "Stabilité", value: scores.stabilite },
  ]

  // Nombre de traits
  const numTraits = traits.length

  // Rayon du cercle
  const radius = 100
  // Centre du cercle
  const cx = 150
  const cy = 150

  // Calculer les coordonnées pour chaque trait
  const getCoordinates = (index: number, value: number) => {
    // Angle en radians (réparti uniformément autour du cercle)
    const angle = (Math.PI * 2 * index) / numTraits - Math.PI / 2
    // Coordonnées x et y (ajustées par la valeur du trait)
    const x = cx + ((radius * value) / 100) * Math.cos(angle)
    const y = cy + ((radius * value) / 100) * Math.sin(angle)
    return { x, y }
  }

  // Générer les points du polygone pour le radar
  const points = traits
    .map((trait, i) => {
      const { x, y } = getCoordinates(i, trait.value)
      return `${x},${y}`
    })
    .join(" ")

  // Générer les lignes de grille (cercles concentriques)
  const gridCircles = [20, 40, 60, 80, 100].map((percent, i) => {
    const gridRadius = (radius * percent) / 100
    return (
      <circle
        key={i}
        cx={cx}
        cy={cy}
        r={gridRadius}
        fill="none"
        stroke="#e5e7eb"
        strokeWidth="1"
        strokeDasharray="4,4"
        opacity="0.5"
      />
    )
  })

  // Générer les axes pour chaque trait
  const axes = traits.map((trait, i) => {
    const { x, y } = getCoordinates(i, 100)
    return <line key={i} x1={cx} y1={cy} x2={x} y2={y} stroke="#e5e7eb" strokeWidth="1" opacity="0.5" />
  })

  // Générer les labels pour chaque trait
  const labels = traits.map((trait, i) => {
    const { x, y } = getCoordinates(i, 120)
    // Ajuster la position du texte pour qu'il soit centré par rapport au point
    const textAnchor = x === cx ? "middle" : x > cx ? "start" : "end"
    const dy = y === cy ? "0" : y > cy ? "0.8em" : "-0.5em"

    return (
      <text key={i} x={x} y={y} textAnchor={textAnchor} dy={dy} fontSize="12" fill="#666" fontWeight="500">
        {trait.name}
      </text>
    )
  })

  // Générer les points pour chaque sommet du radar
  const dataPoints = traits.map((trait, i) => {
    const { x, y } = getCoordinates(i, trait.value)
    return <circle key={i} cx={x} cy={y} r="4" fill="#4f46e5" stroke="#fff" strokeWidth="1.5" />
  })

  // Générer les valeurs pour chaque trait
  const values = traits.map((trait, i) => {
    const { x, y } = getCoordinates(i, trait.value + 15)
    const textColor = trait.value >= 70 ? "#4f46e5" : trait.value >= 50 ? "#6366f1" : "#ef4444"
    return (
      <text key={i} x={x} y={y} textAnchor="middle" fontSize="11" fontWeight="bold" fill={textColor}>
        {trait.value}%
      </text>
    )
  })

  return (
    <div className="w-full flex justify-center">
      <svg width="300" height="300" viewBox="0 0 300 300">
        {/* Grille de fond */}
        {gridCircles}
        {axes}

        {/* Données du radar */}
        <polygon
          points={points}
          fill="#4f46e5"
          fillOpacity="0.15"
          stroke="#4f46e5"
          strokeWidth="2.5"
          strokeLinejoin="round"
        />

        {/* Points de données */}
        {dataPoints}

        {/* Labels des traits */}
        {labels}

        {/* Valeurs des traits */}
        {values}
      </svg>
    </div>
  )
}

// Modify the CandidatCard component to ensure all cards have the same height
function CandidatCard({
  candidat,
  offreId,
  handleDeleteCandidat,
}: {
  candidat: Candidat
  offreId: number
  handleDeleteCandidat: (candidatId: number, candidatNom: string, candidatPrenom: string) => Promise<void>
}) {
  const [matchingScore, setMatchingScore] = useState<MatchingScore | null>(null)
  const [loadingScore, setLoadingScore] = useState(false)
  const [testResponse, setTestResponse] = useState<TestResponse | null>(null)
  const [loadingTest, setLoadingTest] = useState(false)
  const [openQuestionIndex, setOpenQuestionIndex] = useState<number | null>(null)
  const [hasInterview, setHasInterview] = useState(false)
  const [checkingInterview, setCheckingInterview] = useState(false)

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

  // Check if candidate has an interview scheduled
  useEffect(() => {
    const checkInterview = async () => {
      try {
        setCheckingInterview(true)
        const token = sessionStorage.getItem("token")
        if (!token) return

        const response = await fetch(`http://127.0.0.1:8000/api/candidat/${candidat.id}/can-schedule`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (response.ok) {
          const data = await response.json()
          setHasInterview(!data.can_schedule)
        }
      } catch (error) {
        console.error("Erreur lors de la vérification de l'entretien:", error)
      } finally {
        setCheckingInterview(false)
      }
    }

    checkInterview()
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
                      {/* Scores par trait - Remplacé par le radar chart */}
                      <div className="space-y-3">
                        <h3 className="text-lg font-semibold">Scores par trait de personnalité</h3>

                        {/* Radar Chart */}
                        <PersonalityRadarChart scores={testResponse.scores} />

                        {/* Affichage des scores en badges (pour référence) */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 mt-4">
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

              {/* Afficher les badges statiques dans la carte */}
              <div className="mt-3 grid grid-cols-5 gap-2">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-600 mb-1">Ouverture</span>
                  <Badge
                    variant="outline"
                    className={`${getTraitScoreColor(testResponse.scores.ouverture)} px-2 py-1 rounded-full`}
                  >
                    {testResponse.scores.ouverture}%
                  </Badge>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-600 mb-1">Conscience</span>
                  <Badge
                    variant="outline"
                    className={`${getTraitScoreColor(testResponse.scores.conscience)} px-2 py-1 rounded-full`}
                  >
                    {testResponse.scores.conscience}%
                  </Badge>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-600 mb-1">Extraversion</span>
                  <Badge
                    variant="outline"
                    className={`${getTraitScoreColor(testResponse.scores.extraversion)} px-2 py-1 rounded-full`}
                  >
                    {testResponse.scores.extraversion}%
                  </Badge>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-600 mb-1">Agréabilité</span>
                  <Badge
                    variant="outline"
                    className={`${getTraitScoreColor(testResponse.scores.agreabilite)} px-2 py-1 rounded-full`}
                  >
                    {testResponse.scores.agreabilite}%
                  </Badge>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-600 mb-1">Stabilité</span>
                  <Badge
                    variant="outline"
                    className={`${getTraitScoreColor(testResponse.scores.stabilite)} px-2 py-1 rounded-full`}
                  >
                    {testResponse.scores.stabilite}%
                  </Badge>
                </div>
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

        {/* Boutons d'action */}
        <div className="flex gap-2 ml-auto">
          {/* Afficher un badge si le candidat a déjà un entretien */}
          {hasInterview ? (
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-100">
              Entretien déjà planifié
            </Badge>
          ) : (
            <>
              {/* Bouton Contacter */}
              <InterviewScheduler
                candidatId={candidat.id}
                candidatNom={candidat.nom}
                candidatPrenom={candidat.prenom}
                candidatEmail={candidat.email}
                offreId={offreId}
                offrePoste={candidat.offre.poste}
              />

              {/* Bouton Supprimer */}
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50">
                    <Trash2 className="h-4 w-4 mr-1" />
                    Supprimer
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirmer la suppression</DialogTitle>
                    <DialogDescription>
                      Êtes-vous sûr de vouloir supprimer la candidature de {candidat.prenom} {candidat.nom} ? Cette
                      action est irréversible.
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline">Annuler</Button>
                    <Button
                      variant="destructive"
                      onClick={() => handleDeleteCandidat(candidat.id, candidat.nom, candidat.prenom)}
                    >
                      Supprimer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </CardFooter>
    </Card>
  )
}
