"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Search, Download, Archive, Eye, X, FileText, ChevronLeft, Briefcase, GraduationCap, Clock } from "lucide-react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Mail, Phone, MapPin, Calendar } from "lucide-react"
import { CandidatsTable } from "./candidat-table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
  offre?: Offre
  created_at: string
}

export function CandidatsTabs({ refreshTrigger }: { refreshTrigger: boolean }) {
  const [searchTerm, setSearchTerm] = useState<string>("")
  const [searchResults, setSearchResults] = useState<Candidat[]>([])
  const [showResults, setShowResults] = useState<boolean>(false)
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(null)
  const [allCandidats, setAllCandidats] = useState<Candidat[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [archiveLoading, setArchiveLoading] = useState<boolean>(false)
  const searchRef = useRef<HTMLDivElement>(null)
  const isMobile = useMediaQuery("(max-width: 640px)")

  // Modal states
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false)
  const [showCVModal, setShowCVModal] = useState<boolean>(false)
  const [showArchiveModal, setShowArchiveModal] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("personnel")

  // Charger tous les candidats au démarrage
  useEffect(() => {
    const fetchAllCandidats = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) return

        const response = await fetch("http://127.0.0.1:8000/api/candidats-offre", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          throw new Error("Erreur lors du chargement des candidats")
        }

        const data = await response.json()
        setAllCandidats(data)
      } catch (error) {
        console.error("Erreur de chargement des candidats:", error)
      }
    }

    fetchAllCandidats()
  }, [refreshTrigger])

  // Handle click outside to close search results
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Fonction de recherche côté client
  const handleSearch = (value: string) => {
    setSearchTerm(value)
    setLoading(true)

    if (value.length < 1) {
      setSearchResults([])
      setShowResults(false)
      setSelectedCandidat(null) // Clear selected candidate when search is empty
      setLoading(false)
      return
    }

    try {
      // Filtrer les candidats côté client
      const searchLower = value.toLowerCase()
      const filteredResults = allCandidats.filter((candidat) => {
        return candidat.nom.toLowerCase().includes(searchLower) || candidat.prenom.toLowerCase().includes(searchLower)
      })

      setSearchResults(filteredResults)
      setShowResults(true)
    } catch (error) {
      console.error("Erreur de recherche:", error)
    } finally {
      setLoading(false)
    }
  }

  // Get initials for avatar
  const getInitials = (nom: string, prenom: string) => {
    return `${prenom.charAt(0)}${nom.charAt(0)}`.toUpperCase()
  }

  // Get color class for avatar
  const getColorClass = (nom: string) => {
    const colors = ["bg-blue-500", "bg-emerald-500", "bg-violet-500", "bg-amber-500", "bg-rose-500", "bg-indigo-500"]
    const index = nom.charCodeAt(0) % colors.length
    return colors[index]
  }

  // Handle candidate selection
  const handleSelectCandidat = (candidat: Candidat) => {
    setSelectedCandidat(candidat)
    setShowResults(false)
    // Set the full name in the search bar
    setSearchTerm(`${candidat.prenom} ${candidat.nom}`)
  }

  // Handle CV download
  const handleDownloadCV = (cvUrl: string) => {
    window.open(cvUrl, "_blank")
  }

  // Clear search and selected candidate
  const clearSearch = () => {
    setSearchTerm("")
    setSelectedCandidat(null)
    setSearchResults([])
    setShowResults(false)
  }

  // Handle archive action
  const handleArchive = async () => {
    if (!selectedCandidat) return

    setArchiveLoading(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        console.error("Vous devez être connecté pour archiver un candidat.")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/candidats/archiver/${selectedCandidat.id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'archivage du candidat")
      }

      // Mettre à jour l'état pour retirer le candidat
      setAllCandidats((prevCandidats) => prevCandidats.filter((candidat) => candidat.id !== selectedCandidat.id))
      setShowArchiveModal(false)
      setSelectedCandidat(null)
    } catch (error) {
      console.error("Erreur d'archivage:", error)
    } finally {
      setArchiveLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1" ref={searchRef}>
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Rechercher un candidat par nom ou prénom..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            onFocus={() => searchTerm.length >= 1 && setShowResults(true)}
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}

          {loading && (
            <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg p-4 text-center">
              Recherche en cours...
            </div>
          )}

          {showResults && !loading && searchResults.length > 0 && (
            <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
              {searchResults.map((candidat) => (
                <div
                  key={candidat.id}
                  className="p-2 hover:bg-muted cursor-pointer flex items-center gap-3"
                  onClick={() => handleSelectCandidat(candidat)}
                >
                  <Avatar className={`h-8 w-8 ${getColorClass(candidat.nom)}`}>
                    <AvatarFallback className="text-white text-xs">
                      {getInitials(candidat.nom, candidat.prenom)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">
                      {candidat.prenom} {candidat.nom}
                    </div>
                    <div className="text-xs text-muted-foreground">{candidat.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {showResults && !loading && searchResults.length === 0 && searchTerm.length >= 1 && (
            <div className="absolute z-50 mt-1 w-full bg-background border rounded-md shadow-lg p-4 text-center">
              Aucun candidat trouvé
            </div>
          )}
        </div>
      </div>

      {selectedCandidat ? (
        <>
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-4">
                <div className="flex items-center gap-4">
                  <Avatar className={`h-16 w-16 ${getColorClass(selectedCandidat.nom)}`}>
                    <AvatarFallback className="text-white text-xl font-medium">
                      {getInitials(selectedCandidat.nom, selectedCandidat.prenom)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-gray-800">
                      {selectedCandidat.prenom} {selectedCandidat.nom}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="outline" className="bg-blue-50">
                        {selectedCandidat.niveauEtude}
                      </Badge>
                      <Badge variant="outline" className="bg-emerald-50">
                        {selectedCandidat.niveauExperience}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div className="space-y-4">
                  <div className="flex items-center">
                    <Mail className="mr-3 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a href={`mailto:${selectedCandidat.email}`} className="text-blue-600 hover:underline">
                        {selectedCandidat.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-3 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p>{selectedCandidat.tel}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center">
                    <MapPin className="mr-3 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Localisation</p>
                      <p>
                        {selectedCandidat.ville}, {selectedCandidat.pays}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="mr-3 h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Date de candidature</p>
                      <p>
                        {new Date(selectedCandidat.created_at).toLocaleDateString("fr-FR", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t bg-muted/50 p-6">
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setShowDetailsModal(true)}>
                  <Eye className="mr-2 h-4 w-4" />
                  Détails
                </Button>
                {selectedCandidat.cv && (
                  <Button variant="outline" size="sm" onClick={() => handleDownloadCV(selectedCandidat.cv)}>
                    <FileText className="mr-2 h-4 w-4" />
                    CV
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={() => setShowArchiveModal(true)}>
                  <Archive className="mr-2 h-4 w-4" />
                  Archiver
                </Button>
              </div>
            </CardFooter>
          </Card>
        </>
      ) : (
        <Tabs defaultValue="candidat" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="candidat"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
            >
              Candidats
            </TabsTrigger>
          </TabsList>
          <TabsContent value="candidat" className="p-6">
            <CandidatsTable refresh={refreshTrigger} />
          </TabsContent>
        </Tabs>
      )}

      {/* Details Modal - Updated with slider tabs and reduced height */}
      {selectedCandidat && (
        <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
          <DialogContent
            className={`${isMobile ? "w-[95%] max-w-none p-0" : "max-w-[600px] w-[60%]"}`}
            style={{ maxHeight: "500px", overflowY: "auto" }}
          >
            {/* Mobile Header */}
            {isMobile && (
              <div className="sticky top-0 z-10 bg-white border-b px-4 py-3 flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                  <ChevronLeft className="h-5 w-5" />
                </Button>
                <h2 className="text-lg font-semibold">Détails du candidat</h2>
                <Button variant="ghost" size="sm" onClick={() => setShowDetailsModal(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            )}

            <div className={`${isMobile ? "p-4" : "p-4"}`}>
              {!isMobile && (
                <DialogHeader className="pb-2">
                  <DialogTitle className="text-xl font-bold">Détails du candidat</DialogTitle>
                </DialogHeader>
              )}

              <div className="flex items-center space-x-4 mb-4">
                <Avatar className={`h-14 w-14 ${getColorClass(selectedCandidat.nom)}`}>
                  <AvatarFallback className="text-white text-xl font-medium">
                    {getInitials(selectedCandidat.nom, selectedCandidat.prenom)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">
                    {selectedCandidat.prenom} {selectedCandidat.nom}
                  </h2>
                  <p className="text-muted-foreground flex items-center text-sm">
                    <Briefcase className="mr-1 h-4 w-4" />
                    <span className="truncate">
                      {selectedCandidat.offre?.poste || "Candidat"} • {selectedCandidat.offre?.departement || ""}
                    </span>
                  </p>
                </div>
              </div>

              {/* Tabs slider */}
              <Tabs defaultValue="personnel" className="w-full" value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full grid grid-cols-3 mb-4">
                  <TabsTrigger value="personnel">Personnel</TabsTrigger>
                  <TabsTrigger value="professionnel">Professionnel</TabsTrigger>
                  <TabsTrigger value="offre">Offre</TabsTrigger>
                </TabsList>

                {/* Tab 1: Informations personnelles */}
                <TabsContent value="personnel" className="space-y-4">
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
                </TabsContent>

                {/* Tab 2: Informations professionnelles */}
                <TabsContent value="professionnel" className="space-y-4">
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
                        {selectedCandidat.offre?.datePublication && (
                          <p>
                            Publication: {new Date(selectedCandidat.offre.datePublication).toLocaleDateString("fr-FR")}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Tab 3: Détails de l'offre */}
                <TabsContent value="offre" className="space-y-4">
                  {selectedCandidat.offre ? (
                    <div className="grid grid-cols-1 gap-3">
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
                    <p className="text-muted-foreground">Aucune information d'offre disponible</p>
                  )}
                </TabsContent>
              </Tabs>

              {selectedCandidat.cv && (
                <div className="mt-4">
                  <Button onClick={() => handleDownloadCV(selectedCandidat.cv)} className="w-full">
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger le CV
                  </Button>
                </div>
              )}

              {!isMobile && (
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                    Fermer
                  </Button>
                </DialogFooter>
              )}
            </div>

            {/* Mobile Footer */}
            {isMobile && (
              <div className="sticky bottom-0 border-t bg-white p-4">
                <Button variant="default" onClick={() => setShowDetailsModal(false)} className="w-full">
                  Fermer
                </Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      )}

      {/* CV Modal */}
      <Dialog open={showCVModal} onOpenChange={setShowCVModal}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh]">
          <DialogHeader>
            <DialogTitle>CV du candidat</DialogTitle>
            <DialogDescription>
              {selectedCandidat?.prenom} {selectedCandidat?.nom}
            </DialogDescription>
          </DialogHeader>

          {selectedCandidat?.cv && (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="w-full h-[60vh] border rounded-md overflow-hidden">
                {selectedCandidat.cv.endsWith(".pdf") ? (
                  <iframe
                    src={selectedCandidat.cv}
                    className="w-full h-full"
                    title={`CV de ${selectedCandidat.prenom} ${selectedCandidat.nom}`}
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full bg-muted">
                    <FileText className="h-16 w-16 text-muted-foreground mb-4" />
                    <p className="text-center">Ce format de CV ne peut pas être prévisualisé</p>
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setShowCVModal(false)}>
              Fermer
            </Button>
            <Button onClick={() => handleDownloadCV(selectedCandidat?.cv || "")}>
              <Download className="mr-2 h-4 w-4" />
              Télécharger
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Archive Modal */}
      <Dialog open={showArchiveModal} onOpenChange={setShowArchiveModal}>
        <DialogContent className={`${isMobile ? "w-[90%] max-w-none" : "sm:max-w-md"}`}>
          <DialogHeader>
            <DialogTitle>Archiver le candidat</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir archiver ce candidat ? Cette action peut être annulée ultérieurement.
            </DialogDescription>
          </DialogHeader>

          {selectedCandidat && (
            <div className="flex items-center gap-3 py-2">
              <Avatar className={`h-10 w-10 ${getColorClass(selectedCandidat.nom)}`}>
                <AvatarFallback className="text-white text-sm">
                  {getInitials(selectedCandidat.nom, selectedCandidat.prenom)}
                </AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">
                  {selectedCandidat.prenom} {selectedCandidat.nom}
                </p>
                <p className="text-sm text-muted-foreground">{selectedCandidat.email}</p>
              </div>
            </div>
          )}

          <DialogFooter className={`${isMobile ? "flex-col space-y-2" : "flex space-x-2 justify-end"}`}>
            <Button variant="outline" onClick={() => setShowArchiveModal(false)} className={isMobile ? "w-full" : ""}>
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleArchive}
              className={isMobile ? "w-full" : ""}
              disabled={archiveLoading}
            >
              {archiveLoading ? (
                <span className="flex items-center">
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  Archivage...
                </span>
              ) : (
                <>
                  <Archive className="mr-2 h-4 w-4" />
                  Archiver
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}