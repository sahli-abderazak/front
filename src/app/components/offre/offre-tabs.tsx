"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OffreTable } from "./offre-table"
import { OffreTableExpiree } from "./offre-table_expiree"
import { OffreTableValide } from "./offre-table-valide"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Clock,
  CheckCircle2,
  Pencil,
  Trash2,
  Users,
} from "lucide-react"

import { OffreEditDialog } from "./offre-edit-dialog"
import { OffreEditDialogExpiree } from "./offre-edit-dialog_Expiree"
import { useRouter } from "next/navigation"

// Type pour les offres
interface Offre {
  id: number
  domaine: string
  departement: string
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
  valider: number
  societe?: string
  ville?: string
  pays?: string
  typePoste?: string
  typeTravail?: string
  heureTravail?: string
  niveauExperience?: string
  niveauEtude?: string
  responsabilite?: string
  experience?: string
}

// Type pour les notifications
type Notification = {
  id: string
  message: string
  type: "success" | "error" | "warning"
  timestamp: number
}

export function OffreTabs({ refreshTrigger }: { refreshTrigger: boolean }) {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [searchResults, setSearchResults] = useState<Offre[] | null>(null)
  const [isSearching, setIsSearching] = useState(false)
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("")
  const [suggestions, setSuggestions] = useState<Offre[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [expandedOffre, setExpandedOffre] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState<Record<number, string>>({})
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [currentTabValue, setCurrentTabValue] = useState("offre")
  const [offres, setOffres] = useState<Offre[]>([])

  const [selectedOffre, setSelectedOffre] = useState<Offre | null>(null)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isEditExpireDialogOpen, setIsEditExpireDialogOpen] = useState(false)

  // State pour la sélection multiple
  const [selectMode, setSelectMode] = useState(false)
  const [selectedOffers, setSelectedOffers] = useState<number[]>([])

  // Fonction pour activer/désactiver le mode de sélection
  const toggleSelectMode = () => {
    setSelectMode((prev) => !prev)
    if (selectMode) {
      // Désactiver le mode de sélection
      setSelectedOffers([]) // Déselectionner toutes les offres
    }
  }

  // Fonction pour sélectionner/déselectionner une offre
  const toggleOfferSelection = (offreId: number) => {
    setSelectedOffers((prevSelectedOffers) => {
      if (prevSelectedOffers.includes(offreId)) {
        // Déselectionner l'offre
        return prevSelectedOffers.filter((id) => id !== offreId)
      } else {
        // Sélectionner l'offre
        return [...prevSelectedOffers, offreId]
      }
    })
  }

  // Fonction pour ajouter une notification
  const addNotification = (message: string, type: "success" | "error" | "warning") => {
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
      const token = sessionStorage.getItem("token")
      if (!token) {
        addNotification("Vous devez être connecté pour rechercher des offres.", "error")
        return
      }

      // Endpoint URL based on current tab
      let endpoint = "recherche-offre"
      if (currentTabValue === "offre_valide") {
        endpoint = "recherche-offre-valide"
      } else if (currentTabValue === "offre_expiree") {
        endpoint = "recherche-offre-expiree"
      }

      const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}/${encodeURIComponent(debouncedSearchTerm)}`, {
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
        valider: Number.parseInt(offre.valider, 10) || 0,
      }))

      if (debouncedSearchTerm) {
        // Regrouper les suggestions par poste pour n'afficher que des postes uniques
        const uniquePostes = Array.from(new Set(processedData.map((offre: any) => offre.poste)))
        const uniqueSuggestions = uniquePostes.map((poste) => {
          // Trouver la première offre avec ce poste
          return processedData.find((offre: any) => offre.poste === poste)
        })

        setSuggestions(uniqueSuggestions.filter(Boolean) as Offre[])
        setShowSuggestions(true)
        setSearchResults(null) // Ne pas afficher les résultats complets automatiquement
      } else {
        setSuggestions([])
        setShowSuggestions(false)
      }
    } catch (error) {
      console.error("Erreur de recherche:", error)
      addNotification("Une erreur est survenue lors de la recherche.", "error")
    } finally {
      setIsSearching(false)
    }
  }

  const clearSearch = () => {
    setSearchTerm("")
    setSearchResults(null)
  }

  const handleSelectSuggestion = async (offre: Offre) => {
    setSearchTerm(offre.poste)
    setShowSuggestions(false)

    // Rechercher toutes les offres avec ce nom de poste
    setIsSearching(true)
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        addNotification("Vous devez être connecté pour rechercher des offres.", "error")
        return
      }

      // Endpoint URL based on current tab
      let endpoint = "recherche-offre"
      if (currentTabValue === "offre_valide") {
        endpoint = "recherche-offre-valide"
      } else if (currentTabValue === "offre_expiree") {
        endpoint = "recherche-offre-expiree"
      }

      const response = await fetch(`http://127.0.0.1:8000/api/${endpoint}/${encodeURIComponent(offre.poste)}`, {
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
        valider: Number.parseInt(offre.valider, 10) || 0,
      }))

      // Filtrer pour ne garder que les offres avec exactement ce poste
      const exactMatches = processedData.filter((item: any) => item.poste === offre.poste)
      setSearchResults(exactMatches)
    } catch (error) {
      console.error("Erreur de recherche:", error)
      addNotification("Une erreur est survenue lors de la recherche.", "error")
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

  // Function to calculate days until expiration
  const getDaysUntilExpiration = (dateExpiration: string) => {
    const expirationDate = new Date(dateExpiration)
    const today = new Date()
    const diff = expirationDate.getTime() - today.getTime()
    return Math.ceil(diff / (1000 * 3600 * 24))
  }

  // Function to get expiration status and styling
  const getExpirationStatus = (dateExpiration: string) => {
    const daysLeft = getDaysUntilExpiration(dateExpiration)

    if (daysLeft < 0) {
      return {
        label: "Expirée",
        className: "bg-red-100 text-red-800 border-red-200",
        icon: <AlertCircle className="w-4 h-4 mr-1" />,
      }
    } else if (daysLeft <= 1) {
      return {
        label: `Expire aujourd'hui`,
        className: "bg-orange-100 text-orange-800 border-orange-200",
        icon: <Clock className="w-4 h-4 mr-1" />,
      }
    } else if (daysLeft <= 3) {
      return {
        label: `Expire dans ${daysLeft} jours`,
        className: "bg-amber-100 text-amber-800 border-amber-200",
        icon: <AlertTriangle className="w-4 h-4 mr-1" />,
      }
    } else {
      return {
        label: `Expire le ${formatDate(dateExpiration)}`,
        className: "bg-blue-50 text-blue-800 border-blue-100",
        icon: <Calendar className="w-4 h-4 mr-1" />,
      }
    }
  }

  // Function to handle tab change
  const handleMainTabChange = (value: string) => {
    setCurrentTabValue(value)
    setSearchResults(null)
    setSearchTerm("")
  }

  // Function to handle delete offer
  const handleDeleteOffre = async (offreId: number) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) {
      return
    }

    try {
      const token = sessionStorage.getItem("token")
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

      addNotification("Offre supprimée avec succès.", "success")

      // Remove the deleted offer from search results
      if (searchResults) {
        setSearchResults(searchResults.filter((offre) => offre.id !== offreId))
      }
    } catch (error) {
      console.error("Erreur de suppression:", error)
      addNotification("Une erreur est survenue lors de la suppression.", "error")
    }
  }

  // Function to open edit dialog
  const handleEditOffre = (offre: Offre) => {
    setSelectedOffre(offre)

    const daysLeft = getDaysUntilExpiration(offre.dateExpiration)
    const isExpired = daysLeft < 0
    const isExpiringSoon = daysLeft <= 3 && !isExpired

    // If offer is validated and expired or expiring soon, open the expiration dialog
    if (offre.valider === 1 && (isExpired || isExpiringSoon)) {
      setIsEditExpireDialogOpen(true)
    } else {
      setIsEditDialogOpen(true)
    }
  }

  // Function to handle dialog close
  const handleDialogClose = () => {
    setIsEditDialogOpen(false)
    setIsEditExpireDialogOpen(false)
    setSelectedOffre(null)
  }

  // Function to handle offer update
  const handleOffreUpdated = () => {
    // Refresh the search results if needed
    if (debouncedSearchTerm) {
      handleSearch()
    }

    addNotification("Offre mise à jour avec succès.", "success")
  }

  // Fonction pour naviguer vers la page des candidats
  const navigateToCandidats = (offreId: number) => {
    router.push(`/candidat-offre/${offreId}`)
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
                  : notification.type === "warning"
                    ? "bg-amber-50 text-amber-800 border border-amber-200"
                    : "bg-red-50 text-red-800 border border-red-200"
              }`}
            >
              {notification.type === "success" ? (
                <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5" />
              ) : notification.type === "warning" ? (
                <AlertTriangle className="h-5 w-5 text-amber-500 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-500 mt-0.5" />
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

      {/* Barre de recherche et bouton de sélection */}
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
                  <div className="text-xs text-muted-foreground">
                    {offre.departement} • {offre.domaine}
                  </div>
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

        {/* Bouton de sélection */}
        <Button
          variant={selectMode ? "default" : "outline"}
          onClick={toggleSelectMode}
          className={`whitespace-nowrap ${selectMode ? "bg-blue-600 hover:bg-blue-700" : ""}`}
        >
          {selectMode ? "Terminer" : "Sélectionner"}
        </Button>
      </div>

      {/* Barre d'actions pour la sélection par lot */}

      {searchResults ? (
        <div className="space-y-6 px-4 py-6">
          <div className="p-4 bg-blue-50 border rounded-lg">
            <h3 className="font-medium">Résultats de recherche pour "{searchTerm}"</h3>
            <p className="text-sm text-muted-foreground">{searchResults.length} offre(s) trouvée(s)</p>
          </div>

          {searchResults.length > 0 ? (
            <div className="space-y-8">
              {searchResults.map((offre) => {
                const expirationStatus = getExpirationStatus(offre.dateExpiration)
                const isExpired = getDaysUntilExpiration(offre.dateExpiration) < 0
                const isExpiringSoon = getDaysUntilExpiration(offre.dateExpiration) <= 3 && !isExpired

                return (
                  <Card
                    key={offre.id}
                    className={`overflow-hidden shadow-sm mx-2 my-4 ${
                      isExpired ? "border-red-200" : isExpiringSoon ? "border-amber-200" : "border-gray-200"
                    }`}
                  >
                    <CardHeader
                      className={`p-6 ${
                        isExpired
                          ? "bg-gradient-to-r from-red-50 to-red-100"
                          : isExpiringSoon
                            ? "bg-gradient-to-r from-amber-50 to-amber-100"
                            : "bg-gradient-to-r from-blue-50 to-indigo-50"
                      }`}
                    >
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
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Validé
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="bg-amber-100 text-amber-800 border-amber-200">
                                En attente
                              </Badge>
                            )}
                            <Badge variant="outline" className={expirationStatus.className}>
                              {expirationStatus.icon}
                              {expirationStatus.label}
                            </Badge>
                          </div>
                          <CardTitle className="text-xl font-bold text-gray-800 flex items-center">
                            <Briefcase className="w-5 h-5 mr-2 text-primary" />
                            {offre.poste}
                          </CardTitle>
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                            {offre.societe && (
                              <div className="flex items-center">
                                <Building className="w-4 h-4 mr-1 text-gray-500" />
                                {offre.societe}
                              </div>
                            )}
                            {offre.ville && (
                              <div className="flex items-center">
                                <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                                {offre.ville}
                                {offre.pays ? `, ${offre.pays}` : ""}
                              </div>
                            )}
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-1 text-gray-500" />
                              Publié le {formatDate(offre.datePublication)}
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          {/* Bouton "Voir candidats" pour les offres validées */}
                          {offre.valider === 1 && !isExpired && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigateToCandidats(offre.id)}
                              className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                              <Users className="h-4 w-4" />
                              Voir candidats
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEditOffre(offre)}
                            className="flex items-center gap-2 text-blue-600 border-blue-200 hover:bg-blue-50"
                          >
                            <Pencil className="h-4 w-4" />
                            Modifier
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDeleteOffre(offre.id)}
                            className="flex items-center gap-2 text-red-600 border-red-200 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                            Supprimer
                          </Button>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => toggleExpand(offre.id)} className="ml-auto">
                          {expandedOffre === offre.id ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                          <span className="ml-1">{expandedOffre === offre.id ? "Réduire" : "Détails"}</span>
                        </Button>
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
                            {offre.responsabilite && (
                              <Button
                                variant={activeTab[offre.id] === "responsabilites" ? "default" : "ghost"}
                                onClick={() => handleTabChange(offre.id, "responsabilites")}
                                className="mr-2"
                              >
                                Responsabilités
                              </Button>
                            )}
                            {offre.experience && (
                              <Button
                                variant={activeTab[offre.id] === "experience" ? "default" : "ghost"}
                                onClick={() => handleTabChange(offre.id, "experience")}
                              >
                                Expérience requise
                              </Button>
                            )}
                          </div>

                          <div className="p-6 pb-8">
                            {activeTab[offre.id] === "details" && (
                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {offre.typePoste && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-500">Type de poste</h4>
                                    <p className="flex items-center">
                                      <Briefcase className="w-4 h-4 mr-2 text-primary" />
                                      {offre.typePoste}
                                    </p>
                                  </div>
                                )}
                                {offre.typeTravail && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-500">Type de travail</h4>
                                    <p className="flex items-center">
                                      <Building className="w-4 h-4 mr-2 text-primary" />
                                      {offre.typeTravail}
                                    </p>
                                  </div>
                                )}
                                {offre.heureTravail && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-500">Heures de travail</h4>
                                    <p className="flex items-center">
                                      <Calendar className="w-4 h-4 mr-2 text-primary" />
                                      {offre.heureTravail}
                                    </p>
                                  </div>
                                )}
                                {offre.niveauExperience && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-500">Niveau d'expérience</h4>
                                    <p className="flex items-center">
                                      <Briefcase className="w-4 h-4 mr-2 text-primary" />
                                      {offre.niveauExperience}
                                    </p>
                                  </div>
                                )}
                                {offre.niveauEtude && (
                                  <div className="space-y-2">
                                    <h4 className="text-sm font-medium text-gray-500">Niveau d'étude</h4>
                                    <p className="flex items-center">
                                      <Briefcase className="w-4 h-4 mr-2 text-primary" />
                                      {offre.niveauEtude}
                                    </p>
                                  </div>
                                )}
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium text-gray-500">Date de publication</h4>
                                  <p className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                    {formatDate(offre.datePublication)}
                                  </p>
                                </div>
                                <div className="space-y-2">
                                  <h4 className="text-sm font-medium text-gray-500">Date d'expiration</h4>
                                  <p className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2 text-primary" />
                                    {formatDate(offre.dateExpiration)}
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

                            {activeTab[offre.id] === "responsabilites" && offre.responsabilite && (
                              <div className="border rounded-md p-4 max-h-[250px] overflow-y-auto">
                                <div
                                  className="prose prose-blue max-w-none"
                                  dangerouslySetInnerHTML={createMarkup(offre.responsabilite)}
                                />
                              </div>
                            )}

                            {activeTab[offre.id] === "experience" && offre.experience && (
                              <div className="border rounded-md p-4 max-h-[250px] overflow-y-auto">
                                <div
                                  className="prose prose-blue max-w-none"
                                  dangerouslySetInnerHTML={createMarkup(offre.experience)}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    )}
                  </Card>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground border rounded-lg">
              <AlertCircle className="mx-auto h-8 w-8 mb-2" />
              Aucune offre trouvée pour cette recherche
            </div>
          )}
        </div>
      ) : (
        <Tabs defaultValue="offre" value={currentTabValue} onValueChange={handleMainTabChange} className="w-full">
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
              Offre Validée
            </TabsTrigger>
            <TabsTrigger
              value="offre_expiree"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
            >
              Offre Expirée
            </TabsTrigger>
          </TabsList>
          <TabsContent value="offre" className="p-6">
            <OffreTable
              refresh={refreshTrigger}
              selectMode={selectMode}
              selectedOffers={selectedOffers}
              toggleOfferSelection={toggleOfferSelection}
              setOffres={setOffres}
            />
          </TabsContent>
          <TabsContent value="offre_valide" className="p-6">
            <OffreTableValide
              refresh={refreshTrigger}
              selectMode={selectMode}
              selectedOffers={selectedOffers}
              toggleOfferSelection={toggleOfferSelection}
              setOffres={setOffres}
            />
          </TabsContent>
          <TabsContent value="offre_expiree" className="p-6">
            <OffreTableExpiree
              refresh={refreshTrigger}
              selectMode={selectMode}
              selectedOffers={selectedOffers}
              toggleOfferSelection={toggleOfferSelection}
              setOffres={setOffres}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Edit Dialogs */}
      {selectedOffre && (
        <>
          <OffreEditDialog
            offre={{ ...selectedOffre, valider: Boolean(selectedOffre.valider) } as any}
            isOpen={isEditDialogOpen}
            onClose={handleDialogClose}
            onOffreUpdated={handleOffreUpdated}
          />
          <OffreEditDialogExpiree
            offre={{ ...selectedOffre, valider: Boolean(selectedOffre.valider) } as any}
            isOpen={isEditExpireDialogOpen}
            onClose={handleDialogClose}
            onOffreUpdated={handleOffreUpdated}
            isExpiringSoon={
              getDaysUntilExpiration(selectedOffre.dateExpiration) <= 3 &&
              getDaysUntilExpiration(selectedOffre.dateExpiration) >= 0
            }
            isProlongation={getDaysUntilExpiration(selectedOffre.dateExpiration) < 0}
          />
        </>
      )}
    </div>
  )
}