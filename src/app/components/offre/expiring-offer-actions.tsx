"use client"

import type React from "react"

interface Offre {
  id: number
  domaine: string
  departement: string
  poste: string
  description: string
  datePublication: string
  dateExpiration: string
  valider: boolean
}

interface ExpiringOfferActionsProps {
  offre: Offre
  onValidate: (id: number) => void
  onDelete: (id: number) => void
}

const ExpiringOfferActions: React.FC<ExpiringOfferActionsProps> = ({ offre, onValidate, onDelete }) => {
  const daysLeft = () => {
    const expirationDate = new Date(offre.dateExpiration)
    const today = new Date()
    const diff = expirationDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diff / (1000 * 3600 * 24))
    return diffDays
  }

  return (
    <div>
      {daysLeft() <= 7 && <div style={{ color: "red" }}>Expires in {daysLeft()} days!</div>}
      <button onClick={() => onValidate(offre.id)}>Validate</button>
      <button onClick={() => onDelete(offre.id)}>Delete</button>
    </div>
  )
}

export default ExpiringOfferActions