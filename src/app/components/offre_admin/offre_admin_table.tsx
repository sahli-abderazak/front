"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Check,
  Trash2,
  AlertCircle,
  Briefcase,
  MapPin,
  Calendar,
  Building,
  GraduationCap,
  Clock,
  FileText,
  ChevronDown,
  ChevronUp,
  CheckSquare,
  Square,
  Loader2,
} from "lucide-react"

interface Offre {
  id: number
  departement: string
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
  typePoste: string
  typeTravail: string
  heureTravail: string
  niveauExperience: string
  niveauEtude: string
  pays: string
  ville: string
  societe: string
  domaine: string
  responsabilite: string
  experience: string
  valider: boolean
}

export function OffreAdminTable({
  refresh,
  selectMode = false,
  selectedOffers = [],
  toggleOfferSelection = () => {},
}: {
  refresh: boolean
  selectMode?: boolean
  selectedOffers?: number[]
  toggleOfferSelection?: (id: number) => void
}) {
  const router = useRouter()
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null)
  const [expandedOffre, setExpandedOffre] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<Record<number, string>>({})
  const [isBatchValidateDialogOpen, setIsBatchValidateDialogOpen] = useState(false)
  const [isBatchDeleteDialogOpen, setIsBatchDeleteDialogOpen] = useState(false)
  const [batchActionLoading, setBatchActionLoading] = useState(false)
  const [localSelectedOffers, setLocalSelectedOffers] = useState<number[]>([])

  // Function to safely render HTML content
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent }
  }

  const fetchOffres = useCallback(async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour voir les offres.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/Alloffresnvalide", {
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
        throw new Error("Erreur de récupération des offres non validées")
      }

      const data = await response.json()
      setOffres(data)

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
  }, [router])

  useEffect(() => {
    fetchOffres()
  }, [fetchOffres, refresh])

  // Synchronize local selected offers with parent component
  useEffect(() => {
    setLocalSelectedOffers(selectedOffers)
  }, [selectedOffers])

  const handleValider = async (offreId: number) => {
    setProcessing(offreId)
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour valider une offre.")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/validerOffre/${offreId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la validation de l'offre")
      }

      setOffres(offres.filter((offre) => offre.id !== offreId))
    } catch (error) {
      console.error("Erreur de validation:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de la validation de l'offre")
    } finally {
      setProcessing(null)
    }
  }

  const handleSupprimer = async (offreId: number) => {
    setProcessing(offreId)
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour supprimer une offre.")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/supprimerOffre/${offreId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la suppression de l'offre")
      }

      setOffres(offres.filter((offre) => offre.id !== offreId))
    } catch (error) {
      console.error("Erreur de suppression:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de la suppression de l'offre")
    } finally {
      setProcessing(null)
      setDeleteConfirmation(null)
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
    setLocalSelectedOffers(allOfferIds)
    // Update parent component
    allOfferIds.forEach((id) => {
      if (!selectedOffers.includes(id)) {
        toggleOfferSelection(id)
      }
    })
  }

  // Deselect all offers
  const deselectAllOffers = () => {
    // Update parent component
    localSelectedOffers.forEach((id) => {
      if (selectedOffers.includes(id)) {
        toggleOfferSelection(id)
      }
    })
    setLocalSelectedOffers([])
  }

  // Validate selected offers
  const validateSelectedOffers = () => {
    if (localSelectedOffers.length > 0) {
      setIsBatchValidateDialogOpen(true)
    }
  }

  // Delete selected offers
  const deleteSelectedOffers = () => {
    if (localSelectedOffers.length > 0) {
      setIsBatchDeleteDialogOpen(true)
    }
  }

  // Confirm batch validation
  const confirmBatchValidate = async () => {
    const token = sessionStorage.getItem("token")
    if (!token) {
      setIsBatchValidateDialogOpen(false)
      setError("Vous devez être connecté pour valider des offres.")
      return
    }

    setBatchActionLoading(true)

    try {
      // Créer une copie des IDs sélectionnés avant de les valider
      const offersToValidate = [...localSelectedOffers]

      // Valider chaque offre sélectionnée
      const validatePromises = offersToValidate.map((offreId) =>
        fetch(`http://127.0.0.1:8000/api/validerOffre/${offreId}`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      )

      // Attendre que toutes les requêtes soient terminées
      await Promise.all(validatePromises)
        .then(() => {
          console.log("Toutes les offres ont été validées avec succès")

          // Mettre à jour l'interface APRÈS la validation réussie
          setOffres((prev) => prev.filter((offre) => !offersToValidate.includes(offre.id)))

          // Réinitialiser la sélection
          offersToValidate.forEach((id) => {
            if (selectedOffers.includes(id)) {
              toggleOfferSelection(id)
            }
          })
          setLocalSelectedOffers([])
        })
        .catch((error) => {
          console.error("Erreur lors de la validation de certaines offres:", error)
          setError("Une erreur est survenue lors de la validation des offres.")
        })
    } catch (error) {
      console.error("Erreur lors de la validation des offres:", error)
      setError("Une erreur est survenue lors de la validation des offres.")
    } finally {
      setBatchActionLoading(false)
      setIsBatchValidateDialogOpen(false)
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
      const offersToDelete = [...localSelectedOffers]

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
          setOffres((prev) => prev.filter((offre) => !offersToDelete.includes(offre.id)))

          // Réinitialiser la sélection
          offersToDelete.forEach((id) => {
            if (selectedOffers.includes(id)) {
              toggleOfferSelection(id)
            }
          })
          setLocalSelectedOffers([])
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
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )

  if (error)
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-red-600 flex items-center">
        <AlertCircle className="w-5 h-5 mr-2" />
        {error}
      </div>
    )

  if (offres.length === 0)
    return (
      <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg text-blue-600 flex items-center justify-center">
        <FileText className="w-5 h-5 mr-2" />
        Aucune offre en attente de validation
      </div>
    )

  return (
    <>
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
            onClick={validateSelectedOffers}
            disabled={localSelectedOffers.length === 0}
            className="whitespace-nowrap text-green-600 hover:text-green-700 hover:bg-green-50"
          >
            <Check className="h-4 w-4 mr-2" />
            Valider ({localSelectedOffers.length})
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={deleteSelectedOffers}
            disabled={localSelectedOffers.length === 0}
            className="whitespace-nowrap text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Supprimer ({localSelectedOffers.length})
          </Button>
        </div>
      )}

      <div className="space-y-6">
        {offres.map((offre) => (
          <Card key={offre.id} className="overflow-hidden relative">
            {selectMode && (
              <div className="absolute top-4 left-4 z-10">
                <Checkbox
                  checked={localSelectedOffers.includes(offre.id)}
                  onCheckedChange={() => toggleOfferSelection(offre.id)}
                  className="h-5 w-5 border-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
              </div>
            )}
            <CardHeader className={`p-6 bg-gradient-to-r from-blue-50 to-indigo-50 ${selectMode ? "pl-12" : ""}`}>
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200">
                      {offre.departement}
                    </Badge>
                    <Badge variant="outline" className="bg-indigo-100 text-indigo-800 border-indigo-200">
                      {offre.domaine}
                    </Badge>
                  </div>
                  <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                    <Briefcase className="w-5 h-5 mr-2 text-primary" />
                    {offre.poste}
                  </CardTitle>
                  <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                    <div className="flex items-center">
                      <Building className="w-4 h-4 mr-1 text-gray-500" />
                      {offre.societe}
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                      {offre.ville}, {offre.pays}
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                      Expire le {formatDate(offre.dateExpiration)}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    onClick={() => handleValider(offre.id)}
                    disabled={processing === offre.id}
                    variant="outline"
                    className="bg-green-50 text-green-600 border-green-200 hover:bg-green-100"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    {processing === offre.id ? "Validation..." : "Valider"}
                  </Button>
                  <Button
                    onClick={() => setDeleteConfirmation(offre.id)}
                    disabled={processing === offre.id}
                    variant="outline"
                    className="bg-red-50 text-red-600 border-red-200 hover:bg-red-100"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Supprimer
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => toggleExpand(offre.id)} className="ml-auto">
                    {expandedOffre === offre.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                    <span className="sr-only">Toggle</span>
                  </Button>
                </div>
              </div>
            </CardHeader>

            {expandedOffre === offre.id && (
              <CardContent className="p-0">
                <div className="border-t">
                  <div className="px-6 py-4 bg-gray-50 flex overflow-x-auto">
                    <Button
                      variant={activeTab[offre.id] === "details" ? "default" : "ghost"}
                      onClick={() => handleTabChange(offre.id, "details")}
                      className="mr-2"
                    >
                      Détails
                    </Button>
                    <Button
                      variant={activeTab[offre.id] === "description" ? "default" : "ghost"}
                      onClick={() => handleTabChange(offre.id, "description")}
                      className="mr-2"
                    >
                      Description
                    </Button>
                    <Button
                      variant={activeTab[offre.id] === "responsabilites" ? "default" : "ghost"}
                      onClick={() => handleTabChange(offre.id, "responsabilites")}
                      className="mr-2"
                    >
                      Responsabilités
                    </Button>
                    <Button
                      variant={activeTab[offre.id] === "experience" ? "default" : "ghost"}
                      onClick={() => handleTabChange(offre.id, "experience")}
                    >
                      Expérience requise
                    </Button>
                  </div>

                  <div className="p-6">
                    {activeTab[offre.id] === "details" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500">Type de poste</h4>
                          <p className="flex items-center">
                            <Briefcase className="w-4 h-4 mr-2 text-primary" />
                            {offre.typePoste}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500">Type de travail</h4>
                          <p className="flex items-center">
                            <Building className="w-4 h-4 mr-2 text-primary" />
                            {offre.typeTravail}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500">Heures de travail</h4>
                          <p className="flex items-center">
                            <Clock className="w-4 h-4 mr-2 text-primary" />
                            {offre.heureTravail}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500">Niveau d'expérience</h4>
                          <p className="flex items-center">
                            <FileText className="w-4 h-4 mr-2 text-primary" />
                            {offre.niveauExperience}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500">Niveau d'étude</h4>
                          <p className="flex items-center">
                            <GraduationCap className="w-4 h-4 mr-2 text-primary" />
                            {offre.niveauEtude}
                          </p>
                        </div>
                        <div className="space-y-2">
                          <h4 className="text-sm font-medium text-gray-500">Date de publication</h4>
                          <p className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2 text-primary" />
                            {formatDate(offre.datePublication)}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab[offre.id] === "description" && (
                      <div className="border rounded-md p-4 max-h-[250px] overflow-y-auto">
                        <div
                          className="prose prose-blue max-w-none"
                          dangerouslySetInnerHTML={createMarkup(offre.description)}
                        />
                      </div>
                    )}

                    {activeTab[offre.id] === "responsabilites" && (
                      <div className="border rounded-md p-4 max-h-[250px] overflow-y-auto">
                        <div
                          className="prose prose-blue max-w-none"
                          dangerouslySetInnerHTML={createMarkup(
                            offre.responsabilite || "<p>Aucune responsabilité spécifiée</p>",
                          )}
                        />
                      </div>
                    )}

                    {activeTab[offre.id] === "experience" && (
                      <div className="border rounded-md p-4 max-h-[250px] overflow-y-auto">
                        <div
                          className="prose prose-blue max-w-none"
                          dangerouslySetInnerHTML={createMarkup(
                            offre.experience || "<p>Aucune expérience spécifiée</p>",
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmation !== null} onOpenChange={() => setDeleteConfirmation(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Êtes-vous sûr de vouloir supprimer cette offre ? Cette action est irréversible.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteConfirmation(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={() => deleteConfirmation && handleSupprimer(deleteConfirmation)}>
              <AlertCircle className="w-4 h-4 mr-1" />
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Batch Validate Dialog */}
      <Dialog
        open={isBatchValidateDialogOpen}
        onOpenChange={(open) => {
          if (!batchActionLoading) setIsBatchValidateDialogOpen(open)
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmation de validation en lot</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir valider {localSelectedOffers.length} offre(s) ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsBatchValidateDialogOpen(false)}
              disabled={batchActionLoading}
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="default"
              onClick={confirmBatchValidate}
              disabled={batchActionLoading}
              className="bg-green-600 hover:bg-green-700"
            >
              {batchActionLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Validation...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Valider
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
              Êtes-vous sûr de vouloir supprimer {localSelectedOffers.length} offre(s) ? Cette action est irréversible.
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
                  <Trash2 className="mr-2 h-4 w-4" />
                  Supprimer
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}