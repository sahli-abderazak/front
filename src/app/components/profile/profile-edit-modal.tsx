"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Upload } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface UserData {
  id: number
  email: string
  numTel?: string
  password?: string
  adresse?: string
  image?: string
  nom_societe?: string
  role?: string
  // Nouveaux champs
  apropos?: string
  lien_site_web?: string
  fax?: string
  domaine_activite?: string
}

interface ProfileEditModalProps {
  isOpen: boolean
  onClose: () => void
  userData: UserData | null
  onSuccess: () => void
}

const API_BASE_URL = "http://127.0.0.1:8000"

export default function ProfileEditModal({ isOpen, onClose, userData, onSuccess }: ProfileEditModalProps) {
  const [formData, setFormData] = useState<UserData | null>(null)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const imageInputRef = useRef<HTMLInputElement>(null)

  const [cvFile, setCvFile] = useState<File | null>(null)
  const [cvFileName, setCvFileName] = useState<string | null>(null)
  const cvInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (userData) {
      setFormData({
        ...userData,
        password: "",
      })
      setImagePreview(userData.image || null)
      setCvFileName(userData.cv ? userData.cv.split("/").pop() : null)
    }
  }, [userData, isOpen])

  useEffect(() => {
    const token = localStorage.getItem("token") || localStorage.getItem("auth_token")
    if (!token) {
      setError("Session expirée. Veuillez vous reconnecter.")
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      if (file.size > 2 * 1024 * 1024) {
        setError("L'image ne doit pas dépasser 2MB")
        return
      }
      setImageFile(file)
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagePreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleCvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0]
      if (file.size > 5 * 1024 * 1024) {
        setError("Le CV ne doit pas dépasser 5MB")
        return
      }
      setCvFile(file)
      setCvFileName(file.name)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    if (!formData || !userData) {
      setError("Données utilisateur non disponibles")
      setIsSubmitting(false)
      return
    }

    try {
      // Get and validate the authentication token
      const token = localStorage.getItem("token") || localStorage.getItem("auth_token")
      if (!token) {
        setError("Session expirée. Veuillez vous reconnecter.")
        setIsSubmitting(false)
        return
      }

      const formDataToSend = new FormData()
      formDataToSend.append("_method", "PUT")

      // Add text fields
      Object.entries(formData).forEach(([key, value]) => {
        if (value && key !== "id" && key !== "image" && key !== "cv") {
          formDataToSend.append(key, value.toString())
        }
      })

      // Add files if changed
      if (imageFile) formDataToSend.append("image", imageFile)
      if (cvFile) formDataToSend.append("cv", cvFile)

      // Validate token format
      let response
      if (!token.startsWith("Bearer ") && !token.startsWith("bearer ")) {
        const formattedToken = `Bearer ${token}`

        // Update headers with properly formatted token
        response = await fetch(`${API_BASE_URL}/api/user/updateRec/${userData.id}`, {
          method: "POST",
          headers: {
            Authorization: formattedToken,
            Accept: "application/json",
          },
          body: formDataToSend,
        })
      } else {
        // Token already has Bearer prefix
        response = await fetch(`${API_BASE_URL}/api/user/updateRec/${userData.id}`, {
          method: "POST",
          headers: {
            Authorization: token,
            Accept: "application/json",
          },
          body: formDataToSend,
        })
      }

      if (!response.ok) {
        const contentType = response.headers.get("content-type")
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json()
          throw new Error(errorData.message || errorData.error || "Erreur lors de la mise à jour")
        } else {
          const errorText = await response.text()
          console.error("Non-JSON error response:", errorText)
          throw new Error(`Erreur ${response.status}: Le serveur a retourné une réponse invalide`)
        }
      }

      const result = await response.json()
      onSuccess()
      onClose()
    } catch (err) {
      console.error("Error updating profile:", err)
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Modifier votre profil</DialogTitle>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex flex-col items-center mb-6">
            <div className="relative w-24 h-24 mb-4 overflow-hidden rounded-full border">
              <Image src={imagePreview || "/placeholder.svg"} alt="Photo de profil" fill className="object-cover" />
            </div>

            <input
              type="file"
              ref={imageInputRef}
              onChange={handleImageChange}
              accept="image/jpeg,image/png,image/jpg"
              className="hidden"
            />

            <Button type="button" variant="outline" size="sm" onClick={() => imageInputRef.current?.click()}>
              <Upload className="w-4 h-4 mr-2" />
              Changer la photo
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="nom_societe">Nom de l'entreprise</Label>
              <Input
                id="nom_societe"
                name="nom_societe"
                value={formData?.nom_societe || ""}
                onChange={handleInputChange}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData?.email || ""}
                onChange={handleInputChange}
                readOnly
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="numTel">Téléphone</Label>
              <Input id="numTel" name="numTel" value={formData?.numTel || ""} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="fax">Fax</Label>
              <Input id="fax" name="fax" value={formData?.fax || ""} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="adresse">Adresse</Label>
              <Input id="adresse" name="adresse" value={formData?.adresse || ""} onChange={handleInputChange} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lien_site_web">Site Web</Label>
              <Input
                id="lien_site_web"
                name="lien_site_web"
                type="url"
                value={formData?.lien_site_web || ""}
                onChange={handleInputChange}
                placeholder="https://example.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="domaine_activite">Domaine d'activité</Label>
              <Input
                id="domaine_activite"
                name="domaine_activite"
                value={formData?.domaine_activite || ""}
                onChange={handleInputChange}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData?.password || ""}
                onChange={handleInputChange}
                placeholder="Laisser vide si inchangé"
              />
            </div>

            <div className="space-y-2 sm:col-span-2">
              <Label htmlFor="apropos">À propos</Label>
              <textarea
                id="apropos"
                name="apropos"
                value={formData?.apropos || ""}
                onChange={handleInputChange}
                rows={4}
                className="w-full min-h-[80px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="Description de votre entreprise"
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Annuler
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

