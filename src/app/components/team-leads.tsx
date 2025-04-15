
const teamLeads = [
  {
    name: "Maria Cotton",
    role: "PHP",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    name: "Danny Ward",
    role: "Design",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    name: "Linda Craver",
    role: "IOS",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    name: "Jenni Sims",
    role: "Android",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "online",
  },
  {
    name: "John Gibbs",
    role: "Business",
    avatar: "/placeholder.svg?height=40&width=40",
    status: "offline",
  },
]

export function TeamLeads() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Team Leads</h3>
        <a href="/employees" className="text-sm text-primary">
          Manage Team
        </a>
      </div>
      <div className="space-y-4">
        {teamLeads.map((lead) => (
          <div key={lead.name} className="flex items-center gap-4">
            
            <div>
              <p className="text-sm font-medium">{lead.name}</p>
              <p className="text-sm text-muted-foreground">{lead.role}</p>
            </div>
            <div
              className={`ml-auto h-2 w-2 rounded-full ${lead.status === "online" ? "bg-green-500" : "bg-gray-300"}`}
            />
          </div>
        ))}
      </div>
    </div>
  )
}

