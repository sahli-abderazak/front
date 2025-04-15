"use client"

import { useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DashboardSidebar } from "./dashboard-sidebar"
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet"

export function MobileSidebar() {
  const [open, setOpen] = useState(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-4 w-[250px]">
        <div className="flex items-center mb-6">
          <img src="/Logo.jpeg" alt="Logo" className="h-8 w-auto mr-2" />
          <SheetTitle className="text-lg font-bold">Menu</SheetTitle>
        </div>
        <DashboardSidebar />
      </SheetContent>
    </Sheet>
  )
}