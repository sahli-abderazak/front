"use client"

import React from "react"

import { useState, useEffect, useRef } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Search, MessageSquare, Loader2, User, Clock, Check, CheckCheck } from "lucide-react"
import Pusher from "pusher-js"

// Types
interface UserType {
  id: number
  nom?: string
  email: string
  role: string
  image?: string
  nom_societe: string
  last_message_at?: string
}

interface Message {
  id: number
  from_user_id: number
  to_user_id: number
  content: string
  read_at: string | null
  created_at: string
  updated_at: string
  sender?: UserType
}

export default function ChatPage() {
  // États
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [users, setUsers] = useState<UserType[]>([])
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [isSending, setIsSending] = useState(false)
  const [unreadCounts, setUnreadCounts] = useState<Record<number, number>>({})
  const [error, setError] = useState<string | null>(null)
  const [pusherConnected, setPusherConnected] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messageInputRef = useRef<HTMLInputElement>(null)
  const pusherRef = useRef<Pusher | null>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  // API URL avec fallback
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

  // Récupérer l'utilisateur courant
  const fetchCurrentUser = async () => {
    try {
      setError(null)
      console.log("Tentative de récupération de l'utilisateur courant...")

      const response = await fetch(`${API_URL}/api/user`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          Accept: "application/json",
        },
      })

      console.log("Statut de la réponse user:", response.status)

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()
      console.log("Données utilisateur:", data)
      setCurrentUser(data)

      // Récupérer les utilisateurs contactables après avoir défini l'utilisateur courant
      await fetchContactableUsers()
    } catch (error) {
      console.error("Erreur lors de la récupération de l'utilisateur:", error)
      setError("Impossible de récupérer les informations utilisateur")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCurrentUser()

    // Nettoyage
    return () => {
      setCurrentUser(null)
      setUsers([])
      setSelectedUser(null)
      setMessages([])

      // Déconnecter Pusher
      if (pusherRef.current) {
        pusherRef.current.disconnect()
        pusherRef.current = null
      }
    }
  }, [])

  // Récupérer les utilisateurs contactables
  const fetchContactableUsers = async () => {
    try {
      setError(null)
      console.log("Tentative de récupération des utilisateurs contactables...")

      const response = await fetch(`${API_URL}/api/contactable-users`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          Accept: "application/json",
        },
      })

      console.log("Statut de la réponse contactable-users:", response.status)

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()
      console.log("Utilisateurs contactables:", data)

      // Trier les utilisateurs par date du dernier message si disponible
      const sortedUsers = [...data].sort((a, b) => {
        if (a.last_message_at && b.last_message_at) {
          return new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime()
        }
        if (a.last_message_at) return -1
        if (b.last_message_at) return 1
        return 0
      })

      setUsers(sortedUsers)

      // Si l'utilisateur est un recruteur, sélectionner automatiquement l'admin
      if (data.length > 0) {
        const userFromStorage = sessionStorage.getItem("user")
        if (userFromStorage) {
          try {
            const currentUserFromStorage = JSON.parse(userFromStorage)
            console.log("Utilisateur actuel:", currentUserFromStorage)

            if (currentUserFromStorage.role === "recruteur") {
              setSelectedUser(data[0])
            }
          } catch (e) {
            console.error("Erreur lors du parsing de l'utilisateur:", e)
          }
        }
      }

      // Récupérer les compteurs de messages non lus
      await fetchUnreadCounts()
    } catch (error) {
      console.error("Erreur lors de la récupération des utilisateurs contactables:", error)
      setError("Impossible de récupérer la liste des utilisateurs")
    }
  }

  // Récupérer les compteurs de messages non lus
  const fetchUnreadCounts = async () => {
    try {
      const response = await fetch(`${API_URL}/api/messages/unread-counts`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`)
      }

      const data = await response.json()
      setUnreadCounts(data.counts || {})
    } catch (error) {
      console.error("Erreur lors de la récupération des compteurs de messages non lus:", error)
    }
  }

  // Récupérer les messages lorsqu'un utilisateur est sélectionné
  useEffect(() => {
    if (selectedUser) {
      fetchMessages()
    } else {
      setMessages([])
    }
  }, [selectedUser])

  // Configuration de Pusher pour les messages en temps réel
  useEffect(() => {
    if (!currentUser) return

    // Éviter les connexions multiples
    if (pusherRef.current) {
      pusherRef.current.disconnect()
      pusherRef.current = null
      setPusherConnected(false)
    }

    try {
      const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY
      const pusherCluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER

      if (!pusherKey || !pusherCluster) {
        return
      }

      pusherRef.current = new Pusher(pusherKey, {
        cluster: pusherCluster,
        authEndpoint: `${API_URL}/api/broadcasting/auth`, // Notez le /api/ ajouté ici
        auth: {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem("token")}`,
            Accept: "application/json",
            "X-CSRF-Token": document.querySelector('meta[name="csrf-token"]')?.getAttribute("content") || "",
          },
        },
      })

      // Ajouter plus de logs pour le débogage
      pusherRef.current.connection.bind("connected", () => {
        console.log("Pusher connecté avec succès - ID de socket:", pusherRef.current?.connection.socket_id)
        setPusherConnected(true)
      })

      pusherRef.current.connection.bind("error", (err: any) => {
        console.error("Erreur de connexion Pusher:", err)
        setPusherConnected(false)
      })

      // Modifier la partie d'abonnement au canal pour ajouter plus de logs
      const channelName = `presence-chat.${currentUser.id}`
      console.log(
        "Tentative d'abonnement au canal Pusher:",
        channelName,
        "avec socket ID:",
        pusherRef.current?.connection.socket_id,
      )

      const channel = pusherRef.current.subscribe(channelName)

      // Écouter les événements d'abonnement
      channel.bind("pusher:subscription_succeeded", () => {
        console.log("Abonnement au canal réussi:", channelName)
      })

      channel.bind("new-message", (data: { message: Message }) => {
        // Mettre à jour les compteurs de messages non lus
        if (data.message.to_user_id === currentUser.id) {
          setUnreadCounts((prev) => ({
            ...prev,
            [data.message.from_user_id]: (prev[data.message.from_user_id] || 0) + 1,
          }))

          // Rafraîchir la liste des utilisateurs pour mettre à jour l'ordre
          fetchContactableUsers()
        }

        // Ajouter le message à la conversation courante si elle est ouverte
        if (
          selectedUser &&
          ((data.message.from_user_id === selectedUser.id && data.message.to_user_id === currentUser.id) ||
            (data.message.to_user_id === selectedUser.id && data.message.from_user_id === currentUser.id))
        ) {
          // Vérifier si le message existe déjà pour éviter les doublons
          setMessages((prev) => {
            if (prev.some((m) => m.id === data.message.id)) {
              return prev
            }
            return [...prev, data.message]
          })

          // Marquer comme lu si c'est la conversation courante
          if (data.message.from_user_id === selectedUser.id) {
            markMessageAsRead(data.message.id)
          }
        }
      })

      // Gestionnaire d'erreurs Pusher
      channel.bind("pusher:subscription_error", (status: any) => {})

      return () => {
        console.log("Nettoyage de l'abonnement Pusher")
        if (pusherRef.current) {
          channel.unbind_all()
          pusherRef.current.unsubscribe(channelName)
        }
      }
    } catch (error) {
      console.error("Erreur lors de la configuration de Pusher:", error)
      setPusherConnected(false)
    }
  }, [currentUser, API_URL])

  // Polling pour les mises à jour des messages
  useEffect(() => {
    if (!selectedUser) return

    // Polling initial immédiat
    fetchMessages()

    // Puis toutes les 3 secondes
    const intervalId = setInterval(() => {
      console.log("Rafraîchissement des messages par polling")
      fetchMessages()

      // Rafraîchir aussi la liste des utilisateurs toutes les 10 secondes
      if (intervalCounter % 3 === 0) {
        fetchContactableUsers()
      }
      intervalCounter++
    }, 3000)

    let intervalCounter = 0

    return () => clearInterval(intervalId)
  }, [selectedUser])

  // Défiler vers le bas lorsque de nouveaux messages arrivent
  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Marquer les messages comme lus lorsque la conversation est ouverte
  useEffect(() => {
    if (selectedUser && messages.length > 0) {
      const unreadMessages = messages.filter((m) => m.from_user_id === selectedUser.id && !m.read_at)

      if (unreadMessages.length > 0) {
        // Marquer tous les messages non lus comme lus
        markConversationAsRead(selectedUser.id)

        // Mettre à jour les compteurs locaux
        setUnreadCounts((prev) => ({
          ...prev,
          [selectedUser.id]: 0,
        }))
      }
    }
  }, [selectedUser, messages])

  const fetchMessages = async () => {
    if (!selectedUser) return

    try {
      setError(null)
      const response = await fetch(`${API_URL}/api/messages/${selectedUser.id}`, {
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`)
      }

      // IMPORTANT: Créer une nouvelle constante pour le résultat JSON
      const messageData = await response.json()
      console.log("Messages récupérés:", messageData)
      setMessages(messageData)
    } catch (error) {
      console.error("Erreur lors de la récupération des messages:", error)
      setError("Impossible de charger les messages")
    }
  }

  const markMessageAsRead = async (messageId: number) => {
    try {
      await fetch(`${API_URL}/api/messages/${messageId}/read`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          Accept: "application/json",
        },
      })
    } catch (error) {
      console.error("Erreur lors du marquage d'un message comme lu:", error)
    }
  }

  const markConversationAsRead = async (userId: number) => {
    try {
      await fetch(`${API_URL}/api/messages/read-all/${userId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          Accept: "application/json",
        },
      })
    } catch (error) {
      console.error("Erreur lors du marquage de la conversation comme lue:", error)
    }
  }

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newMessage.trim() || !selectedUser || !currentUser) return

    setIsSending(true)
    setError(null)

    try {
      const response = await fetch(`${API_URL}/api/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${sessionStorage.getItem("token")}`,
          Accept: "application/json",
        },
        body: JSON.stringify({
          to_user_id: selectedUser.id,
          content: newMessage,
        }),
      })

      if (!response.ok) {
        throw new Error(`Erreur ${response.status}: ${await response.text()}`)
      }

      // IMPORTANT: Créer une nouvelle constante pour le résultat JSON
      const messageData = await response.json()
      console.log("Message envoyé:", messageData)

      setMessages((prev) => [...prev, messageData])
      setNewMessage("")
      messageInputRef.current?.focus()
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error)
      setError("Impossible d'envoyer le message")
    } finally {
      setIsSending(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const getUserTitle = (user: UserType) => {
    return user.nom_societe
  }

  const getUserSubtitle = (user: UserType) => {
    if (user.role === "admin") {
      return "Administrateur"
    } else if (user.role === "recruteur") {
      return user.nom_societe || "Recruteur"
    }
    return user.email
  }

  const getInitials = (user: UserType) => {
    // Get first two characters of company name or first character if only one word
    const parts = user.nom_societe.split(" ")
    if (parts.length > 1) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`.toUpperCase()
    }
    return user.nom_societe.substring(0, 2).toUpperCase()
  }

  // Formater la date du dernier message
  const formatLastMessageTime = (dateString?: string) => {
    if (!dateString) return ""

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.round(diffMs / 60000)
    const diffHours = Math.round(diffMs / 3600000)
    const diffDays = Math.round(diffMs / 86400000)

    if (diffMins < 1) return "à l'instant"
    if (diffMins < 60) return `il y a ${diffMins} min`
    if (diffHours < 24) return `il y a ${diffHours}h`
    if (diffDays === 1) return "hier"

    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
  }

  // Filtrer les utilisateurs en fonction du terme de recherche
  const filteredUsers = users.filter(
    (user) =>
      user.nom_societe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Afficher le chargement
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-16rem)] bg-gray-50 dark:bg-gray-900">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg flex flex-col items-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <span className="text-lg font-medium">Chargement de vos conversations...</span>
          <p className="text-muted-foreground mt-2">Veuillez patienter un instant</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-16rem)] bg-white dark:bg-gray-900 rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
      <div className="flex w-full mx-auto overflow-hidden">
        {/* Sidebar - Liste des utilisateurs */}
        <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 h-full flex flex-col bg-white dark:bg-gray-800">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-xl font-bold mb-4 text-gray-900 dark:text-gray-100">Messagerie</h1>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
              <Input
                placeholder="Rechercher..."
                className="pl-9 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-y-auto flex-1 bg-gray-50 dark:bg-gray-800/50">
            {filteredUsers.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400 flex flex-col items-center">
                <User className="h-12 w-12 mb-3 text-gray-300 dark:text-gray-600" />
                {searchTerm ? (
                  <>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Aucun résultat trouvé</p>
                    <p className="text-sm mt-1">Essayez avec un autre terme de recherche</p>
                  </>
                ) : (
                  <>
                    <p className="font-medium text-gray-700 dark:text-gray-300">Aucun utilisateur disponible</p>
                    <p className="text-sm mt-1">Vous n'avez pas encore de contacts</p>
                  </>
                )}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors ${
                    selectedUser?.id === user.id ? "bg-gray-100 dark:bg-gray-700/70" : ""
                  }`}
                  onClick={() => setSelectedUser(user)}
                >
                  <div className="relative">
                    <Avatar className="h-12 w-12 border-2 border-white dark:border-gray-800 shadow-sm">
                      <AvatarFallback className="bg-primary/10 text-primary font-medium">
                        {getInitials(user)}
                      </AvatarFallback>
                      {user.image && <AvatarImage src={user.image} alt={getUserTitle(user)} />}
                    </Avatar>
                    {unreadCounts[user.id] > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                        {unreadCounts[user.id] > 9 ? "9+" : unreadCounts[user.id]}
                      </span>
                    )}
                    {user.id === selectedUser?.id && (
                      <span className="absolute bottom-0 right-0 bg-green-500 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center">
                      <div className="font-medium truncate text-gray-900 dark:text-gray-100">{getUserTitle(user)}</div>
                      {user.last_message_at && (
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatLastMessageTime(user.last_message_at)}
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400 truncate flex items-center mt-1">
                      <span
                        className={`w-2 h-2 rounded-full mr-1.5 ${user.role === "admin" ? "bg-blue-500" : "bg-emerald-500"}`}
                      ></span>
                      {getUserSubtitle(user)}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Info utilisateur courant */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10 border-2 border-white dark:border-gray-800 shadow-sm">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {currentUser ? getInitials(currentUser) : "U"}
                </AvatarFallback>
                {currentUser?.image && <AvatarImage src={currentUser.image} alt={currentUser.nom} />}
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate text-gray-900 dark:text-gray-100">
                  {currentUser ? currentUser.nom_societe : "Utilisateur"}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                  <span
                    className={`w-2 h-2 rounded-full mr-1.5 ${currentUser?.role === "admin" ? "bg-blue-500" : "bg-emerald-500"}`}
                  ></span>
                  {currentUser?.role === "admin" ? "Administrateur" : "Recruteur"}
                </div>
              </div>
              <div className="flex items-center">
                {pusherConnected ? (
                  <div className="flex items-center text-xs text-green-600 dark:text-green-500">
                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1.5 animate-pulse"></span>
                    <span className="hidden sm:inline">En ligne</span>
                  </div>
                ) : (
                  <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-1.5"></span>
                    <span className="hidden sm:inline">Hors ligne</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Zone de chat */}
        <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-gray-900">
          {/* Afficher les erreurs */}
          {error && (
            <div className="p-3 m-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-md text-sm border border-red-200 dark:border-red-800 flex items-center">
              <span className="mr-2">⚠️</span>
              {error}
            </div>
          )}

          {selectedUser ? (
            <>
              {/* En-tête de conversation */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center">
                <Avatar className="h-10 w-10 mr-3 border-2 border-white dark:border-gray-800 shadow-sm">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(selectedUser)}
                  </AvatarFallback>
                  {selectedUser.image && <AvatarImage src={selectedUser.image} alt={getUserTitle(selectedUser)} />}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h2 className="font-medium truncate text-gray-900 dark:text-gray-100">
                    {getUserTitle(selectedUser)}
                  </h2>
                  <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
                    <span
                      className={`w-2 h-2 rounded-full mr-1.5 ${selectedUser.role === "admin" ? "bg-blue-500" : "bg-emerald-500"}`}
                    ></span>
                    {getUserSubtitle(selectedUser)}
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-900/50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-6">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 max-w-md w-full">
                      <MessageSquare className="h-12 w-12 mb-4 text-gray-300 dark:text-gray-600 mx-auto" />
                      <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
                        Pas encore de messages
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                        Commencez la conversation avec {getUserTitle(selectedUser)} dès maintenant !
                      </p>
                      <div
                        className="text-primary text-sm font-medium cursor-pointer hover:underline"
                        onClick={() => messageInputRef.current?.focus()}
                      >
                        Envoyer un message
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {messages.map((message, index) => {
                      const isCurrentUser = message.from_user_id === currentUser?.id
                      const messageDate = new Date(message.created_at)
                      const showDateHeader =
                        index === 0 ||
                        new Date(messages[index - 1].created_at).toDateString() !== messageDate.toDateString()

                      // Afficher un séparateur de date si nécessaire
                      const showDateSeparator = showDateHeader && (
                        <div className="flex items-center justify-center my-4">
                          <div className="bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-xs px-3 py-1 rounded-full">
                            {messageDate.toLocaleDateString("fr-FR", {
                              weekday: "long",
                              day: "numeric",
                              month: "long",
                            })}
                          </div>
                        </div>
                      )

                      return (
                        <React.Fragment key={message.id}>
                          {showDateHeader && showDateSeparator}
                          <div className={`flex ${isCurrentUser ? "justify-end" : "justify-start"} group`}>
                            {!isCurrentUser && (
                              <Avatar className="h-8 w-8 mr-2 mt-1 flex-shrink-0">
                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                  {getInitials(selectedUser)}
                                </AvatarFallback>
                                {selectedUser.image && (
                                  <AvatarImage src={selectedUser.image} alt={getUserTitle(selectedUser)} />
                                )}
                              </Avatar>
                            )}
                            <div
                              className={`px-4 py-2.5 rounded-2xl max-w-[75%] shadow-sm ${
                                isCurrentUser
                                  ? "bg-blue-600 text-white rounded-tr-none"
                                  : "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100 border border-blue-200 dark:border-blue-800 rounded-tl-none"
                              }`}
                            >
                              <div className="whitespace-pre-wrap break-words">{message.content}</div>
                              <div
                                className={`text-xs mt-1 flex items-center justify-end ${
                                  isCurrentUser ? "text-blue-100" : "text-blue-600 dark:text-blue-400"
                                }`}
                              >
                                {messageDate.toLocaleTimeString("fr-FR", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                                {isCurrentUser && (
                                  <span className="ml-1">
                                    {message.read_at ? (
                                      <CheckCheck className="h-3 w-3 text-blue-100" />
                                    ) : (
                                      <Check className="h-3 w-3 text-blue-100" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        </React.Fragment>
                      )
                    })}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              {/* Formulaire de message */}
              <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 sticky bottom-0 left-0 right-0">
                <form onSubmit={sendMessage} className="flex gap-2">
                  <Input
                    ref={messageInputRef}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Tapez un message..."
                    className="flex-1 bg-gray-100 dark:bg-gray-700 border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-400"
                    disabled={isSending}
                    autoFocus
                  />
                  <Button
                    type="submit"
                    size="icon"
                    className="rounded-full h-10 w-10 transition-all duration-200 ease-in-out bg-blue-600 hover:bg-blue-700"
                    disabled={!newMessage.trim() || isSending}
                  >
                    {isSending ? <Loader2 className="h-5 w-5 animate-spin" /> : <Send className="h-5 w-5" />}
                  </Button>
                </form>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <Card className="w-[90%] max-w-md shadow-lg border-gray-200 dark:border-gray-700">
                <CardContent className="pt-6 pb-6 text-center">
                  <div className="bg-blue-100 dark:bg-blue-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Sélectionnez une conversation
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-6">
                    {currentUser?.role === "admin"
                      ? "Choisissez un recruteur dans la liste pour commencer à discuter"
                      : "Choisissez un administrateur dans la liste pour commencer à discuter"}
                  </p>
                  <div className="flex justify-center">
                    <Button
                      variant="outline"
                      className="rounded-full border-blue-300 text-blue-600 hover:bg-blue-50 hover:text-blue-700"
                      onClick={() => {
                        if (filteredUsers.length > 0) {
                          setSelectedUser(filteredUsers[0])
                        }
                      }}
                      disabled={filteredUsers.length === 0}
                    >
                      Démarrer une conversation
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

