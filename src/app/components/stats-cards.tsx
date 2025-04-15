import { Card, CardContent } from "@/components/ui/card"
import { Users, Building2, Briefcase, DollarSign } from "lucide-react"

export function StatsCards() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-6 w-6 text-blue-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Employees</p>
              <h3 className="text-2xl font-bold">700</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Building2 className="h-6 w-6 text-yellow-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Companies</p>
              <h3 className="text-2xl font-bold">30</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-red-100 rounded-lg">
              <Briefcase className="h-6 w-6 text-red-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Leaves</p>
              <h3 className="text-2xl font-bold">3</h3>
            </div>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-700" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Salary</p>
              <h3 className="text-2xl font-bold">$5.8M</h3>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

