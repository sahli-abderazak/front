"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Eye,
  Download,
  Undo,
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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { useMediaQuery } from "@/app/hooks/use-media-query"

// Modifier la définition de l'interface Candidat pour inclure l'offre directement
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
  cv?: string
  offre_id: number
  archived: boolean
  created_at: string
  offre?: {
    id: number
    departement: string
    poste: string
    domaine: string
    datePublication: string
  }
}

interface Offre {
  id: number
  departement: string
  poste: string
  domaine: string
  date_publication: string
}

interface ArchiveCandidatsTableProps {
  refresh: boolean
}

const ArchiveCandidatsTable: React.FC<ArchiveCandidatsTableProps> = ({ refresh }) => {
  const router = useRouter()
  const [candidats, setCandidats] = useState<Candidat[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [unarchiving, setUnarchiving] = useState<number | null>(null)
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isUnarchiveDialogOpen, setIsUnarchiveDialogOpen] = useState(false)
  const [candidatToUnarchive, setCandidatToUnarchive] = useState<number | null>(null)
  const [selectedCandidats, setSelectedCandidats] = useState<number[]>([])
  const [selectAll, setSelectAll] = useState(false)
  const [isBulkUnarchiveDialogOpen, setIsBulkUnarchiveDialogOpen] = useState(false)
  const isMobile = useMediaQuery("(max-width: 640px)")

  useEffect(() => {
    fetchArchivedCandidats()
  }, [refresh])

  const fetchArchivedCandidats = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour voir les candidats.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/candidats_archived_societe", {
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
        throw new Error("Erreur de récupération des candidats archivés")
      }

      const data = await response.json()
      setCandidats(data)
      setError(null)
    } catch (error) {
      console.error("Erreur de récupération des candidats archivés:", error)
      setError("Erreur lors du chargement des candidats")
    } finally {
      setLoading(false)
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

  // Fonction pour désarchiver les candidats sélectionnés
  const unarchiveSelectedCandidats = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour désarchiver des candidats.")
        return
      }

      // Créer un tableau de promesses pour chaque désarchivage
      const unarchivePromises = selectedCandidats.map((candidatId) =>
        fetch(`http://127.0.0.1:8000/api/candidats_desarchiver/${candidatId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      )

      // Attendre que tous les désarchivages soient terminés
      await Promise.all(unarchivePromises)

      // Mettre à jour l'état pour retirer les candidats désarchivés
      setCandidats((prevCandidats) => prevCandidats.filter((candidat) => !selectedCandidats.includes(candidat.id)))

      // Réinitialiser les sélections
      setSelectedCandidats([])
      setSelectAll(false)
      setIsBulkUnarchiveDialogOpen(false)
    } catch (error) {
      console.error("Erreur de désarchivation en masse:", error)
      setError("Erreur lors de la désarchivation des candidats.")
    }
  }

  const handleUnarchive = async (candidatId: number) => {
    setCandidatToUnarchive(candidatId)
    setIsUnarchiveDialogOpen(true)
  }

  const confirmUnarchive = async () => {
    if (!candidatToUnarchive) return

    setUnarchiving(candidatToUnarchive)
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour désarchiver un candidat.")
        return
      }

      // Utiliser le bon endpoint API pour désarchiver
      const response = await fetch(`http://127.0.0.1:8000/api/candidats_desarchiver/${candidatToUnarchive}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la désarchivation du candidat")
      }

      setCandidats(candidats.filter((candidat) => candidat.id !== candidatToUnarchive))
      setIsUnarchiveDialogOpen(false)
      setCandidatToUnarchive(null)
    } catch (error) {
      console.error("Erreur de désarchivation:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de la désarchivation du candidat")
    } finally {
      setUnarchiving(null)
    }
  }

  // Fonction pour afficher les détails d'un candidat
  const handleViewDetails = (candidat: Candidat) => {
    setSelectedCandidat(candidat)
    setIsDetailsOpen(true)
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
            <Button variant="outline" size="sm" onClick={() => setIsBulkUnarchiveDialogOpen(true)}>
              <Undo className="mr-2 h-4 w-4" />
              Démarquer
            </Button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {candidats.map((candidat) => {
          const offre = candidat.offre
          return (
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
                      <div className="flex items-center text-xs sm:text-sm text-muted-foreground">
                        <Briefcase className="mr-1 h-3 w-3" />
                        <span className="truncate max-w-[180px] sm:max-w-none">{offre?.poste || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2 px-4 sm:px-6 flex-grow">
                <div className="grid gap-2 text-xs sm:text-sm">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground flex-shrink-0" />
                    <a href={`mailto:${candidat.email}`} className="text-blue-600 hover:underline truncate">
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
                  {candidat.offre && (
                    <>
                      <Badge variant="outline" className="bg-blue-50 text-xs">
                        {candidat.offre.departement}
                      </Badge>
                      <Badge variant="outline" className="bg-emerald-50 text-xs">
                        {candidat.offre.domaine}
                      </Badge>
                    </>
                  )}
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
                      onClick={() => handleUnarchive(candidat.id)}
                      disabled={unarchiving === candidat.id}
                    >
                      <Undo className="h-3 w-3 sm:mr-2" />
                      <span className="hidden sm:inline">{unarchiving === candidat.id ? "..." : "Démarquer"}</span>
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
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnarchive(candidat.id)}
                        disabled={unarchiving === candidat.id}
                      >
                        <Undo className="mr-2 h-4 w-4" />
                        {unarchiving === candidat.id ? "Désarchivage..." : "Démarquer"}
                      </Button>
                    </div>
                  </>
                )}
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {candidats.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">Aucun candidat archivé trouvé</div>
        </div>
      )}

      {/* Mobile-friendly Details Modal */}
      {selectedCandidat && isDetailsOpen && (
        <div
          className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 ${isMobile ? "p-0" : "p-4"}`}
        >
          <div
            className={`bg-white rounded-lg shadow-lg overflow-y-auto ${isMobile ? "w-full h-full" : "max-w-3xl w-full max-h-[80vh]"}`}
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
                <div className="flex justify-between mb-2">
                  <h2 className="text-xl font-semibold">Détails du candidat</h2>
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
                      {selectedCandidat.offre?.poste || "N/A"} • {selectedCandidat.offre?.departement || "N/A"}
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
                          href={`mailto:${selectedCandidat.email}`}
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
                        <p>
                          Candidature:{" "}
                          {selectedCandidat.created_at
                            ? new Date(selectedCandidat.created_at).toLocaleDateString("fr-FR")
                            : "N/A"}
                        </p>
                        {selectedCandidat.offre?.datePublication && (
                          <p>
                            Publication: {new Date(selectedCandidat.offre.datePublication).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Détails de l'offre</h3>
                {selectedCandidat.offre ? (
                  <div className={`grid ${isMobile ? "grid-cols-1 gap-3" : "grid-cols-2 gap-4"}`}>
                    <div>
                      <p className="font-medium">Poste</p>
                      <p>{selectedCandidat.offre.poste}</p>
                    </div>
                    <div>
                      <p className="font-medium">Département</p>
                      <p>{selectedCandidat.offre.departement}</p>
                    </div>
                    <div>
                      <p className="font-medium">Domaine</p>
                      <p>{selectedCandidat.offre.domaine}</p>
                    </div>
                  </div>
                ) : (
                  <div className="text-muted-foreground">Informations de l'offre non disponibles</div>
                )}
              </div>

              {!isMobile && (
                <div className="flex justify-between mt-6">
                  {selectedCandidat.cv && (
                    <Button onClick={() => handleDownloadCV(selectedCandidat.cv)}>
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger le CV
                    </Button>
                  )}

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleUnarchive(selectedCandidat.id)}
                      disabled={unarchiving === selectedCandidat.id}
                    >
                      <Undo className="mr-2 h-4 w-4" />
                      {unarchiving === selectedCandidat.id ? "Désarchivage..." : "Démarquer"}
                    </Button>
                    <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                      Fermer
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Footer */}
            {isMobile && (
              <div className="sticky bottom-0 border-t bg-white p-4 space-y-2">
                {selectedCandidat.cv && (
                  <Button onClick={() => handleDownloadCV(selectedCandidat.cv)} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le CV
                  </Button>
                )}
                <Button
                  onClick={() => handleUnarchive(selectedCandidat.id)}
                  disabled={unarchiving === selectedCandidat.id}
                  className="w-full"
                >
                  <Undo className="mr-2 h-4 w-4" />
                  {unarchiving === selectedCandidat.id ? "Désarchivage..." : "Démarquer"}
                </Button>
                <Button variant="outline" onClick={() => setIsDetailsOpen(false)} className="w-full">
                  Fermer
                </Button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Dialog de confirmation de désarchivage */}
      <Dialog open={isUnarchiveDialogOpen} onOpenChange={setIsUnarchiveDialogOpen}>
        <DialogContent className={`${isMobile ? "w-[90%] max-w-none" : "sm:max-w-md"}`}>
          <DialogHeader>
            <DialogTitle>Confirmation de désarchivage</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir désarchiver ce candidat ?</DialogDescription>
          </DialogHeader>
          <DialogFooter className={`${isMobile ? "flex-col space-y-2 mt-4" : "flex justify-end gap-3 mt-4"}`}>
            <Button
              variant="outline"
              onClick={() => setIsUnarchiveDialogOpen(false)}
              className={isMobile ? "w-full" : ""}
            >
              Annuler
            </Button>
            <Button
              onClick={confirmUnarchive}
              disabled={unarchiving === candidatToUnarchive}
              className={isMobile ? "w-full" : ""}
            >
              <Undo className="mr-2 h-4 w-4" />
              {unarchiving === candidatToUnarchive ? "Désarchivage..." : "Démarquer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* Bulk Unarchive Confirmation Dialog */}
      <Dialog open={isBulkUnarchiveDialogOpen} onOpenChange={setIsBulkUnarchiveDialogOpen}>
        <DialogContent className={`${isMobile ? "w-[90%] max-w-none" : "sm:max-w-md"}`}>
          <DialogHeader>
            <DialogTitle>Démarquer les candidats sélectionnés</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir démarquer les {selectedCandidats.length} candidats sélectionnés ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className={`${isMobile ? "flex-col space-y-2" : "flex space-x-2 justify-end"}`}>
            <Button
              variant="outline"
              onClick={() => setIsBulkUnarchiveDialogOpen(false)}
              className={isMobile ? "w-full" : ""}
            >
              Annuler
            </Button>
            <Button variant="default" onClick={unarchiveSelectedCandidats} className={isMobile ? "w-full" : ""}>
              Démarquer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ArchiveCandidatsTable