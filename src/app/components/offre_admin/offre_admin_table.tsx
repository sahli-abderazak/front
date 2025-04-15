"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
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

export function OffreAdminTable({ refresh }: { refresh: boolean }) {
  const router = useRouter()
  const [offres, setOffres] = useState<Offre[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState<number | null>(null)
  const [deleteConfirmation, setDeleteConfirmation] = useState<number | null>(null)
  const [expandedOffre, setExpandedOffre] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<Record<number, string>>({})

  // Function to safely render HTML content
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent }
  }

  const fetchOffres = useCallback(async () => {
    try {
      const token = localStorage.getItem("token")
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
          localStorage.removeItem("token")
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

  const handleValider = async (offreId: number) => {
    setProcessing(offreId)
    try {
      const token = localStorage.getItem("token")
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
      const token = localStorage.getItem("token")
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
      <div className="space-y-6">
        {offres.map((offre) => (
          <Card key={offre.id} className="overflow-hidden">
            <CardHeader className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50">
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
    </>
  )
}

