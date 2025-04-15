"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import "../styles/user-dialogs.css"

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
}

interface UserDetailsDialogProps {
  user: User | null
  isOpen: boolean
  onClose: () => void
}

export function UserDetailsDialog({ user, isOpen, onClose }: UserDetailsDialogProps) {
  if (!user) return null

  // Function to handle email click
  const handleEmailClick = (email: string) => {
    // Open Gmail compose with the email as recipient
    window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}`, "_blank")
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="user-details-dialog sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle className="dialog-title">Détails du recruteur</DialogTitle>
        </DialogHeader>

        <div className="user-details-content">
          {/* Profile header with image and name */}
          <div className="profile-header">
            <div className="profile-image-container" style={{ width: "100px", height: "100px" }}>
              {user.image ? (
                <Image
                  src={user.image || "/placeholder.svg"}
                  alt={`Logo de ${user.nom_societe}`}
                  width={100}
                  height={100}
                  unoptimized
                  className="profile-image"
                />
              ) : (
                <div className="profile-image-placeholder">{user.nom_societe?.[0]}</div>
              )}
            </div>
            <h2 className="profile-name text-lg">{user.nom_societe || "Entreprise"}</h2>
            <div className="profile-position text-sm">{user.domaine_activite || "Domaine non spécifié"}</div>
            <div className="profile-company text-xs">{user.role || "Rôle non spécifié"}</div>
          </div>

          {/* User information */}
          <div className="info-section p-3">
            <h3 className="section-title text-sm mb-2">Informations de contact</h3>

            <div className="info-grid gap-2">
              <div className="info-item">
                <div className="info-icon">📧</div>
                <div className="info-content">
                  <Label className="info-label">Email</Label>
                  <div
                    className="info-value cursor-pointer hover:text-primary hover:underline"
                    onClick={() => handleEmailClick(user.email)}
                  >
                    {user.email}
                  </div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📱</div>
                <div className="info-content">
                  <Label className="info-label">Téléphone</Label>
                  <div className="info-value">{user.numTel || "Non renseigné"}</div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📠</div>
                <div className="info-content">
                  <Label className="info-label">Fax</Label>
                  <div className="info-value">{user.fax || "Non renseigné"}</div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📍</div>
                <div className="info-content">
                  <Label className="info-label">Adresse</Label>
                  <div className="info-value">{user.adresse || "Non renseignée"}</div>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">📅</div>
                <div className="info-content">
                  <Label className="info-label">Date d'inscription</Label>
                  <div className="info-value">{new Intl.DateTimeFormat("fr-FR").format(new Date(user.created_at))}</div>
                </div>
              </div>

              {user.lien_site_web && (
                <div className="info-item">
                  <div className="info-icon">🌐</div>
                  <div className="info-content">
                    <Label className="info-label">Site Web</Label>
                    <a href={user.lien_site_web} target="_blank" rel="noopener noreferrer" className="cv-link">
                      Visiter le site
                    </a>
                  </div>
                </div>
              )}

              {user.apropos && (
                <div className="info-item col-span-full">
                  <div className="info-icon">📝</div>
                  <div className="info-content">
                    <Label className="info-label">À propos</Label>
                    <div className="info-value">{user.apropos}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}