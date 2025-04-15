"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Eye, Undo, Mail, Phone, MapPin, Globe, Calendar, Building, Search, FileText } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import ArchiveTable from "./archive_table"

interface UserType {
  id: number
  email: string
  numTel: string
  adresse: string
  role: string
  image: string | null
  archived: boolean
  nom_societe: string
  active: boolean
  code_verification: string | null
  apropos: string | null
  lien_site_web: string | null
  fax: string | null
  domaine_activite: string | null
  created_at: string
}

export function ReviewsTabs({ refreshTrigger }: { refreshTrigger: boolean }) {
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [searchResults, setSearchResults] = useState<UserType[]>([])
  const [showDropdown, setShowDropdown] = useState<boolean>(false)
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [unarchiving, setUnarchiving] = useState<number | null>(null)
  const [userToUnarchive, setUserToUnarchive] = useState<number | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Fermer le dropdown quand on clique en dehors
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  // Surveiller les changements dans la barre de recherche
  useEffect(() => {
    // Si la barre de recherche est vide, réinitialiser l'utilisateur sélectionné
    if (searchQuery === "") {
      setSelectedUser(null)
    }
  }, [searchQuery])

  // Recherche de recruteurs archivés par nom de société
  const searchRecruiters = async (letter: string) => {
    if (!letter.trim()) {
      setSearchResults([])
      setShowDropdown(false)
      return
    }

    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`http://127.0.0.1:8000/api/recruteurs-archives/recherche?letter=${letter}`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) throw new Error("Erreur lors de la recherche")

      const data = await response.json()
      setSearchResults(data)
      setShowDropdown(true)
    } catch (error) {
      console.error("Erreur de recherche:", error)
      setSearchResults([])
    }
  }

  // Gestion de la saisie dans la barre de recherche
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value
    setSearchQuery(query)
    searchRecruiters(query)
  }

  // Sélection d'un recruteur dans le dropdown
  const handleSelectCandidat = (user: UserType) => {
    setSelectedUser(user)
    setSearchQuery(user.nom_societe || "")
    setShowDropdown(false)
  }

  // Fonctions pour la gestion des détails et désarchivage
  const handleViewDetails = (user: UserType) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  const confirmUnarchive = (userId: number) => {
    setUserToUnarchive(userId)
    setIsConfirmOpen(true)
  }

  const handleUnarchive = async () => {
    if (!userToUnarchive) return

    setUnarchiving(userToUnarchive)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`http://127.0.0.1:8000/api/users/unarchive/${userToUnarchive}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la désarchivation de l'utilisateur")
      }

      // Réinitialiser l'utilisateur sélectionné après désarchivage
      if (selectedUser?.id === userToUnarchive) {
        setSelectedUser(null)
        setSearchQuery("") // Vider la barre de recherche après désarchivage
      }
      setIsConfirmOpen(false)
    } catch (error) {
      console.error("Erreur de désarchivation:", error)
    } finally {
      setUnarchiving(null)
      setUserToUnarchive(null)
    }
  }

  // Fonctions utilitaires
  const getInitials = (nomSociete: string) => {
    if (!nomSociete) return "E"
    // Prendre les deux premières lettres du nom de société ou une seule si le nom est court
    return nomSociete.substring(0, Math.min(2, nomSociete.length)).toUpperCase()
  }

  const getColorClass = (nomSociete: string) => {
    if (!nomSociete) return "bg-gray-500"

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
    const index = nomSociete.charCodeAt(0) % colors.length
    return colors[index]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  return (
    <div className="space-y-4">
      {/* Barre de recherche */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Rechercher une entreprise archivée..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 w-full"
          />
        </div>

        {/* Dropdown des résultats */}
        {showDropdown && searchResults.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-auto">
            {searchResults.map((user) => (
              <div
                key={user.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                onClick={() => handleSelectCandidat(user)}
              >
                {user.image ? (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.image} alt={user.nom_societe} />
                    <AvatarFallback className={`text-white text-xs ${getColorClass(user.nom_societe)}`}>
                      {getInitials(user.nom_societe)}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <Avatar className={`h-8 w-8 ${getColorClass(user.nom_societe)}`}>
                    <AvatarFallback className="text-white text-xs">{getInitials(user.nom_societe)}</AvatarFallback>
                  </Avatar>
                )}
                <div className="font-medium">{user.nom_societe}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Affichage du recruteur sélectionné */}
      {selectedUser && (
        <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col mb-6">
          <CardHeader className="pb-2">
            <div className="flex items-center space-x-4">
              {selectedUser.image ? (
                <Avatar className="h-12 w-12">
                  <AvatarImage src={selectedUser.image} alt={selectedUser.nom_societe} />
                  <AvatarFallback className={`text-white font-medium ${getColorClass(selectedUser.nom_societe)}`}>
                    {getInitials(selectedUser.nom_societe)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className={`h-12 w-12 ${getColorClass(selectedUser.nom_societe)}`}>
                  <AvatarFallback className="text-white font-medium">
                    {getInitials(selectedUser.nom_societe)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="space-y-1">
                <h3 className="font-semibold text-lg leading-none tracking-tight">{selectedUser.nom_societe}</h3>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Building className="mr-1 h-3 w-3" />
                  {selectedUser.domaine_activite || "N/A"}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="pb-2 flex-grow">
            <div className="grid gap-2 text-sm">
              <div className="flex items-center">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                <a
                  href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedUser.email}`}
                  className="text-blue-600 hover:underline truncate"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {selectedUser.email}
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                <span>{selectedUser.numTel}</span>
              </div>
              {selectedUser.fax && (
                <div className="flex items-center">
                  <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>Fax: {selectedUser.fax}</span>
                </div>
              )}
              {selectedUser.adresse && (
                <div className="flex items-center">
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span className="truncate">{selectedUser.adresse}</span>
                </div>
              )}
              {selectedUser.lien_site_web && (
                <div className="flex items-center">
                  <Globe className="mr-2 h-4 w-4 text-muted-foreground" />
                  <a
                    href={selectedUser.lien_site_web}
                    className="text-blue-600 hover:underline truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {selectedUser.lien_site_web}
                  </a>
                </div>
              )}
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedUser.domaine_activite && (
                <Badge variant="outline" className="bg-blue-50">
                  {selectedUser.domaine_activite}
                </Badge>
              )}
              <Badge variant="outline" className="bg-amber-50">
                <Calendar className="mr-1 h-3 w-3" />
                {formatDate(selectedUser.created_at)}
              </Badge>
              {!selectedUser.active && (
                <Badge variant="outline" className="bg-red-50">
                  Inactif
                </Badge>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex justify-between pt-2 mt-auto">
            <Button variant="outline" size="sm" onClick={() => handleViewDetails(selectedUser)}>
              <Eye className="mr-2 h-4 w-4" />
              Détails
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => confirmUnarchive(selectedUser.id)}
              disabled={unarchiving === selectedUser.id}
            >
              <Undo className="mr-2 h-4 w-4" />
              {unarchiving === selectedUser.id ? "Désarchivage..." : "Désarchiver"}
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Tabs pour l'archive */}
      {!selectedUser ? (
        <Tabs defaultValue="archive" className="w-full">
          <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
            <TabsTrigger
              value="archive"
              className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
            >
              Archive
            </TabsTrigger>
          </TabsList>
          <TabsContent value="archive" className="p-6">
            <ArchiveTable refresh={refreshTrigger} />
          </TabsContent>
        </Tabs>
      ) : null}

      {/* Boîte de dialogue pour les détails */}
      {selectedUser && isDetailsOpen && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails de l'entreprise</DialogTitle>
              <DialogDescription>Informations complètes de l'entreprise archivée</DialogDescription>
            </DialogHeader>

            <div className="flex items-center space-x-4 mb-6">
              {selectedUser.image ? (
                <Avatar className="h-16 w-16">
                  <AvatarImage src={selectedUser.image} alt={selectedUser.nom_societe} />
                  <AvatarFallback
                    className={`text-white text-xl font-medium ${getColorClass(selectedUser.nom_societe)}`}
                  >
                    {getInitials(selectedUser.nom_societe)}
                  </AvatarFallback>
                </Avatar>
              ) : (
                <Avatar className={`h-16 w-16 ${getColorClass(selectedUser.nom_societe)}`}>
                  <AvatarFallback className="text-white text-xl font-medium">
                    {getInitials(selectedUser.nom_societe)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div>
                <h2 className="text-2xl font-bold">{selectedUser.nom_societe}</h2>
                <p className="text-muted-foreground flex items-center">
                  <Building className="mr-1 h-4 w-4" />
                  {selectedUser.domaine_activite || "Domaine non spécifié"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informations de contact</h3>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Mail className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Email</p>
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${selectedUser.email}`}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {selectedUser.email}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Phone className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Téléphone</p>
                      <p>{selectedUser.numTel}</p>
                    </div>
                  </div>
                  {selectedUser.fax && (
                    <div className="flex items-start">
                      <FileText className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Fax</p>
                        <p>{selectedUser.fax}</p>
                      </div>
                    </div>
                  )}
                  {selectedUser.adresse && (
                    <div className="flex items-start">
                      <MapPin className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Adresse</p>
                        <p>{selectedUser.adresse}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b pb-2">Informations professionnelles</h3>
                <div className="space-y-3">
                  {selectedUser.domaine_activite && (
                    <div className="flex items-start">
                      <Building className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Domaine d'activité</p>
                        <p>{selectedUser.domaine_activite}</p>
                      </div>
                    </div>
                  )}
                  {selectedUser.lien_site_web && (
                    <div className="flex items-start">
                      <Globe className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Site web</p>
                        <a
                          href={selectedUser.lien_site_web}
                          className="text-blue-600 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {selectedUser.lien_site_web}
                        </a>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <Calendar className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Date d'inscription</p>
                      <p>{formatDate(selectedUser.created_at)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {selectedUser.apropos && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold border-b pb-2 mb-3">À propos</h3>
                <p className="text-sm text-muted-foreground">{selectedUser.apropos}</p>
              </div>
            )}

            <div className="flex justify-between mt-6">
              <Button onClick={() => confirmUnarchive(selectedUser.id)} disabled={unarchiving === selectedUser.id}>
                <Undo className="mr-2 h-4 w-4" />
                {unarchiving === selectedUser.id ? "Désarchivage..." : "Désarchiver"}
              </Button>
              <Button variant="outline" onClick={() => setIsDetailsOpen(false)}>
                Fermer
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Boîte de dialogue de confirmation de désarchivage */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la désarchivation</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir désarchiver cette entreprise ?</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleUnarchive} disabled={unarchiving !== null}>
              {unarchiving !== null ? (
                <div className="flex items-center">
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Désarchivage...
                </div>
              ) : (
                <>
                  <Undo className="mr-2 h-4 w-4" />
                  Désarchiver
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

