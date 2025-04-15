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
import { Pencil, Trash, Calendar, Clock, ChevronDown, ChevronUp, MoreHorizontal } from "lucide-react"
import { useRouter } from "next/navigation"
import { OffreEditDialog } from "./offre-edit-dialog"
import { useMediaQuery } from "@/app/hooks/use-media-query"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

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

export function OffreTable({ refresh }: { refresh: boolean }) {
  const router = useRouter()
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [expandedOffre, setExpandedOffre] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<Record<number, string>>({})
  const isMobile = useMediaQuery("(max-width: 640px)")

  const fetchOffres = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
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
          localStorage.removeItem("token")
          router.push("/auth/login")
          return
        }
        throw new Error("Erreur de récupération des offres")
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

  const handleDeleteClick = (offre: Offre) => {
    setSelectedOffre(offre)
    setIsDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!selectedOffre) return

    try {
      const token = localStorage.getItem("token")
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

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )

  if (error) return <div className="text-red-500 p-4 text-center">{error}</div>

  return (
    <div className="space-y-4">
      {offres.map((offre) => (
        <Card key={offre.id} className={offre.valider ? "border-green-200" : "border-yellow-200"}>
          <CardHeader className="p-3 sm:p-4">
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
    </div>
  )
}