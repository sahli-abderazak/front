"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { MapPin, Clock, GraduationCap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

// Update the interface to match your database field names
interface JobOffer {
  id: number
  poste: string // nom de poste
  societe: string // nom de societe
  ville: string // ville
  heureTravail: string // heure de travaille
  niveauEtude: string // niveau d'etude
  typeTravail: string // type de travaille
  typePoste: string // type de poste
  statut: "urgent" | "normal"
  dateExpiration: string
}

export default function FeaturedJobs() {
  const [jobs, setJobs] = useState<JobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        setLoading(true)
        // Fetch job offers from your API endpoint
        const response = await fetch("http://127.0.0.1:8000/api/offres-candidat")

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des offres")
        }

        const data = await response.json()

        // Limit to 6 job offers for the featured section
        setJobs(data.slice(0, 6))
      } catch (err) {
        console.error("Erreur:", err)
        setError("Impossible de charger les offres d'emploi")
      } finally {
        setLoading(false)
      }
    }

    fetchJobs()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nos annonces</h2>
            <p className="text-muted-foreground">Chargement des offres d'emploi...</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="border rounded-lg p-6 bg-background animate-pulse h-64"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Nos annonces</h2>
            <p className="text-red-500">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  // Update the job card rendering to use the correct field names and display tags
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nos annonces</h2>
          <p className="text-muted-foreground">Connaissez votre valeur et trouvez le poste qui vous convient</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job) => (
            <div
              key={job.id}
              className="border rounded-lg p-6 bg-background hover:shadow-md transition-shadow relative group"
            >
              <div className="flex items-start gap-4 mb-4">
                <div>
                  <h3 className="font-semibold mb-1 group-hover:text-primary transition-colors">
                    {job.poste}
                  </h3>
                  <p className="text-sm text-muted-foreground">{job.societe}</p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 mr-2" />
                  {job.ville}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <Clock className="h-4 w-4 mr-2" />
                  {job.heureTravail}
                </div>
                <div className="flex items-center text-sm text-muted-foreground">
                  <GraduationCap className="h-4 w-4 mr-2" />
                  {job.niveauEtude}
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between pt-4 border-t gap-2">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="bg-blue-100 text-blue-600 border-blue-200">
                    {job.typeTravail}
                  </Badge>
                  <Badge variant="outline" className="bg-green-100 text-green-600 border-green-200">
                    {job.typePoste}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      job.statut === "urgent"
                        ? "bg-red-100 text-red-600 border-red-200"
                        : "bg-black/10 text-grey border-grey/20"
                    }
                  >
                    {job.statut === "urgent" ? "Urgent" : "Normal"}
                  </Badge>
                </div>
                <Link href={`/jobsDetail/${job.id}`} className="text-sm font-medium text-muted-foreground hover:underline">
                  Voir detail
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-10">
          <Button variant="outline" size="lg" className="bg-[#1967d2] text-white hover:bg-[#155ab6]">
            <Link href="/jobs">Charger plus d'annonces</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}