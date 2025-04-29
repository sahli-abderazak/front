"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Lock, Mail, Loader2, AlertCircle, Phone, MapPin, Building, Globe, FileText } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"

export default function Register() {
  const [formData, setFormData] = useState({
    // Suppression de: nom, prenom, departement, poste
    email: "",
    password: "",
    numTel: "",
    adresse: "",
    role: "recruteur",
    nom_societe: "",
    // Nouveaux champs
    apropos: "",
    lien_site_web: "",
    fax: "",
    domaine_activite: "",
  })
  const [image, setImage] = useState<File | null>(null)
  // Suppression de: cv
  const imageInputRef = useRef<HTMLInputElement>(null)
  // Suppression de: cvInputRef

  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false)
  const [successDialog, setSuccessDialog] = useState<boolean>(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [emailError, setEmailError] = useState<string | null>(null)
  const [telError, setTelError] = useState<string | null>(null)
  const [societeError, setCompanyError] = useState<string | null>(null)

  const handleGoogleLogin = () => {
    // Implement Google login
    console.log("Google login clicked")
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target

    // Réinitialiser les erreurs spécifiques lors de la modification
    if (name === "email") {
      setEmailError(null)
    }
    if (name === "password") {
      setPasswordError(null)
    }
    if (name === "numTel") {
      setTelError(null)
    }
    if (name === "nom_societe") {
      setCompanyError(null)
    }

    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImage(e.target.files[0])
    }
  }

  const validateForm = (): boolean => {
    let isValid = true

    // Validation du mot de passe (minimum 8 caractères)
    if (formData.password.length < 8) {
      setPasswordError("Le mot de passe doit contenir au moins 8 caractères")
      isValid = false
    } else {
      setPasswordError(null)
    }

    // Validation du numéro de téléphone (exactement 8 chiffres)
    const phoneRegex = /^\d{8}$/
    if (!phoneRegex.test(formData.numTel)) {
      setTelError("Le numéro de téléphone doit comporter exactement 8 chiffres")
      isValid = false
    } else {
      setTelError(null)
    }

    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation du formulaire avant envoi
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    const formDataToSend = new FormData()

    // Add all text fields
    Object.entries(formData).forEach(([key, value]) => {
      formDataToSend.append(key, value)
    })

    // Add files if they exist
    if (image) formDataToSend.append("image", image)
    // Suppression de: cv

    try {
      const response = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        body: formDataToSend,
      })

      const data = await response.json()

      if (response.ok) {
        console.log("Registration successful", data)
        // Stocker le nouveau token si nécessaire
        if (data.token) {
          sessionStorage.setItem("token", data.token)
        }
        setSuccessDialog(true)
      } else {
        // Vérifier si l'erreur concerne un email déjà existant
        if (data.error && typeof data.error === "string" && data.error.includes("email")) {
          setEmailError("Cette adresse email est déjà utilisée")
        } else if (data.error && typeof data.error === "object" && data.error.email) {
          setEmailError(Array.isArray(data.error.email) ? data.error.email[0] : data.error.email)
        }
        // Vérifier si l'erreur concerne une société déjà inscrite
        else if (data.error && typeof data.error === "string" && data.error.includes("societe")) {
          setCompanyError("Cette société est déjà inscrite")
        } else if (data.error && typeof data.error === "object" && data.error.nom_societe) {
          setCompanyError(Array.isArray(data.error.nom_societe) ? data.error.nom_societe[0] : data.error.nom_societe)
        } else {
          setError(
            typeof data.error === "object"
              ? Object.values(data.error).flat().join(", ")
              : data.error || "L'inscription a échoué",
          )
          setShowErrorDialog(true)
        }
      }
    } catch (error) {
      console.error("Erreur d'inscription", error)
      setError("Une erreur s'est produite lors de l'inscription")
      setShowErrorDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  const closeErrorDialog = () => {
    setShowErrorDialog(false)
  }

  const closeSuccessDialog = () => {
    setSuccessDialog(false)
    router.push(`/verify?email=${encodeURIComponent(formData.email)}`)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl bg-white/95 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-2/5 relative">
            <div
              className="h-48 md:h-full w-full flex items-center justify-center p-4"
              style={{
                backgroundColor: "#ffffff",
                opacity: 1,
              }}
            >
              <img
                src="/signup.webp"
                alt="Logo"
                className="w-auto h-auto object-contain"
                style={{
                  maxWidth: "100%",
                  maxHeight: "100%",
                  width: "700px",
                  height: "400px",
                  borderRadius: "50%",
                }}
              />
            </div>
          </div>

          {/* Form Section */}
          <div className="md:w-3/5 p-8 md:p-12 bg-white overflow-y-auto max-h-[90vh]">
            <div className="max-w-md mx-auto">
              <h2 className="text-4xl font-extrabold text-gray-900 mb-8 tracking-tight">Créer un compte</h2>

              <form onSubmit={handleSubmit} className="space-y-3">
                 {/* Nom de la société */}
                 <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="nom_societe">
                    Nom de la société
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="nom_societe"
                      name="nom_societe"
                      type="text"
                      placeholder="Entrez le nom de votre société"
                      className={`pl-10 bg-white border ${societeError ? "border-red-500" : "border-gray-300"} focus:border-[#2c4999] focus:ring-[#2c4999] rounded-lg shadow-sm transition-all duration-200`}
                      required
                      value={formData.nom_societe}
                      onChange={handleChange}
                    />
                  </div>
                  {societeError && <p className="text-red-500 text-sm mt-1">Cette société est déjà inscrite.</p>}
                </div>
                {/* Email */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="email">
                    E-mail
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="Entrez votre email"
                      className={`pl-10 bg-white border ${emailError ? "border-red-500" : "border-gray-300"} focus:border-[#2c4999] focus:ring-[#2c4999] rounded-lg shadow-sm transition-all duration-200`}
                      required
                      value={formData.email}
                      onChange={handleChange}
                    />
                  </div>
                  {emailError && <p className="text-red-500 text-sm mt-1">Cette adresse e-mail est déjà utilisée.</p>}
                </div>

                {/* Mot de passe */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="password">
                    Mot de passe
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="Créez votre mot de passe"
                      className={`pl-10 bg-white border ${passwordError ? "border-red-500" : "border-gray-300"} focus:border-[#2c4999] focus:ring-[#2c4999] rounded-lg shadow-sm transition-all duration-200`}
                      required
                      value={formData.password}
                      onChange={handleChange}
                    />
                  </div>
                  {passwordError && <p className="text-red-500 text-sm mt-1">{passwordError}</p>}
                </div>

               

                {/* Domaine d'activité */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="domaine_activite">
                    Domaine d'activité
                  </Label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <Input
                      id="domaine_activite"
                      name="domaine_activite"
                      type="text"
                      placeholder="Entrez votre domaine d'activité"
                      className="pl-10 bg-white border border-gray-300 focus:border-[#2c4999] focus:ring-[#2c4999] rounded-lg shadow-sm transition-all duration-200"
                      required
                      value={formData.domaine_activite}
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="flex space-x-4">
                  {/* Téléphone */}
                  <div className="w-1/2 space-y-2">
                    <Label className="text-sm font-medium text-gray-700" htmlFor="numTel">
                      Téléphone
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="numTel"
                        name="numTel"
                        type="tel"
                        placeholder="Entrez votre téléphone"
                        className={`pl-10 bg-white border ${telError ? "border-red-500" : "border-gray-300"} focus:border-[#2c4999] focus:ring-[#2c4999] rounded-lg shadow-sm transition-all duration-200`}
                        required
                        value={formData.numTel}
                        onChange={handleChange}
                      />
                    </div>
                    {telError && <p className="text-red-500 text-sm mt-1">{telError}</p>}
                  </div>

                  {/* Fax */}
                  <div className="w-1/2 space-y-2">
                    <Label className="text-sm font-medium text-gray-700" htmlFor="fax">
                      Fax
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="fax"
                        name="fax"
                        type="text"
                        placeholder="Entrez votre fax"
                        className="pl-10 bg-white border border-gray-300 focus:border-[#2c4999] focus:ring-[#2c4999] rounded-lg shadow-sm transition-all duration-200"
                        value={formData.fax}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* Adresse et Site Web */}
                <div className="flex space-x-4">
                  {/* Adresse */}
                  <div className="w-1/2 space-y-2">
                    <Label className="text-sm font-medium text-gray-700" htmlFor="adresse">
                      Adresse
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="adresse"
                        name="adresse"
                        type="text"
                        placeholder="Entrez votre adresse"
                        className="pl-10 bg-white border border-gray-300 focus:border-[#2c4999] focus:ring-[#2c4999] rounded-lg shadow-sm transition-all duration-200"
                        required
                        value={formData.adresse}
                        onChange={handleChange}
                      />
                    </div>
                  </div>

                  {/* Site Web */}
                  <div className="w-1/2 space-y-2">
                    <Label className="text-sm font-medium text-gray-700" htmlFor="lien_site_web">
                      Site Web
                    </Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Globe className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="lien_site_web"
                        name="lien_site_web"
                        type="url"
                        placeholder="https://www.example.com"
                        className="pl-10 bg-white border border-gray-300 focus:border-[#2c4999] focus:ring-[#2c4999] rounded-lg shadow-sm transition-all duration-200"
                        value={formData.lien_site_web}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                </div>

                {/* À propos */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="apropos">
                    À propos
                  </Label>
                  <Textarea
                    id="apropos"
                    name="apropos"
                    placeholder="Décrivez votre entreprise"
                    className="min-h-[100px] bg-white border border-gray-300 focus:border-[#2c4999] focus:ring-[#2c4999] rounded-lg shadow-sm transition-all duration-200"
                    value={formData.apropos}
                    onChange={handleChange}
                  />
                </div>

                {/* Image de profil */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700" htmlFor="image">
                    Logo de l'entreprise
                  </Label>
                  <input
                    ref={imageInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="w-full text-sm text-gray-500 file:bg-[#e1eff9] file:px-4 file:py-2 file:rounded-md file:border-none file:text-[#39739d] cursor-pointer"
                    required
                  />
                </div>

                <input type="hidden" name="role" value={formData.role} />

                {/* Submit Button */}
                <div className="space-y-2">
                  <Button
                    type="submit"
                    className="w-full py-3 bg-[#2c4999] text-white hover:bg-[#1b375b]"
                    disabled={isLoading}
                  >
                    {isLoading ? <Loader2 className="animate-spin h-5 w-5 mr-3" /> : "S'inscrire"}
                  </Button>
                </div>
                <div className="mt-6 space-y-4">
                  <Button
                    onClick={handleGoogleLogin}
                    className="w-full border border-red-500 text-red-500 bg-white hover:bg-red-100 py-3 rounded-lg flex items-center justify-center space-x-2"
                  >
                    <Mail className="h-5 w-5" />
                    <span>S'inscrire avec Google</span>
                  </Button>
                </div>
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600">
                    Vous avez déja un compte?{" "}
                    <Link href="/login" className="text-[#2c4999] hover:underline">
                      Se connecter
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </Card>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={closeErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-red-600">
              <AlertCircle className="inline mr-2" size={24} /> Une erreur s'est produite
            </DialogTitle>
          </DialogHeader>
          <p className="text-red-500">{error}</p>
          <DialogFooter>
            <Button variant="outline" onClick={closeErrorDialog}>
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Success Dialog */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-xl text-green-600">Inscription réussie</DialogTitle>
          </DialogHeader>
          <p className="text-gray-700">
            Votre compte a été créé avec succès. Un code de vérification a été envoyé à votre adresse email. Veuillez
            vérifier votre boîte de réception et entrer le code pour activer votre compte.
          </p>
          <DialogFooter>
            <Button onClick={closeSuccessDialog} className="bg-[#2c4999] hover:bg-[#1b375b]">
              Continuer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

