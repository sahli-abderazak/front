import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

export function WelcomeBanner() {
  return (
    <div className="relative overflow-hidden rounded-lg bg-gradient-to-r from-purple-600 to-blue-600 p-8 text-white">
      <div className="relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Welcome back, Recruter! 👋</h1>
            <p className="text-purple-100 max-w-xl">
              Here's what's happening with your team today. Check out the latest updates and manage your tasks.
            </p>
          </div>
          <Button variant="secondary" className="bg-white text-purple-600 hover:bg-purple-50">
            View Reports
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
      {/* Decorative elements */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-purple-500 opacity-20 blur-3xl" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-blue-500 opacity-20 blur-3xl" />
    </div>
  )
}

