"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Eye,
  Undo,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Building,
  User,
  Globe,
  FileText,
  VoicemailIcon as Fax,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"

// Mise à jour de l'interface User pour correspondre aux champs de l'API
interface User {
  id: number
  email: string
  numTel?: string
  adresse?: string
  image?: string
  nom_societe?: string
  created_at: string
  // Nouveaux champs
  apropos?: string
  lien_site_web?: string
  fax?: string
  domaine_activite?: string
  role?: string
  archived?: boolean
}

// Modifier l'interface ArchiveTableProps pour ajouter les props de sélection
interface ArchiveTableProps {
  refresh: boolean
  selectMode?: boolean
  selectedUsers?: number[]
  onToggleSelect?: (user: User) => void
}

const ArchiveTable: React.FC<ArchiveTableProps> = ({
  refresh,
  selectMode = false,
  selectedUsers = [],
  onToggleSelect = () => {},
}) => {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [unarchiving, setUnarchiving] = useState<number | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [userToUnarchive, setUserToUnarchive] = useState<number | null>(null)

  useEffect(() => {
    fetchArchivedUsers()
  }, [refresh])

  const fetchArchivedUsers = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour voir les utilisateurs.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/users/archived", {
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
        throw new Error("Erreur de récupération des utilisateurs archivés")
      }

      const data = await response.json()
      setUsers(data)
      setError(null)
    } catch (error) {
      console.error("Erreur de récupération des utilisateurs archivés:", error)
      setError("Erreur lors du chargement des utilisateurs")
    } finally {
      setLoading(false)
    }
  }

  const confirmUnarchive = (userId: number) => {
    setUserToUnarchive(userId)
    setIsConfirmOpen(true)
  }

  const handleUnarchive = async () => {
    if (!userToUnarchive) return

    setUnarchiving(userToUnarchive)
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour désarchiver un utilisateur.")
        return
      }

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

      setUsers(users.filter((user) => user.id !== userToUnarchive))
      setIsConfirmOpen(false)
    } catch (error) {
      console.error("Erreur de désarchivation:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de la désarchivation de l'utilisateur")
    } finally {
      setUnarchiving(null)
      setUserToUnarchive(null)
    }
  }

  // Fonction pour afficher les détails d'un utilisateur
  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  // Fonction pour ouvrir le site web
  const handleOpenWebsite = (url: string) => {
    window.open(url, "_blank")
  }

  // Ajouter la fonction isUserSelected
  // Fonction pour vérifier si un utilisateur est sélectionné
  const isUserSelected = (userId: number) => {
    return selectedUsers.includes(userId)
  }

  // Fonction pour obtenir les initiales
  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "E"
  }

  // Fonction pour obtenir une couleur basée sur le nom
  const getColorClass = (name: string) => {
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
    const index = name ? name.charCodeAt(0) % colors.length : 0
    return colors[index]
  }

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {users.map((user) => (
          <Card
            key={user.id}
            className="overflow-hidden transition-all duration-300 hover:shadow-lg flex flex-col h-full"
          >
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-4">
                {selectMode && (
                  <Checkbox
                    checked={isUserSelected(user.id)}
                    onCheckedChange={() => onToggleSelect(user)}
                    className="mr-2"
                  />
                )}
                <Avatar className={`h-12 w-12 ${getColorClass(user.nom_societe || "")}`}>
                  {user.image ? (
                    <AvatarImage src={user.image || "/placeholder.svg"} alt={user.nom_societe || ""} />
                  ) : null}
                  <AvatarFallback className="text-white font-medium">
                    {getInitials(user.nom_societe || "")}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="font-semibold text-lg leading-none tracking-tight">
                    {user.nom_societe || "Entreprise"}
                  </h3>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Briefcase className="mr-1 h-3 w-3" />
                    {user.domaine_activite || "N/A"}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pb-2 flex-grow">
              <div className="grid gap-2 text-sm">
                <div className="flex items-center">
                  <Mail className="mr-2 h-4 w-4 text-muted-foreground" />
                  <a
                    href={`https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}`}
                    className="text-blue-600 hover:underline truncate"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {user.email}
                  </a>
                </div>
                <div className="flex items-center">
                  <Phone className="mr-2 h-4 w-4 text-muted-foreground" />
                  <span>{user.numTel || "Non spécifié"}</span>
                </div>
                {user.adresse && (
                  <div className="flex items-center">
                    <MapPin className="mr-2 h-4 w-4 text-muted-foreground" />
                    <span className="truncate">{user.adresse}</span>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-blue-50">
                  {user.role || "Recruteur"}
                </Badge>
                <Badge variant="outline" className="bg-amber-50">
                  <Calendar className="mr-1 h-3 w-3" />
                  {formatDate(user.created_at)}
                </Badge>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-2 mt-auto">
              <Button variant="outline" size="sm" onClick={() => handleViewDetails(user)}>
                <Eye className="mr-2 h-4 w-4" />
                Détails
              </Button>
              {!selectMode && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => confirmUnarchive(user.id)}
                  disabled={unarchiving === user.id}
                >
                  <Undo className="mr-2 h-4 w-4" />
                  {unarchiving === user.id ? "Désarchivage..." : "Désarchiver"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {users.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground text-lg">Aucun utilisateur archivé trouvé</div>
        </div>
      )}

      {selectedUser && isDetailsOpen && (
        <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Détails de l'entreprise</DialogTitle>
              <DialogDescription>Informations complètes de l'entreprise archivée</DialogDescription>
            </DialogHeader>

            <div className="flex items-center space-x-4 mb-6">
              <Avatar className={`h-16 w-16 ${getColorClass(selectedUser.nom_societe || "")}`}>
                {selectedUser.image ? (
                  <AvatarImage src={selectedUser.image || "/placeholder.svg"} alt={selectedUser.nom_societe || ""} />
                ) : null}
                <AvatarFallback className="text-white text-xl font-medium">
                  {getInitials(selectedUser.nom_societe || "")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-bold">{selectedUser.nom_societe || "Entreprise"}</h2>
                <p className="text-muted-foreground flex items-center">
                  <Briefcase className="mr-1 h-4 w-4" />
                  {selectedUser.domaine_activite || "Domaine non spécifié"} • {selectedUser.role || "Recruteur"}
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
                      <p>{selectedUser.numTel || "Non spécifié"}</p>
                    </div>
                  </div>
                  {selectedUser.fax && (
                    <div className="flex items-start">
                      <Fax className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
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
                  <div className="flex items-start">
                    <Building className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Domaine d'activité</p>
                      <p>{selectedUser.domaine_activite || "Non spécifié"}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <User className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Rôle</p>
                      <p>{selectedUser.role || "Recruteur"}</p>
                    </div>
                  </div>
                  {selectedUser.lien_site_web && (
                    <div className="flex items-start">
                      <Globe className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Site Web</p>
                        <a
                          href={selectedUser.lien_site_web}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visiter le site
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
                <div className="flex items-start">
                  <FileText className="mr-3 h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p>{selectedUser.apropos}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-6">
              {selectedUser.lien_site_web && (
                <Button onClick={() => handleOpenWebsite(selectedUser.lien_site_web || "")}>
                  <Globe className="mr-2 h-4 w-4" />
                  Visiter le site
                </Button>
              )}

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
          <DialogFooter className="flex justify-end gap-3 mt-4">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default ArchiveTable