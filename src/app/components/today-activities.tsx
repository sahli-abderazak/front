import { Cake, Briefcase, Home, UserX } from "lucide-react"

const activities = [
  {
    icon: <Cake className="h-4 w-4" />,
    title: "No Birthdays Today",
    user: null,
    type: "birthday",
  },
  {
    icon: <UserX className="h-4 w-4" />,
    title: "Ralph Baker is off sick today",
    user: {
      name: "Ralph Baker",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    type: "sick",
  },
  {
    icon: <Briefcase className="h-4 w-4" />,
    title: "Danny ward is away today",
    user: {
      name: "Danny Ward",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    type: "away",
  },
  {
    icon: <Home className="h-4 w-4" />,
    title: "You are working from home today",
    user: {
      name: "You",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    type: "wfh",
  },
]

export function TodayActivities() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Today</h3>
      </div>
      <div className="space-y-4">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-center gap-4">
            <div className="p-2 bg-muted rounded-lg">{activity.icon}</div>
            <div className="flex-1">
              <p className="text-sm">{activity.title}</p>
            </div>
           
          </div>
        ))}
      </div>
    </div>
  )
}

