
const activities = [
  {
    user: {
      name: "Danny Ward",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    message: "Lorem ipsum dolor sit amet, id id quo eruditi eloquentiam.",
    time: "1 hour ago",
  },
  {
    user: {
      name: "John Gibbs",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    message: "Lorem ipsum dolor sit amet, id quo eruditi eloquentiam.",
    time: "2 hours ago",
  },
  {
    user: {
      name: "Maria Cotton",
      avatar: "/placeholder.svg?height=40&width=40",
    },
    message: "Lorem ipsum dolor sit amet, id quo eruditi eloquentiam.",
    time: "4 hours ago",
  },
]

export function RecentActivities() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Recent Activities</h3>
      </div>
      <div className="space-y-4">
        {activities.map((activity, i) => (
          <div key={i} className="flex items-start gap-4">
            
            <div className="space-y-1">
              <p className="text-sm">{activity.message}</p>
              <p className="text-xs text-muted-foreground">
                {activity.user.name} | {activity.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

