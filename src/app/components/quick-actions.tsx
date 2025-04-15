import { Button } from "@/components/ui/button"
import { UserPlus, FileText, Calendar, MessageSquarePlus } from "lucide-react"

export function QuickActions() {
  const actions = [
    {
      title: "Add Employee",
      icon: <UserPlus className="h-4 w-4" />,
      color: "bg-blue-500",
    },
    {
      title: "Create Report",
      icon: <FileText className="h-4 w-4" />,
      color: "bg-purple-500",
    },
    {
      title: "Schedule Meeting",
      icon: <Calendar className="h-4 w-4" />,
      color: "bg-pink-500",
    },
    {
      title: "Send Announcement",
      icon: <MessageSquarePlus className="h-4 w-4" />,
      color: "bg-indigo-500",
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {actions.map((action) => (
        <Button
          key={action.title}
          variant="outline"
          className="h-auto p-4 hover:shadow-md transition-all flex flex-col items-center gap-2 bg-white dark:bg-gray-800"
        >
          <div className={`${action.color} text-white p-2 rounded-lg`}>{action.icon}</div>
          <span className="text-sm font-medium">{action.title}</span>
        </Button>
      ))}
    </div>
  )
}

