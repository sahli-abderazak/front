import { Calendar } from "lucide-react"

const leaves = [
  { date: "Mon, 16 Dec 2023", status: "upcoming" },
  { date: "Fri, 20 Dec 2023", status: "upcoming" },
  { date: "Wed, 25 Dec 2023", status: "upcoming" },
  { date: "Fri, 27 Dec 2023", status: "upcoming" },
  { date: "Tue, 31 Dec 2023", status: "upcoming" },
]

export function UpcomingLeaves() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Your Upcoming Leave</h3>
      </div>
      <div className="space-y-4">
        {leaves.map((leave, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="p-2 bg-muted rounded-lg">
              <Calendar className="h-4 w-4" />
            </div>
            <p className="text-sm font-medium">{leave.date}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

