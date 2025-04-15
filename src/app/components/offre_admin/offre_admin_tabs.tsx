"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OffreAdminTable } from "./offre_admin_table"
import { OffreAdminTableValide } from "./offre-admin-table-valide"
import { useEffect, useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import {
  Search,
  X,
  AlertCircle,
  Briefcase,
  MapPin,
  Calendar,
  Building,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertTriangle,
  CheckCircle2,
  Trash,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

// Type pour les notifications
type Notification = {
  id: string
  message: string
  type: "success" | "error"
  timestamp: number
}

export function OffreAdminTabs({ refreshTrigger }: { refreshTrigger: boolean }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<any[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [expandedOffre, setExpandedOffre] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<Record<number, string>>({})
  const [isValidating, setIsValidating] = useState<Record<number, boolean>>({})
  const [notifications, setNotifications] = useState<Notification[]>([])

  // Fonction pour ajouter une notification
  const addNotification = (message: string, type: "success" | "error") => {
    const id = Math.random().toString(36).substring(2, 9)
    const newNotification = {
      id,
      message,
      type,
      timestamp: Date.now(),
    }

    setNotifications((prev) => [...prev, newNotification])

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((notification) => notification.id !== id))
    }, 5000)
  }

  // Debounce search term to avoid too many API calls
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm)
    }, 300) // 300ms delay

    return () => clearTimeout(timer)
  }, [searchTerm])

  // Trigger search when debounced search term changes
  useEffect(() => {
    if (debouncedSearchTerm) {
      handleSearch()
    } else if (debouncedSearchTerm === "") {
      setSearchResults(null)
    }
  }, [debouncedSearchTerm])

  // Initialize active tab for each offre
  useEffect(() => {
    if (searchResults) {
      const initialTabs: Record<number, string> = {}
      searchResults.forEach((offre) => {
        initialTabs[offre.id] = "details"
      })
      setActiveTab(initialTabs)
    }
  }, [searchResults])

  const handleSearch = async () => {
    if (!debouncedSearchTerm.trim()) {
      setSearchResults(null)
      return
    }

    setIsSearching(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Vous devez être connecté pour rechercher des offres.")
        return
      }

      const response = await fetch(
        `http://127.0.0.1:8000/api/recherche-offre/${encodeURIComponent(debouncedSearchTerm)}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      )

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche d'offres")
      }

      const data = await response.json()
      // S'assurer que le champ valide est correctement interprété comme un nombre
      const processedData = data.map((offre: any) => ({
        ...offre,
        valider: Number.parseInt(offre.valider, 10) || 0, // Use parseInt instead of Number.parseInt
      }))

      console.log("API Response:", data)
      console.log("Processed Data:", processedData)

      if (debouncedSearchTerm) {
        // Regrouper les suggestions par poste pour n'afficher que des postes uniques
        const uniquePostes = Array.from(new Set(processedData.map((offre: any) => offre.poste)))
        const uniqueSuggestions = uniquePostes.map((poste) => {
          // Trouver la première offre avec ce poste
          return processedData.find((offre: any) => offre.poste === poste)
        })

        setSuggestions(uniqueSuggestions)
        setShowSuggestions(true)
        setSearchResults(null) // Ne pas afficher les résultats complets automatiquement
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error("Erreur de recherche:", error)
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults(null)
  }

  const handleSelectSuggestion = async (offre: any) => {
    setSearchTerm(offre.poste)
    setShowSuggestions(false)

    // Rechercher toutes les offres avec ce nom de poste
    setIsSearching(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Vous devez être connecté pour rechercher des offres.")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/recherche-offre/${encodeURIComponent(offre.poste)}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la recherche d'offres")
      }

      const data = await response.json()
      // S'assurer que le champ valide est correctement interprété comme un nombre
      const processedData = data.map((offre: any) => ({
        ...offre,
        valider: Number.parseInt(offre.valider, 10) || 0, // Use parseInt instead of Number.parseInt
      }))

      console.log("API Response:", data)
      console.log("Processed Data:", processedData)

      // Filtrer pour ne garder que les offres avec exactement ce poste
      const exactMatches = processedData.filter((item: any) => item.poste === offre.poste)
      setSearchResults(exactMatches)
    } catch (error) {
      console.error("Erreur de recherche:", error)
    } finally {
      setIsSearching(false)
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

  // Function to safely render HTML content
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent }
  }

  // Function to validate an offer
  const validateOffer = async (offreId: number) => {
    setIsValidating((prev) => ({ ...prev, [offreId]: true }))

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        addNotification("Vous devez être connecté pour valider une offre.", "error")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/validerOffre/${offreId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ valider: 1 }),
      })

      if (!response.ok) {
        throw new Error("Erreur lors de la validation de l'offre")
      }

      // Update the local state to reflect the change
      setSearchResults((prev) =>
        prev ? prev.map((offre) => (offre.id === offreId ? { ...offre, valider: 1 } : offre)) : null,
      )

      addNotification("L'offre a été validée avec succès.", "success")
    } catch (error) {
      console.error("Erreur de validation:", error)
      addNotification("Une erreur est survenue lors de la validation de l'offre.", "error")
    } finally {
      setIsValidating((prev) => ({ ...prev, [offreId]: false }))
    }
  }

  // Function to delete an offer
  const deleteOffer = async (offreId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        addNotification("Vous devez être connecté pour supprimer une offre.", "error")
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
        throw new Error("Erreur lors de la suppression de l'offre")
      }

      // Update the local state to remove the deleted offer
      setSearchResults((prev) => (prev ? prev.filter((offre) => offre.id !== offreId) : null))

      addNotification("L'offre a été supprimée avec succès.", "success")
    } catch (error) {
      console.error("Erreur de suppression:", error)
      addNotification("Une erreur est survenue lors de la suppression de l'offre.", "error")
    }
  }

  return (
    <div className="space-y-4 w-full">
      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-md shadow-md flex items-start gap-3 animate-in slide-in-from-right-5 ${
                notification.type === "success"
                  ? "bg-green-50 text-green-800 border border-green-200"
                  : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500 mt-0.5" />
              )}
              <div className="flex-1">{notification.message}</div>
              <button
                onClick={() => setNotifications((prev) => prev.filter((n) => n.id !== notification.id))}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Rechercher par nom de poste..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => debouncedSearchTerm && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-8"
          />
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
              {suggestions.map((offre) => (
                <div
                  key={offre.id}
                  className="px-4 py-2 hover:bg-muted cursor-pointer"
                  onMouseDown={() => handleSelectSuggestion(offre)}
                >
                  <div className="font-medium">{offre.poste}</div>
                </div>
              ))}
            </div>
          )}
          {searchTerm && (
            <button
              className="absolute right-2.5 top-2.5 h-4 w-4 text-muted-foreground hover:text-foreground"
              onClick={clearSearch}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        {isSearching && <div className="text-sm text-muted-foreground animate-pulse">Recherche...</div>}
      </div>

      {searchResults ? (
        <div className="space-y-6 px-4 py-6">
          <div className="p-4 bg-blue-50 border rounded-lg">
            <h3 className="font-medium">Résultats de recherche pour "{searchTerm}"</h3>
            <p className="text-sm text-muted-foreground">{searchResults.length} offre(s) trouvée(s)</p>
          </div>

          {searchResults.length > 0 ? (
            <div className="space-y-8">
              {searchResults.map((offre) => (
                <Card key={offre.id} className="overflow-hidden shadow-sm mx-2 my-4">
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
                          {offre.valider === 1 ? (
                            <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                              Validé
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                              En attente
                            </Badge>
                          )}
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
                        {offre.valider !== 1 && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => validateOffer(offre.id)}
                            disabled={isValidating[offre.id]}
                            className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            {isValidating[offre.id] ? "Validation..." : "Valider"}
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteOffer(offre.id)}
                          className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100"
                        >
                          <Trash className="w-4 h-4 mr-1" />
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

                        <div className="p-6 pb-8">
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
                                  <Calendar className="w-4 h-4 mr-2 text-primary" />
                                  {offre.heureTravail}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-500">Niveau d'expérience</h4>
                                <p className="flex items-center">
                                  <Briefcase className="w-4 h-4 mr-2 text-primary" />
                                  {offre.niveauExperience}
                                </p>
                              </div>
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-500">Niveau d'étude</h4>
                                <p className="flex items-center">
                                  <Briefcase className="w-4 h-4 mr-2 text-primary" />
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
                              <div className="space-y-2">
                                <h4 className="text-sm font-medium text-gray-500">Statut</h4>
                                <p className="flex items-center">
                                  <CheckCircle
                                    className={`w-4 h-4 mr-2 ${
                                      offre.valider === 1 ? "text-green-500" : "text-amber-500"
                                    }`}
                                  />
                                  {offre.valider === 1 ? "Validé" : "En attente de validation"}
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
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              Aucune offre trouvée pour cette recherche
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue="offre" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="offre"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
            >
              Offre
            </TabsTrigger>
            <TabsTrigger
              value="offre_valide"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
            >
              Offre Validé
            </TabsTrigger>
          </TabsList>

          <TabsContent value="offre" className="p-6">
            <OffreAdminTable refresh={refreshTrigger} />
          </TabsContent>

          <TabsContent value="offre_valide" className="p-6">
            <OffreAdminTableValide refresh={refreshTrigger} />
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}