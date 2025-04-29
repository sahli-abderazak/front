"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, Mail, Send, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Message {
  id: number
  nom: string
  email: string
  sujet: string // Add the subject field
  message: string
  repondu: boolean
  created_at?: string
}

interface MessagesTableProps {
  refresh: boolean
}

const MessagesTable: React.FC<MessagesTableProps> = ({ refresh }) => {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [replying, setReplying] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [messageToDelete, setMessageToDelete] = useState<number | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false)
  const [selectionMode, setSelectionMode] = useState<boolean>(false)
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [batchDeleteDialogOpen, setBatchDeleteDialogOpen] = useState<boolean>(false)

  useEffect(() => {
    fetchMessages()
  }, [refresh])

  const fetchMessages = async () => {
    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour voir les messages.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/showcontacts", {
        method: "GET",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      })

      // Check if response is ok before trying to parse JSON
      if (!response.ok) {
        if (response.status === 401) {
          sessionStorage.removeItem("token")
          router.push("/auth/login")
          return
        }

        // Try to get more information about the error
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`)
        } else {
          // If not JSON, get the text response for debugging
          const textResponse = await response.text()
          console.error("Response non-JSON:", textResponse.substring(0, 200) + "...")
          throw new Error(`Erreur ${response.status}: Le serveur n'a pas retourné de JSON valide`)
        }
      }

      const data = await response.json()
      setMessages(data)
      setError(null)
    } catch (error) {
      console.error("Erreur de récupération des messages:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors du chargement des messages. Vérifiez la console pour plus de détails.",
      )
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (messageId: number, email: string) => {
    setReplying(messageId)
    try {
      // Ouvrir Gmail avec l'adresse email du message
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, "_blank")

      // Marquer le message comme répondu dans la base de données
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour marquer un message comme répondu.")
        return
      }

      // Mettre à jour l'état local pour refléter la réponse immédiatement
      // même si l'API n'est pas encore disponible
      setMessages(messages.map((message) => (message.id === messageId ? { ...message, repondu: true } : message)))

      try {
        // Essayer d'appeler l'API pour mettre à jour le statut
        const response = await fetch("http://127.0.0.1:8000/api/markasreplied/" + messageId, {
          method: "PUT",
          headers: {
            Authorization: "Bearer " + token,
            "Content-Type": "application/json",
          },
        })

        if (!response.ok) {
          console.warn("Impossible de mettre à jour le statut du message sur le serveur, mais l'email a été envoyé.")
        }
      } catch (apiError) {
        console.warn("Erreur API lors de la mise à jour du statut:", apiError)
        // Ne pas afficher d'erreur à l'utilisateur car l'email a été envoyé
      }
    } catch (error) {
      console.error("Erreur lors de l'ouverture de Gmail:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de l'ouverture de Gmail. Vérifiez la console pour plus de détails.",
      )
    } finally {
      setReplying(null)
    }
  }

  const confirmDelete = (messageId: number) => {
    setMessageToDelete(messageId)
    setDeleteDialogOpen(true)
  }

  const cancelDelete = () => {
    setMessageToDelete(null)
    setDeleteDialogOpen(false)
  }

  const handleDelete = async (messageId: number) => {
    setDeleting(messageId)
    setDeleteDialogOpen(false)

    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour supprimer un message.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/deleteContact/" + messageId, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Erreur ${response.status}: ${response.statusText}`)
        } else {
          const textResponse = await response.text()
          console.error("Response non-JSON:", textResponse.substring(0, 200) + "...")
          throw new Error(`Erreur ${response.status}: Le serveur n'a pas retourné de JSON valide`)
        }
      }

      // Supprimer le message de l'état local
      setMessages(messages.filter((message) => message.id !== messageId))
    } catch (error) {
      console.error("Erreur de suppression:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression du message. Vérifiez la console pour plus de détails.",
      )
    } finally {
      setDeleting(null)
    }
  }

  // Fonctions pour la sélection multiple
  const toggleSelectionMode = () => {
    setSelectionMode(!selectionMode)
    setSelectedIds([])
  }

  const toggleSelectItem = (id: number) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((itemId) => itemId !== id) : [...prev, id]))
  }

  const selectAll = () => {
    if (selectedIds.length === messages.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(messages.map((m) => m.id))
    }
  }

  const confirmBatchDelete = () => {
    if (selectedIds.length === 0) return
    setBatchDeleteDialogOpen(true)
  }

  const handleBatchDelete = async () => {
    if (selectedIds.length === 0) return

    try {
      const token = sessionStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour supprimer des messages.")
        setBatchDeleteDialogOpen(false)
        return
      }

      setDeleting(-1) // Utiliser -1 pour indiquer une suppression par lot

      // Supprimer chaque message sélectionné
      const promises = selectedIds.map((id) =>
        fetch(`http://127.0.0.1:8000/api/deleteContact/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      )

      await Promise.all(promises)

      // Mettre à jour l'état local
      setMessages(messages.filter((message) => !selectedIds.includes(message.id)))

      setSelectedIds([])
      setSelectionMode(false)
      setBatchDeleteDialogOpen(false)
    } catch (error) {
      console.error("Erreur de suppression par lot:", error)
      setError(
        error instanceof Error
          ? error.message
          : "Erreur lors de la suppression des messages. Vérifiez la console pour plus de détails.",
      )
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="p-4 text-gray-600 font-medium text-center">Chargement des messages...</div>
  if (error) return <div className="p-4 text-red-500 font-medium text-center">{error}</div>
  if (messages.length === 0)
    return <div className="p-4 text-gray-600 font-medium text-center">Aucun message disponible.</div>

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h2 className="text-3xl font-bold tracking-tight">Messages reçus</h2>
        <p className="text-muted-foreground mt-1">Consultez et répondez aux messages de vos clients et candidats.</p>
      </div>

      <div className="flex justify-between items-center mb-4">
        <Button variant="outline" onClick={toggleSelectionMode} className="text-xs">
          {selectionMode ? "Annuler la sélection" : "Sélectionner des messages"}
        </Button>

        {selectionMode && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="selectAll"
                checked={selectedIds.length === messages.length && messages.length > 0}
                onChange={selectAll}
                className="mr-2 h-4 w-4"
              />
              <label htmlFor="selectAll" className="text-sm">
                Tout sélectionner ({selectedIds.length}/{messages.length})
              </label>
            </div>

            {selectedIds.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                onClick={confirmBatchDelete}
                className="text-xs"
                disabled={selectedIds.length === 0}
              >
                Supprimer ({selectedIds.length})
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {messages.map((message) => (
          <Card
            key={message.id}
            className={`overflow-hidden transition-all duration-300 hover:shadow-lg ${
              message.repondu ? "border-l-4 border-l-green-500" : "border-l-4 border-l-blue-500"
            } h-[400px] flex flex-col bg-white dark:bg-gray-900 ${
              selectedIds.includes(message.id) ? "ring-2 ring-primary" : ""
            }`}
          >
            <CardHeader className="pb-2 pt-4">
              <div className="flex flex-col space-y-2">
                <div className="flex items-center">
                  {selectionMode && (
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(message.id)}
                      onChange={() => toggleSelectItem(message.id)}
                      className="h-4 w-4 mr-2"
                    />
                  )}
                  <div className="flex items-center justify-center h-12 w-12 rounded-full bg-gradient-to-br from-primary/80 to-primary text-primary-foreground font-semibold text-sm shadow-sm">
                    {message.nom.substring(0, 2).toUpperCase()}
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-lg">{message.nom}</h3>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5 mr-1" />
                      <a href={`mailto:${message.email}`} className="hover:underline truncate max-w-[180px]">
                        {message.email}
                      </a>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end">
                  {message.repondu ? (
                    <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 flex items-center">
                      <CheckCircle className="w-3.5 h-3.5 mr-1" /> Répondu
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="bg-blue-100 text-blue-800 border-blue-200 flex items-center">
                      <AlertCircle className="w-3.5 h-3.5 mr-1" /> Non répondu
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 flex-grow">
              <div className="space-y-3">
                <div>
                  <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Sujet</span>
                  <h4 className="font-medium text-base mt-1">{message.sujet}</h4>
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Message</span>
                  <div className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md mt-1 h-[100px] overflow-y-auto shadow-inner">
                    {message.message}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-4 bg-muted/20">
              <Button
                onClick={() => confirmDelete(message.id)}
                disabled={deleting === message.id}
                variant="outline"
                size="sm"
                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                {deleting === message.id ? "Suppression..." : "Supprimer"}
              </Button>

              <div>
                {!message.repondu ? (
                  <Button
                    onClick={() => handleReply(message.id, message.email)}
                    disabled={replying === message.id}
                    variant="default"
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-colors shadow-sm"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    {replying === message.id ? "Envoi en cours..." : "Répondre par email"}
                  </Button>
                ) : (
                  <Button
                    onClick={() =>
                      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${message.email}`, "_blank")
                    }
                    variant="outline"
                    size="sm"
                    className="border-green-200 text-green-600 hover:bg-green-50 hover:text-green-700"
                  >
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer un autre email
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Dialogue de confirmation de suppression individuelle */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirmer la suppression</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer ce message ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between gap-4 pt-4">
            <Button variant="outline" onClick={cancelDelete} className="flex-1">
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={() => messageToDelete && handleDelete(messageToDelete)}
              disabled={deleting !== null}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              {deleting !== null ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de confirmation de suppression par lot */}
      <Dialog open={batchDeleteDialogOpen} onOpenChange={setBatchDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle className="text-xl">Confirmer la suppression multiple</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Êtes-vous sûr de vouloir supprimer {selectedIds.length} message(s) ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex justify-between sm:justify-between gap-4 pt-4">
            <Button variant="outline" onClick={() => setBatchDeleteDialogOpen(false)} className="flex-1">
              Annuler
            </Button>
            <Button
              variant="destructive"
              onClick={handleBatchDelete}
              disabled={deleting !== null}
              className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
            >
              {deleting === -1 ? "Suppression..." : `Supprimer (${selectedIds.length})`}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MessagesTable