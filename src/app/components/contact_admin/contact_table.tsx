"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Send, Trash2, Clock, CheckCircle } from "lucide-react"

interface Message {
  id: number
  nom: string
  email: string
  sujet: string
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

  useEffect(() => {
    fetchMessages()
  }, [refresh])

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem("token")
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

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem("token")
          router.push("/auth/login")
          return
        }
        throw new Error(`Erreur ${response.status}`)
      }

      const data = await response.json()
      setMessages(data)
      setError(null)
    } catch (error) {
      console.error("Erreur de récupération des messages:", error)
      setError("Erreur lors du chargement des messages")
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async (messageId: number, email: string) => {
    setReplying(messageId)
    try {
      window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, "_blank")
      const token = localStorage.getItem("token")
      if (!token) return

      setMessages(messages.map((message) => (message.id === messageId ? { ...message, repondu: true } : message)))

      await fetch("http://127.0.0.1:8000/api/markasreplied/" + messageId, {
        method: "PUT",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      })
    } catch (error) {
      console.error("Erreur:", error)
    } finally {
      setReplying(null)
    }
  }

  const handleDelete = async (messageId: number) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce message ?")) return

    setDeleting(messageId)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      await fetch("http://127.0.0.1:8000/api/deleteContact/" + messageId, {
        method: "DELETE",
        headers: {
          Authorization: "Bearer " + token,
          "Content-Type": "application/json",
        },
      })

      setMessages(messages.filter((message) => message.id !== messageId))
    } catch (error) {
      console.error("Erreur de suppression:", error)
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="p-4 text-gray-600">Chargement des messages...</div>
  if (error) return <div className="p-4 text-red-500">{error}</div>
  if (messages.length === 0) return <div className="p-4 text-gray-600">Aucun message disponible.</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {messages.map((message) => (
        <div
          key={message.id}
          className={`bg-white rounded-lg border ${
            message.repondu ? "border-l-4 border-l-green-500" : "border-l-4 border-l-blue-500"
          } h-[400px] flex flex-col`}
        >
          <div className="p-4 flex flex-col h-full">
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center text-white font-medium">
                  {message.nom.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-medium">{message.nom}</h3>
                  <p className="text-gray-500 text-sm">{message.email}</p>
                </div>
              </div>
              <div
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-sm ${
                  message.repondu ? "bg-green-50 text-green-700" : "bg-blue-50 text-blue-700"
                }`}
              >
                {message.repondu ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                {message.repondu ? "Répondu" : "Non répondu"}
              </div>
            </div>

            {/* Content - Using flex-grow to take remaining space */}
            <div className="flex-grow overflow-hidden">
              <div className="h-full flex flex-col">
                <div className="mb-3">
                  <p className="text-gray-500 text-xs mb-1">SUJET</p>
                  <p className="font-medium">{message.sujet}</p>
                </div>
                <div className="flex-grow overflow-hidden">
                  <p className="text-gray-500 text-xs mb-1">MESSAGE</p>
                  <div className="bg-gray-50 rounded p-3 text-sm h-[180px] overflow-y-auto">{message.message}</div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex justify-between pt-4 border-t mt-4">
              <button
                onClick={() => handleDelete(message.id)}
                disabled={deleting === message.id}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                Supprimer
              </button>

              <button
                onClick={() => handleReply(message.id, message.email)}
                disabled={replying === message.id}
                className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                  message.repondu ? "text-green-600 hover:bg-green-50" : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                <Send className="w-4 h-4" />
                {message.repondu ? "Envoyer un autre email" : "Répondre par email"}
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default MessagesTable

