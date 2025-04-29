"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Pencil,
  Trash,
  Calendar,
  Clock,
  ChevronDown,
  ChevronUp,
  MoreHorizontal,
  CheckSquare,
  Square,
  Loader2,
  Sliders,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { OffreEditDialog } from "./offre-edit-dialog"
import { useMediaQuery } from "@/app/hooks/use-media-query"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Checkbox } from "@/components/ui/checkbox"

interface Offre {
  id: number
  domaine: string
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
  typePoste: string
  typeTravail: string
  heureTravail: string
  niveauExperience: string
  niveauEtude: string
  responsabilite: string
  experience: string
  valider: boolean
  matching?: number
  poids_ouverture?: number
  poids_conscience?: number
  poids_extraversion?: number
  poids_agreabilite?: number
  poids_stabilite?: number
}

function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}) {
  const isMobile = useMediaQuery("(max-width: 640px)")

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={isMobile ? "w-[95%] max-w-none p-4" : ""}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <DialogDescription>{message}</DialogDescription>
        <DialogFooter className={isMobile ? "flex-col space-y-2" : ""}>
          <Button variant="outline" onClick={onClose} className={isMobile ? "w-full" : ""}>
            Annuler
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className={isMobile ? "w-full" : ""}
          >
            <Trash className="w-4 h-4 mr-2" />
            Supprimer
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function OffreTable({
  refresh,
  selectMode = false,
  selectedOffers = [],
  toggleOfferSelection = () => {},
  setOffres = () => {},
}: {
  refresh: boolean
  selectMode?: boolean
  selectedOffers?: number[]
  toggleOfferSelection?: (id: number) => void
  setOffres?: (offres: Offre[]) => void
}) {
  const router = useRouter()
  const [offres, setOffresLocal] = useState<Offre[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expandedOffre, setExpandedOffre] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<Record<number, string>>({})
  const isMobile = useMediaQuery("(max-width: 640px)")
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false)
  const [batchActionLoading, setBatchActionLoading] = useState(false)

  const fetchOffres = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour voir les offres.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/offres-societe", {
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
        throw new Error("Erreur de récupération des offres")
      }

      const data = await response.json()

      // Fetch matching data for each offer
      try {
        const matchingPromises = data.map(async (offre: Offre) => {
          const matchingResponse = await fetch(`http://127.0.0.1:8000/api/offre-matching/${offre.id}`, {
            method: "GET",
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          })

          if (matchingResponse.ok) {
            const matchingData = await matchingResponse.json()
            offre.matching = matchingData.matching || 0
          }
          return offre
        })

        const offresWithMatching = await Promise.all(matchingPromises)
        setOffresLocal(offresWithMatching)
        setOffres(offresWithMatching)
      } catch (error) {
        console.error("Erreur lors de la récupération des données de matching:", error)
        setOffresLocal(data)
        setOffres(data)
      }

      // Initialize active tab for each offre
      const initialTabs: Record<number, string> = {}
      data.forEach((offre: Offre) => {
        initialTabs[offre.id] = "details"
      })
      setActiveTab(initialTabs)

      setError(null)
    } catch (error) {
      console.error("Erreur de récupération des offres:", error)
      setError("Erreur lors du chargement des offres")
    } finally {
      setLoading(false)
    }
  }, [router, setOffres])

  useEffect(() => {
    fetchOffres()
  }, [fetchOffres, refresh])

  const handleDeleteClick = (offre: Offre) => {
    setSelectedOffre(offre)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedOffre) return

    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour supprimer une offre.")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/supprimerOffre/${selectedOffre.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression de l'offre")
      }

      fetchOffres()
    } catch (error) {
      console.error("Erreur lors de la suppression:", error)
    } finally {
      setIsDeleteDialogOpen(false)
      setSelectedOffre(null)
    }
  }

  const toggleExpand = (offreId: number) => {
    setExpandedOffre(expandedOffre === offreId ? null : offreId)
  }

  const handleTabChange = (offreId: number, tab: string) => {
    setActiveTab((prev) => ({
      ...prev,
      [offreId]: tab,
    }))
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR")
  }

  // Select all offers
  const selectAllOffers = () => {
    const allOfferIds = offres.map((offre) => offre.id)
    allOfferIds.forEach((id) => {
      if (!selectedOffers.includes(id)) {
        toggleOfferSelection(id)
      }
    })
  }

  // Deselect all offers
  const deselectAllOffers = () => {
    const currentTabOfferIds = offres.map((offre) => offre.id)
    currentTabOfferIds.forEach((id) => {
      if (selectedOffers.includes(id)) {
        toggleOfferSelection(id)
      }
    })
  }

  // Delete selected offers
  const deleteSelectedOffers = () => {
    if (selectedOffers.length > 0) {
      setIsBatchDeleteDialogOpen(true)
    }
  }

  // Confirm batch deletion
  const confirmBatchDelete = async () => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      setIsBatchDeleteDialogOpen(false)
      setError("Vous devez être connecté pour supprimer des offres.")
      return
    }

    setBatchActionLoading(true)

    try {
      // Créer une copie des IDs sélectionnés avant de les supprimer
      const offersToDelete = [...selectedOffers]

      // Supprimer chaque offre sélectionnée en parallèle
      const deletePromises = offersToDelete.map((offreId) =>
        fetch(`http://127.0.0.1:8000/api/supprimerOffre/${offreId}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      )

      // Attendre que TOUTES les requêtes soient terminées en même temps
      await Promise.all(deletePromises)
        .then(() => {
          console.log("Toutes les offres ont été supprimées avec succès")

          // Mettre à jour l'interface APRÈS la suppression réussie
          setOffresLocal((prev) => prev.filter((offre) => !offersToDelete.includes(offre.id)))
          setOffres((prevOffres) => prevOffres.filter((offre) => !offersToDelete.includes(offre.id)))

          // Réinitialiser la sélection via la fonction parent
          offersToDelete.forEach((id) => {
            if (selectedOffers.includes(id)) {
              toggleOfferSelection(id)
            }
          })
        })
        .catch((error) => {
          console.error("Erreur lors de la suppression de certaines offres:", error)
          setError("Une erreur est survenue lors de la suppression des offres.")
        })
    } catch (error) {
      console.error("Erreur lors de la suppression des offres:", error)
      setError("Une erreur est survenue lors de la suppression des offres.")
    } finally {
      setBatchActionLoading(false)
      setIsBatchDeleteDialogOpen(false)
    }
  }

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )

  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>

  return (
    <div className="space-y-4">
      {/* Barre d'actions pour la sélection par lot */}
      {selectMode && offres.length > 0 && (
        <div className="batch-actions mb-4 flex flex-wrap gap-2 p-3 bg-gray-50 rounded-md border">
          <Button
            variant="outline"
            size="sm"
            onClick={selectAllOffers}
            className="whitespace-nowrap text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <CheckSquare className="h-4 w-4 mr-2" />
            Tout sélectionner
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={deselectAllOffers}
            className="whitespace-nowrap text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Square className="h-4 w-4 mr-2" />
            Tout désélectionner
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={deleteSelectedOffers}
            disabled={selectedOffers.length === 0}
            className="whitespace-nowrap text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash className="h-4 w-4 mr-2" />
            Supprimer ({selectedOffers.length})
          </Button>
        </div>
      )}

      {offres.map((offre) => (
        <Card key={offre.id} className={`${offre.valider ? "border-green-200" : "border-yellow-200"} relative`}>
          {selectMode && (
            <div className="absolute top-4 left-4 z-10">
              <Checkbox
                checked={selectedOffers.includes(offre.id)}
                onCheckedChange={() => toggleOfferSelection(offre.id)}
                className="h-5 w-5 border-2 border-gray-300 bg-white data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
              />
            </div>
          )}
          <CardHeader className={`p-3 sm:p-4`}>
            <div className={`${selectMode ? "pl-10" : ""}`}>
              <div className="flex flex-col space-y-3 sm:space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex flex-wrap gap-1 sm:gap-2">
                    <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs sm:text-sm">
                      {offre.domaine}
                    </Badge>
                    <Badge
                      variant="secondary"
                      className={`text-xs sm:text-sm ${offre.valider ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}`}
                    >
                      {offre.valider ? "Validée" : "En attente"}
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <h3 className="text-base sm:text-lg font-semibold truncate max-w-[200px] sm:max-w-none">
                    {offre.poste}
                  </h3>

                  {isMobile ? (
                    <div className="flex items-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpand(offre.id)}
                        className="h-8 w-8 p-0 mr-1"
                      >
                        {expandedOffre === offre.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedOffre(offre)
                              setIsEditOpen(true)
                            }}
                          >
                            <Pencil className="h-4 w-4 mr-2" />
                            Modifier
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDeleteClick(offre)} className="text-red-600">
                            <Trash className="h-4 w-4 mr-2" />
                            Supprimer
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedOffre(offre)
                          setIsEditOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4 mr-1" />
                        Modifier
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 border-red-200 hover:bg-red-50"
                        onClick={() => handleDeleteClick(offre)}
                      >
                        <Trash className="h-4 w-4 mr-1" />
                        Supprimer
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => toggleExpand(offre.id)}>
                        {expandedOffre === offre.id ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap gap-2 sm:gap-4 text-xs sm:text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="whitespace-nowrap">Publication: {formatDate(offre.datePublication)}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                    <span className="whitespace-nowrap">Expiration: {formatDate(offre.dateExpiration)}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

          {expandedOffre === offre.id && (
            <CardContent className="border-t px-0 py-0">
              <div className="border-b overflow-x-auto">
                <div className="flex min-w-max">
                  <Button
                    variant={activeTab[offre.id] === "details" ? "secondary" : "ghost"}
                    onClick={() => handleTabChange(offre.id, "details")}
                    className="rounded-none text-xs sm:text-sm py-2 h-auto"
                  >
                    Détails
                  </Button>
                  <Button
                    variant={activeTab[offre.id] === "description" ? "secondary" : "ghost"}
                    onClick={() => handleTabChange(offre.id, "description")}
                    className="rounded-none text-xs sm:text-sm py-2 h-auto"
                  >
                    Description
                  </Button>
                  <Button
                    variant={activeTab[offre.id] === "responsabilites" ? "secondary" : "ghost"}
                    onClick={() => handleTabChange(offre.id, "responsabilites")}
                    className="rounded-none text-xs sm:text-sm py-2 h-auto"
                  >
                    Responsabilités
                  </Button>
                  <Button
                    variant={activeTab[offre.id] === "experience" ? "secondary" : "ghost"}
                    onClick={() => handleTabChange(offre.id, "experience")}
                    className="rounded-none text-xs sm:text-sm py-2 h-auto"
                  >
                    Expérience
                  </Button>
                </div>
              </div>

              <div className="p-3 sm:p-4">
                {activeTab[offre.id] === "details" && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Type de poste</h4>
                      <p className="text-sm sm:text-base">{offre.typePoste}</p>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Type de travail</h4>
                      <p className="text-sm sm:text-base">{offre.typeTravail}</p>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Heures de travail</h4>
                      <p className="text-sm sm:text-base">{offre.heureTravail}</p>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Niveau d'expérience</h4>
                      <p className="text-sm sm:text-base">{offre.niveauExperience}</p>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Niveau d'étude</h4>
                      <p className="text-sm sm:text-base">{offre.niveauEtude}</p>
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">Date de publication</h4>
                      <p className="text-sm sm:text-base">{formatDate(offre.datePublication)}</p>
                    </div>

                    {/* Traits de personnalité */}
                    <div className="col-span-1 sm:col-span-2 md:col-span-3 mt-4">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-3 flex items-center">
                        <Sliders className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                        Poids des traits de personnalité
                      </h4>
                      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-gray-500">Ouverture</div>
                          <div className="text-lg font-semibold">{offre.poids_ouverture || 2}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-gray-500">Conscience</div>
                          <div className="text-lg font-semibold">{offre.poids_conscience || 2}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-gray-500">Extraversion</div>
                          <div className="text-lg font-semibold">{offre.poids_extraversion || 2}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-gray-500">Agréabilité</div>
                          <div className="text-lg font-semibold">{offre.poids_agreabilite || 2}</div>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-md">
                          <div className="text-xs text-gray-500">Stabilité</div>
                          <div className="text-lg font-semibold">{offre.poids_stabilite || 2}</div>
                        </div>
                      </div>
                    </div>

                    <div className="col-span-1 sm:col-span-2 md:col-span-3">
                      <h4 className="text-xs sm:text-sm font-medium text-gray-500 mb-1">
                        Correspondance avec le CV de candidat
                      </h4>
                      <div className="flex items-center mt-1">
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${offre.matching || 0}%` }}
                          ></div>
                        </div>
                        <span className="ml-2 text-sm font-medium">{offre.matching || 0}%</span>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab[offre.id] === "description" && (
                  <div className="prose prose-sm max-w-none text-sm sm:text-base">{offre.description}</div>
                )}

                {activeTab[offre.id] === "responsabilites" && (
                  <div className="prose prose-sm max-w-none text-sm sm:text-base">
                    {offre.responsabilite || "Aucune responsabilité spécifiée"}
                  </div>
                )}

                {activeTab[offre.id] === "experience" && (
                  <div className="prose prose-sm max-w-none text-sm sm:text-base">
                    {offre.experience || "Aucune expérience requise spécifiée"}
                  </div>
                )}
              </div>
            </CardContent>
          )}
        </Card>
      ))}

      {offres.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">Aucune offre trouvée</div>
        </div>
      )}

      <OffreEditDialog
        offre={selectedOffre}
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onOffreUpdated={fetchOffres}
      />

      <ConfirmationDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirmer la suppression"
        message="Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible."
      />

      {/* Batch Delete Dialog */}
      <Dialog
        open={isBatchDeleteDialogOpen}
        onOpenChange={(open) => {
          if (!batchActionLoading) setIsBatchDeleteDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmation de suppression en lot</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer {selectedOffers.length} offre(s) ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBatchDeleteDialogOpen(false)}
              disabled={batchActionLoading}
            >
              Annuler
            </Button>
            <Button type="button" variant="destructive" onClick={confirmBatchDelete} disabled={batchActionLoading}>
              {batchActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Suppression...
                </>
              ) : (
                <>
                  <Trash className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
