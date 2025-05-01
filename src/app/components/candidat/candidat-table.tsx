"use client"
import { useState, useEffect } from "react"
import type React from "react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  Download,
  Archive,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  GraduationCap,
  Clock,
  X,
  ChevronLeft,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { useMediaQuery } from "@/app/hooks/use-media-query"

interface Offre {
  id: number
  departement: string
  domaine: string
  datePublication: string
  poste: string
}

interface Candidat {
  id: number
  nom: string
  prenom: string
  email: string
  pays: string
  ville: string
  codePostal: string
  niveauExperience: string
  tel: string
  niveauEtude: string
  cv: string
  offre_id: number
  offre: Offre
  offres?: Offre[] // Add this line
  created_at: string
}

export function CandidatsTable({ refresh }: { refresh: boolean }) {
  const router = useRouter()
  const [candidats, setCandidats] = useState<Candidat[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(null)
  const [selectedCandidatOffres, setSelectedCandidatOffres] = useState<Offre[]>([])
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [candidatToArchive, setCandidatToArchive] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [candidatToDelete, setCandidatToDelete] = useState<number | null>(null)
  const [selectedCandidats, setSelectedCandidats] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")
  const [isBulkDeleteDialogOpen, setIsBulkDeleteDialogOpen] = useState(false)
  const [isBulkArchiveDialogOpen, setIsBulkArchiveDialogOpen] = useState(false)
  const [loadingOffres, setLoadingOffres] = useState(false)

  // Modifier la fonction fetchCandidats pour mieux regrouper les candidats par email
  useEffect(() => {
    const fetchCandidats = async () => {
      try {
        const token = sessionStorage.getItem("token")
        if (!token) {
          setError("Vous devez être connecté pour voir les candidats.")
          return
        }

        const response = await fetch("http://127.0.0.1:8000/api/candidats-offre", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          if (response.status === 401) {
            sessionStorage.removeItem("token")
            router.push("/auth/login")
            return
          }
          throw new Error("Erreur de récupération des candidats")
        }

        const data = await response.json()
        console.log("Données brutes de l'API:", data)

        // Regrouper les candidats par email
        const candidatsMap = {}

        data.forEach((candidat) => {
          // S'assurer que l'offre est un objet complet
          const offreComplete = {
            id: candidat.offre?.id || candidat.offre_id,
            departement: candidat.offre?.departement || "",
            domaine: candidat.offre?.domaine || "",
            datePublication: candidat.offre?.datePublication || "",
            poste: candidat.offre?.poste || "Non spécifié",
          }

          if (!candidatsMap[candidat.email]) {
            // Premier candidat avec cet email - créer une nouvelle entrée
            candidatsMap[candidat.email] = {
              ...candidat,
              offres: [offreComplete],
            }
          } else {
            // Ajouter l'offre au candidat existant
            // Vérifier si l'offre existe déjà pour éviter les doublons
            const offreExiste = candidatsMap[candidat.email].offres.some((o) => o.id === offreComplete.id)

            if (!offreExiste) {
              candidatsMap[candidat.email].offres.push(offreComplete)
            }
          }
        })

        // Convertir l'objet en tableau
        const uniqueCandidats = Object.values(candidatsMap)
        console.log("Candidats regroupés:", uniqueCandidats)

        setCandidats(uniqueCandidats)
        setError(null)
      } catch (error) {
        console.error("Erreur de récupération des candidats:", error)
        setError("Erreur lors du chargement des candidats")
      } finally {
        setLoading(false)
      }
    }

    fetchCandidats()
  }, [refresh, router])

  // Nouvelle fonction pour récupérer toutes les offres d'un candidat par email
  const fetchOffresParCandidat = async (email: string) => {
    try {
      setLoadingOffres(true)
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour voir les offres.")
        return []
      }

      const response = await fetch(`http://127.0.0.1:8000/api/candidats/offres/${email}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        if (response.status === 404) {
          console.warn(`Aucune offre trouvée pour le candidat avec l'email ${email}`)
          return []
        }
        // throw new Error(`Erreur lors de la récupération des offres pour ${email}`)
      }

      const data = await response.json()
      console.log(`Offres pour ${email}:`, data)
      return data
    } catch (error) {
      console.error(`Erreur lors de la récupération des offres pour ${email}:`, error)
      return []
    } finally {
      setLoadingOffres(false)
    }
  }

  // Fonction pour ouvrir le dialogue d'archivage
  const openArchiveDialog = (candidatId: number) => {
    setCandidatToArchive(candidatId)
    setIsArchiveDialogOpen(true)
  }

  // Fonction pour archiver un candidat
  const archiveCandidat = async () => {
    if (!candidatToArchive) return

    const token = sessionStorage.getItem("token")
    if (!token) {
      setError("Vous devez être connecté pour archiver un candidat.")
      return
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/candidats/archiver/${candidatToArchive}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'archivage du candidat")
      }

      // Mettre à jour l'état pour retirer le candidat du tableau
      setCandidats((prevCandidats) => prevCandidats.filter((candidat) => candidat.id !== candidatToArchive))
      setIsArchiveDialogOpen(false)
      setCandidatToArchive(null)
    } catch (error) {
      setError("Erreur lors de l'archivage du candidat.")
    }
  }

  // Fonction pour ouvrir le dialogue de suppression
  const openDeleteDialog = (candidatId: number, e: React.MouseEvent) => {
    e.stopPropagation()
    setCandidatToDelete(candidatId)
    setIsDeleteDialogOpen(true)
  }

  // Fonction pour supprimer un candidat
  const deleteCandidat = async () => {
    if (!candidatToDelete) return

    const token = sessionStorage.getItem("token")
    if (!token) {
      setError("Vous devez être connecté pour supprimer un candidat.")
      return
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/candidatSupp/${candidatToDelete}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du candidat")
      }

      // Mettre à jour l'état pour retirer le candidat du tableau
      setCandidats((prevCandidats) => prevCandidats.filter((candidat) => candidat.id !== candidatToDelete))
      setIsDeleteDialogOpen(false)
      setCandidatToDelete(null)
    } catch (error) {
      setError("Erreur lors de la suppression du candidat.")
    }
  }

  // Fonction pour gérer la sélection d'un candidat
  const handleSelectCandidat = (candidatId: number, isChecked: boolean) => {
    if (isChecked) {
      setSelectedCandidats((prev) => [...prev, candidatId])
    } else {
      setSelectedCandidats((prev) => prev.filter((id) => id !== candidatId))
    }
  }

  // Fonction pour gérer la sélection de tous les candidats
  const handleSelectAll = (isChecked: boolean) => {
    setSelectAll(isChecked)
    if (isChecked) {
      setSelectedCandidats(candidats.map((candidat) => candidat.id))
    } else {
      setSelectedCandidats([])
    }
  }

  // Fonction pour supprimer les candidats sélectionnés
  const deleteSelectedCandidats = async () => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      setError("Vous devez être connecté pour supprimer des candidats.")
      return
    }

    try {
      // Créer un tableau de promesses pour chaque suppression
      const deletePromises = selectedCandidats.map((candidatId) =>
        fetch(`http://127.0.0.1:8000/api/candidatSupp/${candidatId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      )

      // Attendre que toutes les suppressions soient terminées
      await Promise.all(deletePromises)

      // Mettre à jour l'état pour retirer les candidats supprimés
      setCandidats((prevCandidats) => prevCandidats.filter((candidat) => !selectedCandidats.includes(candidat.id)))

      // Réinitialiser les sélections
      setSelectedCandidats([])
      setSelectAll(false)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      setError("Erreur lors de la suppression des candidats.")
    }
  }

  // Fonction pour marquer les candidats sélectionnés
  const archiveSelectedCandidats = async () => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      setError("Vous devez être connecté pour marquer des candidats.")
      return
    }

    try {
      // Créer un tableau de promesses pour chaque archivage
      const archivePromises = selectedCandidats.map((candidatId) =>
        fetch(`http://127.0.0.1:8000/api/candidats/archiver/${candidatId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      )

      // Attendre que tous les archivages soient terminées
      await Promise.all(archivePromises)

      // Mettre à jour l'état pour retirer les candidats archivés
      setCandidats((prevCandidats) => prevCandidats.filter((candidat) => !selectedCandidats.includes(candidat.id)))

      // Réinitialiser les sélections
      setSelectedCandidats([])
      setSelectAll(false)
      setIsArchiveDialogOpen(false)
    } catch (error) {
      setError("Erreur lors du marquage des candidats.")
    }
  }

  // Fonction pour afficher les détails d'un candidat
  const handleViewDetails = async (candidat: Candidat) => {
    setSelectedCandidat(candidat)
    setIsDetailsOpen(true)

    // Récupérer toutes les offres pour ce candidat
    const offres = await fetchOffresParCandidat(candidat.email)
    setSelectedCandidatOffres(offres)
  }

  // Fonction pour télécharger le CV
  const handleDownloadCV = (cvUrl: string) => {
    window.open(cvUrl, "_blank")
  }

  // Fonction pour obtenir les initiales
  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  // Fonction pour obtenir une couleur basée sur le nom
  const getColorClass = (nom: string) => {
    const colors = [
      "bg-blue-500",
      "bg-emerald-500",
      "bg-violet-500",
      "bg-amber-500",
      "bg-rose-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-pink-500",
    ]
    const index = nom.charCodeAt(0) % colors.length
    return colors[index]
  }

  // Fonction pour ouvrir Gmail avec l'adresse email
  const openGmail = (email: string) => {
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, "_blank")
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )

  if (error)
    return (
      <div className="p-6 text-center">
        <div className="text-red-500 text-lg font-medium">{error}</div>
      </div>
    )

  return (
    <>
      {/* Barre d'actions pour les opérations groupées */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="select-all"
            checked={selectAll}
            onChange={(e) => handleSelectAll(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
          />
          <label htmlFor="select-all" className="text-sm font-medium">
            Sélectionner tout ({candidats.length})
          </label>
        </div>

        {selectedCandidats.length > 0 && (
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">{selectedCandidats.length} candidat(s) sélectionné(s)</span>
            <Button variant="outline" size="sm" onClick={() => setIsBulkArchiveDialogOpen(true)}>
              <Archive className="mr-2 h-4 w-4" />
              Marquer
            </Button>
            <Button variant="destructive" size="sm" onClick={() => setIsBulkDeleteDialogOpen(true)}>
              <X className="mr-2 h-4 w-4" />
              Supprimer
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {candidats.map((candidat) => (
          <Card
            key={candidat.id}
            className="overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full"
          >
            <CardHeader className="pb-2 px-4 sm:px-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3 sm:space-x-4">
                  <div className="relative flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedCandidats.includes(candidat.id)}
                      onChange={(e) => handleSelectCandidat(candidat.id, e.target.checked)}
                      onClick={(e) => e.stopPropagation()}
                      className="absolute top-0 left-0 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary z-10"
                    />
                    <Avatar className={`h-10 w-10 sm:h-12 sm:w-12 ${getColorClass(candidat.nom)}`}>
                      <AvatarFallback className="text-white font-medium">
                        {getInitials(candidat.nom, candidat.prenom)}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-semibold text-base sm:text-lg leading-none tracking-tight truncate max-w-[180px] sm:max-w-none">
                      {candidat.prenom} {candidat.nom}
                    </h3>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <Briefcase className="mr-1 h-3 w-3" />
                        <span className="font-medium">Offres ({candidat.offres?.length || 1}):</span>
                      </div>
                      <div className="pl-4 space-y-1">
                        {(candidat.offres || [candidat.offre]).slice(0, 2).map((offer, idx) => (
                          <div key={idx} className="text-xs text-muted-foreground truncate max-w-[180px] sm:max-w-none">
                            • {offer.poste || "Non spécifié"}
                          </div>
                        ))}
                        {candidat.offres?.length > 2 && (
                          <div className="text-xs text-muted-foreground">
                            • et {candidat.offres.length - 2} autre(s)...
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 rounded-full"
                  onClick={(e) => openDeleteDialog(candidat.id, e)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="pb-2 px-4 sm:px-6 flex-grow">
              <div className="grid gap-2 text-xs sm:text-sm">
                <div className="flex items-center">
                  <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      openGmail(candidat.email)
                    }}
                    className="text-blue-600 hover:underline truncate"
                  >
                    {candidat.email}
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{candidat.tel}</span>
                </div>
                <div className="flex items-center">
                  <MapPin className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">
                    {candidat.ville}, {candidat.pays}
                  </span>
                </div>
                <div className="flex items-center">
                  <GraduationCap className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{candidat.niveauEtude}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                  <span className="truncate">{candidat.niveauExperience}</span>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1 sm:gap-2">
                <Badge variant="outline" className="bg-blue-50 text-xs">
                  {candidat.offre?.departement}
                </Badge>
                <Badge variant="outline" className="bg-emerald-50 text-xs">
                  {candidat.offre?.domaine}
                </Badge>
                <Badge variant="outline" className="bg-amber-50 text-xs">
                  <Calendar className="mr-1 h-2 w-2 sm:h-3 sm:w-3" />
                  {new Date(candidat.created_at).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2 px-4 sm:px-6 mt-auto">
              {isMobile ? (
                <div className="flex w-full gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 px-2"
                    onClick={() => handleViewDetails(candidat)}
                  >
                    <Eye className="h-3 w-3 sm:mr-2" />
                    <span className="hidden sm:inline">Détails</span>
                  </Button>
                  {candidat.cv && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 px-2"
                      onClick={() => handleDownloadCV(candidat.cv)}
                    >
                      <Download className="h-3 w-3 sm:mr-2" />
                      <span className="hidden sm:inline">CV</span>
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 px-2"
                    onClick={() => openArchiveDialog(candidat.id)}
                  >
                    <Archive className="h-3 w-3 sm:mr-2" />
                    <span className="hidden sm:inline">Archiver</span>
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="outline" size="sm" onClick={() => handleViewDetails(candidat)}>
                    <Eye className="mr-2 h-4 w-4" />
                    Détails
                  </Button>
                  <div className="flex gap-2">
                    {candidat.cv && (
                      <Button variant="outline" size="sm" onClick={() => handleDownloadCV(candidat.cv)}>
                        <Download className="mr-2 h-4 w-4" />
                        CV
                      </Button>
                    )}
                    <Button variant="outline" size="sm" onClick={() => openArchiveDialog(candidat.id)}>
                      <Archive className="mr-2 h-4 w-4" />
                      Marquer
                    </Button>
                  </div>
                </>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {candidats.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">Aucun candidat trouvé</div>
        </div>
      )}

      {/* Mobile-friendly Details Modal */}
      {selectedCandidat && isDetailsOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isMobile ? "p-0" : "p-4"}`}
        >
          <div
            className={`bg-white rounded-lg shadow-lg overflow-y-auto ${isMobile ? "w-full h-full" : "max-w-2xl w-full max-h-[80vh]"}`}
          >
            {/* Mobile Header */}
            {isMobile && (
              <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setIsDetailsOpen(false)}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold">Détails du candidat</h2>
                <Button variant="ghost" size="sm" onClick={() => setIsDetailsOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div className={`${isMobile ? "p-4" : "p-6"}`}>
              {!isMobile && (
                <div className="flex justify-end mb-2">
                  <Button variant="ghost" size="sm" onClick={() => setIsDetailsOpen(false)}>
                    <X className="h-5 w-5" />
                  </Button>
                </div>
              )}

              <div className="flex items-center space-x-4 mb-6">
                <Avatar className={`${isMobile ? "h-12 w-12" : "h-16 w-16"} ${getColorClass(selectedCandidat.nom)}`}>
                  <AvatarFallback className="text-white text-xl font-medium">
                    {getInitials(selectedCandidat.nom, selectedCandidat.prenom)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className={`${isMobile ? "text-xl" : "text-2xl"} font-bold`}>
                    {selectedCandidat.prenom} {selectedCandidat.nom}
                  </h2>
                  <p className="text-muted-foreground flex items-center text-sm">
                    <Briefcase className="mr-1 h-4 w-4" />
                    <span className="truncate">
                      {selectedCandidat.offre?.poste} • {selectedCandidat.offre?.departement}
                    </span>
                  </p>
                </div>
              </div>

              <div className={`grid grid-cols-1 ${isMobile ? "gap-4" : "md:grid-cols-2 gap-6"} mb-6`}>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Informations personnelles</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <Mail className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Email</p>
                        <a
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            openGmail(selectedCandidat.email)
                          }}
                          className="text-blue-600 hover:underline break-all"
                        >
                          {selectedCandidat.email}
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Phone className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Téléphone</p>
                        <p>{selectedCandidat.tel}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Adresse</p>
                        <p>
                          {selectedCandidat.ville}, {selectedCandidat.codePostal}
                        </p>
                        <p>{selectedCandidat.pays}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold border-b pb-2">Informations professionnelles</h3>
                  <div className="space-y-3">
                    <div className="flex items-start">
                      <GraduationCap className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Niveau d'étude</p>
                        <p>{selectedCandidat.niveauEtude}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Expérience</p>
                        <p>{selectedCandidat.niveauExperience}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Calendar className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Dates</p>
                        <p>Candidature: {new Date(selectedCandidat.created_at).toLocaleDateString("fr-FR")}</p>
                        <p>
                          Publication: {new Date(selectedCandidat.offre?.datePublication).toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Modifier la section qui affiche les offres dans la fenêtre modale */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">
                  Offres postulées ({selectedCandidatOffres.length || selectedCandidat.offres?.length || 1})
                </h3>

                {loadingOffres ? (
                  <div className="flex justify-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(selectedCandidatOffres.length > 0
                      ? selectedCandidatOffres
                      : selectedCandidat.offres || [selectedCandidat.offre]
                    ).map((offre, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        className="w-full p-3 h-auto flex flex-col items-start"
                        onClick={() => router.push(`/candidat-offre/${offre.id}`)}
                      >
                        <div className="flex justify-between items-center w-full mb-1">
                          <div className="font-medium">{offre.poste || "Non spécifié"}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm w-full">
                          <div className="text-muted-foreground col-span-2 text-left">
                            Publication:{" "}
                            {offre.datePublication
                              ? new Date(offre.datePublication).toLocaleDateString("fr-FR")
                              : "Non spécifié"}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                )}
              </div>

              {selectedCandidat.cv && (
                <div className="mt-6">
                  <Button onClick={() => handleDownloadCV(selectedCandidat.cv)} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le CV
                  </Button>
                </div>
              )}

              {!isMobile && (
                <div className="flex justify-end mt-6">
                  <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                    Fermer
                  </Button>
                </div>
              )}
            </div>

            {/* Mobile Footer */}
            {isMobile && (
              <div className="sticky bottom-0 border-t bg-white p-4">
                <Button variant="default" onClick={() => setIsDetailsOpen(false)} className="w-full">
                  Fermer
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Archive Confirmation Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent className={`${isMobile ? "w-[90%] max-w-none" : "sm:max-w-md"}`}>
          <DialogHeader>
            <DialogTitle>Marquer le candidat</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir marquer ce candidat ?</DialogDescription>
          </DialogHeader>
          <DialogFooter className={`${isMobile ? "flex-col space-y-2" : "flex space-x-2 justify-end"}`}>
            <Button
              variant="outline"
              onClick={() => setIsArchiveDialogOpen(false)}
              className={isMobile ? "w-full" : ""}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={archiveCandidat} className={isMobile ? "w-full" : ""}>
              Marquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className={`${isMobile ? "w-[90%] max-w-none" : "sm:max-w-md"}`}>
          <DialogHeader>
            <DialogTitle>Supprimer le candidat</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir supprimer définitivement ce candidat ?</DialogDescription>
          </DialogHeader>
          <DialogFooter className={`${isMobile ? "flex-col space-y-2" : "flex space-x-2 justify-end"}`}>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} className={isMobile ? "w-full" : ""}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={deleteCandidat} className={isMobile ? "w-full" : ""}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Delete Confirmation Dialog */}
      <Dialog open={isBulkDeleteDialogOpen} onOpenChange={setIsBulkDeleteDialogOpen}>
        <DialogContent className={`${isMobile ? "w-[90%] max-w-none" : "sm:max-w-md"}`}>
          <DialogHeader>
            <DialogTitle>Supprimer les candidats sélectionnés</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer définitivement les {selectedCandidats.length} candidats sélectionnés ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={`${isMobile ? "flex-col space-y-2" : "flex space-x-2 justify-end"}`}>
            <Button
              variant="outline"
              onClick={() => setIsBulkDeleteDialogOpen(false)}
              className={isMobile ? "w-full" : ""}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={deleteSelectedCandidats} className={isMobile ? "w-full" : ""}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Bulk Archive Confirmation Dialog */}
      <Dialog open={isBulkArchiveDialogOpen} onOpenChange={setIsBulkArchiveDialogOpen}>
        <DialogContent className={`${isMobile ? "w-[90%] max-w-none" : "sm:max-w-md"}`}>
          <DialogHeader>
            <DialogTitle>Marquer les candidats sélectionnés</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir marquer les {selectedCandidats.length} candidats sélectionnés ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={`${isMobile ? "flex-col space-y-2" : "flex space-x-2 justify-end"}`}>
            <Button
              variant="outline"
              onClick={() => setIsBulkArchiveDialogOpen(false)}
              className={isMobile ? "w-full" : ""}
            >
              Annuler
            </Button>
            <Button variant="destructive" onClick={archiveSelectedCandidats} className={isMobile ? "w-full" : ""}>
              Marquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
