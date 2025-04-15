"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CheckCircle, AlertCircle, Mail, Trash2 } from "lucide-react"

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

interface Temoignage {
  id: number
  nom: string
  email: string
  temoignage: string
  valider: boolean
  created_at?: string
}

interface TemoignagesTableProps {
  refresh: boolean
}

const TemoignagesTable: React.FC<TemoignagesTableProps> = ({ refresh }) => {
  const router = useRouter()
  const [temoignages, setTemoignages] = useState<Temoignage[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [validating, setValidating] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<boolean>(false)
  const [selectedTemoignage, setSelectedTemoignage] = useState<Temoignage | null>(null)

  useEffect(() => {
    fetchTemoignages()
  }, [refresh])

  const fetchTemoignages = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour voir les témoignages.")
        return
      }

      const response = await fetch("http://127.0.0.1:8000/api/temoiniages_admin", {
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
        throw new Error("Erreur de récupération des témoignages")
      }

      const data = await response.json()
      setTemoignages(data)
      setError(null)
    } catch (error) {
      console.error("Erreur de récupération des témoignages:", error)
      setError("Erreur lors du chargement des témoignages")
    } finally {
      setLoading(false)
    }
  }

  const handleValidate = async (temoignageId: number) => {
    setValidating(temoignageId)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour valider un témoignage.")
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/temoiniages/valider/${temoignageId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Erreur lors de la validation du témoignage")
      }

      // Mettre à jour l'état local pour refléter la validation
      setTemoignages(
        temoignages.map((temoignage) =>
          temoignage.id === temoignageId ? { ...temoignage, valider: true } : temoignage,
        ),
      )
    } catch (error) {
      console.error("Erreur de validation:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de la validation du témoignage")
    } finally {
      setValidating(null)
    }
  }

  const openDeleteConfirmation = (temoignage: Temoignage) => {
    setSelectedTemoignage(temoignage)
    setConfirmDelete(true)
  }

  const handleDelete = async () => {
    if (!selectedTemoignage) return

    setDeleting(selectedTemoignage.id)
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour supprimer un témoignage.")
        setConfirmDelete(false)
        return
      }

      const response = await fetch(`http://127.0.0.1:8000/api/temoignageSupp/${selectedTemoignage.id}`, {
        method: "DELETE",
        headers: {
          Authorization:`Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || "Erreur lors de la suppression du témoignage")
      }

      // Mettre à jour l'état local pour supprimer le témoignage
      setTemoignages(temoignages.filter((temoignage) => temoignage.id !== selectedTemoignage.id))
      setConfirmDelete(false)
      setSelectedTemoignage(null)
    } catch (error) {
      console.error("Erreur de suppression:", error)
      setError(error instanceof Error ? error.message : "Erreur lors de la suppression du témoignage")
    } finally {
      setDeleting(null)
    }
  }

  if (loading) return <div className="p-4 text-gray-600 font-medium text-center">Chargement des témoignages...</div>
  if (error) return <div className="p-4 text-red-500 font-medium text-center">{error}</div>
  if (temoignages.length === 0)
    return <div className="p-4 text-gray-600 font-medium text-center">Aucun témoignage disponible.</div>

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold tracking-tight text-center">Liste des témoignages</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {temoignages.map((temoignage) => (
          <Card
            key={temoignage.id}
            className={`overflow-hidden transition-all duration-200 hover:shadow-lg h-[320px] flex flex-col ${
              temoignage.valider ? "border-green-200" : "border-yellow-200"
            }`}
          >
            <CardHeader className="pb-1 pt-3 px-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary/10 text-primary font-semibold text-xs border">
                    {temoignage.nom.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-base">{temoignage.nom}</h3>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Mail className="h-3 w-3 mr-1" />
                      <a
                        href={`https://mail.google.com/mail/?view=cm&fs=1&to=${temoignage.email}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:underline"
                      >
                        {temoignage.email}
                      </a>
                    </div>
                  </div>
                </div>
                {temoignage.valider ? (
                  <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs py-0 px-2">
                    <CheckCircle className="w-3 h-3 mr-1" /> Validé
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-yellow-100 text-yellow-800 border-yellow-200 text-xs py-0 px-2"
                  >
                    <AlertCircle className="w-3 h-3 mr-1" /> En attente
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-2 px-7 flex-grow">
              <div className="text-sm leading-relaxed bg-muted/50 p-3 rounded-md h-[160px] overflow-y-auto">
                {temoignage.temoignage}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between border-t pt-3 pb-3 px-4">
              <Button
                onClick={() => openDeleteConfirmation(temoignage)}
                variant="destructive"
                size="sm"
                className="transition-colors h-8 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Supprimer
              </Button>

              {!temoignage.valider && (
                <Button
                  onClick={() => handleValidate(temoignage.id)}
                  disabled={validating === temoignage.id}
                  variant="default"
                  size="sm"
                  className="bg-green-600 hover:bg-green-700 transition-colors h-8 text-xs"
                >
                  {validating === temoignage.id ? "Validation..." : "Valider ce témoignage"}
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Dialogue de confirmation de suppression */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer le témoignage de{" "}
              <span className="font-semibold">{selectedTemoignage?.nom}</span> ? Cette action est irréversible.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex flex-row justify-end gap-2 sm:justify-end">
            <Button variant="outline" onClick={() => setConfirmDelete(false)} className="mt-2 sm:mt-0">
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting !== null} className="mt-2 sm:mt-0">
              {deleting === selectedTemoignage?.id ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default TemoignagesTable