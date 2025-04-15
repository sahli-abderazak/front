"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { CheckCircle, AlertCircle, Loader2, Mail } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"

export default function VerifyCode() {
  const searchParams = useSearchParams()
  const email = searchParams.get("email") || ""
  const [verificationCode, setVerificationCode] = useState<string>("")
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<boolean>(false)
  const [showErrorDialog, setShowErrorDialog] = useState<boolean>(false)
  const router = useRouter()

  // Fonction pour gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/api/verify-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          verification_code: verificationCode,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        setSuccess(true)
        // Rediriger vers la page de connexion après 3 secondes
        setTimeout(() => {
          router.push("/login")
        }, 3000)
      } else {
        console.error("Verification failed", data.error)
        setError(data.error || "Le code de vérification est incorrect")
        setShowErrorDialog(true)
      }
    } catch (error) {
      console.error("Erreur de vérification", error)
      setError("Une erreur s'est produite lors de la vérification")
      setShowErrorDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  // Fonction pour renvoyer le code de vérification
  const handleResendCode = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("http://127.0.0.1:8000/api/resend-verification-code", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        // Afficher un message de succès dans la boîte de dialogue
        setError("Un nouveau code de vérification a été envoyé à votre adresse email")
        setShowErrorDialog(true)
      } else {
        console.error("Code resend failed", data.error)
        setError(data.error || "Erreur lors du renvoi du code")
        setShowErrorDialog(true)
      }
    } catch (error) {
      console.error("Erreur lors du renvoi du code", error)
      setError("Une erreur s'est produite lors du renvoi du code")
      setShowErrorDialog(true)
    } finally {
      setIsLoading(false)
    }
  }

  const closeErrorDialog = () => {
    setShowErrorDialog(false)
  }

  // Rediriger si l'email n'est pas fourni
  useEffect(() => {
    if (!email) {
      router.push("/login")
    }
  }, [email, router])

  if (!email) {
    return null
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md overflow-hidden rounded-2xl shadow-xl">
        <CardHeader className="text-center pb-6">
          <CardTitle className="text-2xl font-bold text-gray-900">Vérification du compte</CardTitle>
          <CardDescription>
            Un code de vérification a été envoyé à <span className="font-medium">{email}</span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <CheckCircle className="mx-auto h-16 w-16 text-green-500" />
              <h3 className="text-xl font-medium text-gray-900">Compte vérifié avec succès!</h3>
              <p className="text-gray-600">
                Votre compte a été activé. Vous allez être redirigé vers la page de connexion...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="verification-code">Code de vérification</Label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <Input
                    id="verification-code"
                    type="text"
                    placeholder="Entrez le code à 6 caractères"
                    className="pl-10 bg-gray-50 border border-gray-300 focus:border-[#2c4999] focus:ring-[#2c4999]"
                    required
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value)}
                    maxLength={6}
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
                    Vérification...
                  </>
                ) : (
                  "Vérifier"
                )}
              </Button>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Vous n'avez pas reçu de code?{" "}
                  <button
                    type="button"
                    onClick={handleResendCode}
                    className="text-[#2c4999] hover:underline"
                    disabled={isLoading}
                  >
                    Renvoyer le code
                  </button>
                </p>
              </div>

              <div className="text-center mt-4">
                <p className="text-sm text-gray-600">
                  Retourner à la{" "}
                  <Link href="/login" className="text-[#2c4999] hover:underline">
                    page de connexion
                  </Link>
                </p>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Error Dialog */}
      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center text-red-600">
              <AlertCircle className="h-6 w-6 mr-2" />
              Erreur de vérification
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

