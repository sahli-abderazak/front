"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, Trash } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import "../styles/employee-cards.css"
import { UserDetailsDialog } from "./UserDetailsDialog"

// Mettre à jour l'interface User pour correspondre aux champs de l'API
interface User {
  id: number
  email: string
  numTel: string
  adresse: string
  image?: string
  nom_societe: string
  created_at: string
  // Nouveaux champs
  apropos?: string
  lien_site_web?: string
  fax?: string
  domaine_activite?: string
  role?: string
}

interface ReviewsTableProps {
  refresh: boolean
  selectMode?: boolean
  selectedUsers?: number[]
  onToggleSelect?: (userId: number) => void
  archivedUserIds?: number[]
}

export function ReviewsTable({
  refresh,
  selectMode = false,
  selectedUsers = [],
  onToggleSelect = () => {},
  archivedUserIds = [],
}: ReviewsTableProps) {
  const router = useRouter()
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false)
  const [userToArchive, setUserToArchive] = useState<number | null>(null)

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = sessionStorage.getItem("token")
        if (!token) {
          setError("Vous devez être connecté pour voir les utilisateurs.")
          return
        }

        const response = await fetch("http://127.0.0.1:8000/api/users", {
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
          throw new Error("Erreur de récupération des utilisateurs")
        }

        const data = await response.json()
        setUsers(data)
        setError(null)
      } catch (error) {
        console.error("Erreur de récupération des utilisateurs:", error)
        setError("Erreur lors du chargement des utilisateurs")
      } finally {
        setLoading(false)
      }
    }

    fetchUsers()
  }, [refresh, router])

  // Filtrer les utilisateurs archivés
  useEffect(() => {
    if (archivedUserIds.length > 0) {
      setUsers((prevUsers) => prevUsers.filter((user) => !archivedUserIds.includes(user.id)))
    }
  }, [archivedUserIds])

  const archiveUser = async (userId: number) => {
    setUserToArchive(userId)
    setIsArchiveDialogOpen(true)
  }

  const confirmArchive = async () => {
    if (!userToArchive) return

    const token = sessionStorage.getItem("token")
    if (!token) {
      setError("Vous devez être connecté pour archiver un utilisateur.")
      setIsArchiveDialogOpen(false)
      return
    }

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/users/archive/${userToArchive}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Erreur lors de l'archivage de l'utilisateur")
      }

      // Mise à jour en temps réel de l'interface utilisateur
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== userToArchive))

      // Notifier le parent si nécessaire via un callback
      if (onToggleSelect && selectedUsers.includes(userToArchive)) {
        onToggleSelect(userToArchive)
      }

      setIsArchiveDialogOpen(false)
      setUserToArchive(null)
    } catch (error) {
      setError("Erreur lors de l'archivage de l'utilisateur.")
      setIsArchiveDialogOpen(false)
    }
  }

  const handleViewDetails = (user: User) => {
    setSelectedUser(user)
    setIsDetailsOpen(true)
  }

  const handleEditUser = (updatedUser: User) => {
    setUsers((prevUsers) => prevUsers.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
  }

  if (loading) return <div>Chargement...</div>
  if (error) return <div>{error}</div>

  // Dans le rendu des cartes, remplacer les références aux champs supprimés
  // et ajouter les nouveaux champs
  return (
    <>
      <div className="cards-grid">
        {users.map((user) => (
          <Card key={user.id} className="user-card">
            {selectMode && (
              <div className="absolute top-2 left-2 z-10">
                <Checkbox
                  checked={selectedUsers.includes(user.id)}
                  onCheckedChange={() => onToggleSelect(user.id)}
                  className="h-5 w-5 border-2 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600"
                />
              </div>
            )}
            <div className="card-header"></div>
            <div className="avatar-container">
              <Avatar className="user-avatar">
                <AvatarImage src={user.image || `/placeholder.svg?height=96&width=96`} alt={user.nom_societe} />
                <AvatarFallback className="avatar-fallback">{user.nom_societe?.[0]}</AvatarFallback>
              </Avatar>
            </div>

            <CardContent className="card-content">
              <h3 className="user-name">{user.nom_societe}</h3>

              <Badge
                className="user-badge cursor-pointer hover:bg-blue-700"
                onClick={() => window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${user.email}`, "_blank")}
              >
                {user.email || "Email non spécifié"}
              </Badge>

              <div className="user-details">
                <div className="detail-row">
                  <span className="detail-label">Site web:</span>
                  <span
                    className="detail-value cursor-pointer text-blue-600 hover:underline"
                    onClick={() => user.lien_site_web && window.open(user.lien_site_web, "_blank")}
                  >
                    {user.lien_site_web || "Non spécifié"}
                  </span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Téléphone:</span>
                  <span className="detail-value">{user.numTel || "Non spécifié"}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Inscrit le:</span>
                  <span className="detail-value">
                    {new Intl.DateTimeFormat("fr-FR").format(new Date(user.created_at))}
                  </span>
                </div>
              </div>
            </CardContent>

            <CardFooter className="card-footer">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleViewDetails(user)}
                className="action-button view-button"
              >
                <Eye className="button-icon" />
                Détails
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => archiveUser(user.id)}
                className="action-button archive-button"
              >
                <Trash className="button-icon" />
                Archiver
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {selectedUser && (
        <UserDetailsDialog user={selectedUser} isOpen={isDetailsOpen} onClose={() => setIsDetailsOpen(false)} />
      )}

      {/* Archive Confirmation Dialog */}
      <Dialog open={isArchiveDialogOpen} onOpenChange={setIsArchiveDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmation d'archivage</DialogTitle>
            <DialogDescription>Êtes-vous sûr de vouloir archiver cet utilisateur ?</DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setIsArchiveDialogOpen(false)}>
              Annuler
            </Button>
            <Button type="button" variant="destructive" onClick={confirmArchive}>
              Archiver
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}