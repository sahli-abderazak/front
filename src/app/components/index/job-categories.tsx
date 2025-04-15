"use client"

import Link from "next/link"
import { Briefcase, LineChart, PenTool, Code, Users, BarChart3, HeadphonesIcon, Stethoscope, Car, Truck, Factory, Gavel } from "lucide-react"

const categories = [
  {
    icon: <LineChart className="h-6 w-6 text-blue-500" />,
    title: "Comptabilité / Finance",
  },
  {
    icon: <BarChart3 className="h-6 w-6 text-purple-500" />,
    title: "Marketing",
  },
  {
    icon: <PenTool className="h-6 w-6 text-orange-500" />,
    title: "Design",
  },
  {
    icon: <Code className="h-6 w-6 text-green-500" />,
    title: "Développement",
  },
  {
    icon: <Users className="h-6 w-6 text-pink-500" />,
    title: "Ressources Humaines",
  },
  {
    icon: <Briefcase className="h-6 w-6 text-indigo-500" />,
    title: "Gestion de Projet",
  },
  {
    icon: <HeadphonesIcon className="h-6 w-6 text-red-500" />,
    title: "Service Client",
  },
  {
    icon: <Truck className="h-6 w-6 text-teal-500" />,
    title: "Logistique ",
  },
  {
    icon: <Factory className="h-6 w-6 text-amber-500" />,
    title: "Production",
  },
  {
    icon: <Gavel className="h-6 w-6 text-amber-500" />,
    title: "Juridique",
  },
]

export default function JobCategories() {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Nos Départements</h2>
          <p className="text-muted-foreground">Plus que 10 département</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {categories.map((category, index) => (
            <Link
              key={index}
              href="#"
              className="flex flex-col items-center p-6 rounded-lg border bg-background hover:shadow-md transition-shadow text-center group"
            >
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-4 group-hover:bg-primary/10 transition-colors">
                {category.icon}
              </div>
              <h3 className="font-medium mb-1 group-hover:text-primary transition-colors">{category.title}</h3>
              
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}