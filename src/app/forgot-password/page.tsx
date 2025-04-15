"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card } from "@/components/ui/card"
import { Mail, Loader2, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function ForgotPassword() {
  const [email, setEmail] = useState<string>("")
  const router = useRouter()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
      } else {
        console.error("Failed to send verification code", data.error)
        setError(data.error || "Email non trouvé")
        setShowErrorDialog(true)
      }
    } catch (error) {
      console.error("Error sending verification code", error)
      setError("Une erreur s'est produite lors de l'envoi du code")
      setShowErrorDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleContinue = () => {
    router.push(`/verify-code?email=${encodeURIComponent(email)}`)
  }

  const closeErrorDialog = () => {
    setShowErrorDialog(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-5xl overflow-hidden rounded-2xl shadow-xl">
        <div className="flex flex-col md:flex-row">
          {/* Image Section */}
          <div className="md:w-1/2 relative">
            <div
              className="h-48 md:h-full w-full bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: "url(/Logo.jpeg)",
                backgroundColor: "#ffffff",
                opacity: 0.9,
              }}
            />
          </div>

          {/* Form Section */}
          <div className="md:w-1/2 p-8 md:p-12 bg-white">
            <div className="max-w-md mx-auto">
              <Link href="/login" className="flex items-center text-[#2c4999] mb-6 hover:underline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour à la connexion
              </Link>

              <h2 className="text-3xl font-bold text-gray-900 mb-4">Mot de passe oublié</h2>
              <p className="text-gray-600 mb-8">
                Entrez votre adresse e-mail et nous vous enverrons un code de vérification pour réinitialiser votre mot
                de passe.
              </p>

              {success ? (
                <div className="space-y-6">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                    <p className="text-green-800">
                      Un code de vérification a été envoyé à votre adresse e-mail. Veuillez vérifier votre boîte de
                      réception.
                    </p>
                  </div>
                  <Button
                    onClick={handleContinue}
                    className="w-full bg-[#2c4999] hover:bg-[#233a7a] text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                  >
                    Continuer
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email"
                        className="pl-10 bg-gray-50 border border-gray-300 focus:border-[#2c4999] focus:ring-[#2c4999]"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-[#2c4999] hover:bg-[#233a7a] text-white font-semibold py-3 rounded-lg transition-colors duration-200"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Envoi en cours...
                      </>
                    ) : (
                      "Envoyer le code de vérification"
                    )}
                  </Button>
                </form>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              Erreur
            </DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-gray-700">{error}</p>
          </div>
          <DialogFooter>
            <Button onClick={closeErrorDialog} className="w-full bg-[#2c4999] hover:bg-[#233a7a]">
              Fermer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

