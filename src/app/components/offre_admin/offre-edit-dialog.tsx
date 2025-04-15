"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface Offre {
  id: number
  departement: string
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
  valider: boolean
}

interface OffreEditDialogProps {
  offre: Offre | null
  isOpen: boolean
  onClose: () => void
  onOffreUpdated: () => void
  isExpiringSoon?: boolean
}

export function OffreEditDialog({
  offre,
  isOpen,
  onClose,
  onOffreUpdated,
  isExpiringSoon = false,
}: OffreEditDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [formData, setFormData] = useState<Partial<Offre>>({
    departement: "",
    poste: "",
    description: "",
    dateExpiration: "",
  })

  useEffect(() => {
    if (offre) {
      setFormData({
        departement: offre.departement,
        poste: offre.poste,
        description: offre.description,
        dateExpiration: offre.dateExpiration.split("T")[0],
      })
    }
  }, [offre])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!offre) return

    setLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Vous devez être connecté pour modifier une offre.")
        return
      }

      // Si l'offre est validée et expire bientôt, on n'envoie que la date d'expiration
      const dataToSend = offre.valider && isExpiringSoon ? { dateExpiration: formData.dateExpiration } : formData

      // Utiliser un endpoint différent pour les offres validées qui expirent bientôt
      const endpoint =
        offre.valider && isExpiringSoon
          ? `http://127.0.0.1:8000/api/prolonger-offre/${offre.id}`
          : `http://127.0.0.1:8000/api/offres-departement/${offre.id}`

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: {
          Authorization:` Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataToSend),
      })

      const data = await response.json()

      if (!response.ok) {
        if (response.status === 400 && data.error) {
          setError(data.error)
        } else {
          throw new Error("Erreur lors de la modification de l'offre")
        }
        return
      }

      setSuccess("Offre modifiée avec succès !")
      onOffreUpdated() // Rafraîchir la liste des offres

      setTimeout(() => {
        onClose()
        setSuccess(null)
      }, 2000)
    } catch (error) {
      setError("Erreur lors de la modification de l'offre.")
    } finally {
      setLoading(false)
    }
  }

  const today = new Date().toISOString().split("T")[0]

  if (!offre) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Modifier l'offre</DialogTitle>
          <DialogDescription>
            Modifiez les informations de l'offre d'emploi.
            {offre.valider && !isExpiringSoon && (
              <span className="block text-yellow-600 mt-2">
                Attention : Cette offre est déjà validée et ne peut pas être modifiée.
              </span>
            )}
            {offre.valider && isExpiringSoon && (
              <span className="block text-yellow-600 mt-2">
                Attention : Cette offre est déjà validée. Vous pouvez uniquement prolonger la date d'expiration.
              </span>
            )}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="departement" className="text-right">
                Département
              </Label>
              <Input
                id="departement"
                name="departement"
                value={formData.departement}
                onChange={handleInputChange}
                className="col-span-3"
                disabled
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="poste" className="text-right">
                Poste
              </Label>
              <Input
                id="poste"
                name="poste"
                value={formData.poste}
                onChange={handleInputChange}
                className="col-span-3"
                disabled={offre.valider || isExpiringSoon}
              />
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right pt-2">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                className="col-span-3 min-h-[100px]"
                disabled={offre.valider || isExpiringSoon}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="dateExpiration" className="text-right">
                Date d'expiration
              </Label>
              <Input
                id="dateExpiration"
                name="dateExpiration"
                type="date"
                min={today}
                value={formData.dateExpiration}
                onChange={handleInputChange}
                className="col-span-3"
                disabled={offre.valider && !isExpiringSoon}
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          {success && <p className="text-green-500 text-sm mt-2">{success}</p>}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || (offre.valider && !isExpiringSoon)}>
              {loading
                ? "Modification en cours..."
                : offre.valider && isExpiringSoon
                  ? "Prolonger l'offre"
                  : "Modifier l'offre"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}