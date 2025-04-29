import { type NextRequest, NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET(request: NextRequest, { params }: { params: { candidat_id: string; offre_id: string } }) {
  try {
    // Vérifier l'authentification (à adapter selon votre système d'authentification)
    // const token = request.headers.get("Authorization")?.split(" ")[1]
    // if (!token) {
    //   return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    // }

    const candidatId = params.candidat_id
    const offreId = params.offre_id

    if (!candidatId || !offreId) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 })
    }

    // Chemin vers le dossier de stockage des tests
    const storageDir = path.join(process.cwd(), "storage", "tests")

    // Vérifier si le dossier existe, sinon le créer
    if (!fs.existsSync(storageDir)) {
      return NextResponse.json({ error: "Aucun test disponible" }, { status: 404 })
    }

    // Nom du fichier basé sur candidat_id et offre_id
    const filename = `test_${candidatId}_${offreId}.json`
    const filePath = path.join(storageDir, filename)

    // Vérifier si le fichier existe
    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: "Test non trouvé pour ce candidat" }, { status: 404 })
    }

    // Lire le fichier JSON
    const fileContent = fs.readFileSync(filePath, "utf8")
    const testData = JSON.parse(fileContent)

    return NextResponse.json(testData)
  } catch (error) {
    console.error("Erreur lors de la récupération du test:", error)
    return NextResponse.json({ error: "Erreur lors de la récupération du test" }, { status: 500 })
  }
}
