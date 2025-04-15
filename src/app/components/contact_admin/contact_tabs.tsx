"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ContactsTable from "./contact_table"


export function ContactsTabs({ refreshTrigger }: { refreshTrigger: boolean }) {
  return (
    <Tabs defaultValue="message" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="message"
          className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
        >
          Messages 
        </TabsTrigger>
      </TabsList>
      <TabsContent value="message" className="p-6">
        <ContactsTable refresh={refreshTrigger} />
      </TabsContent>
    </Tabs>
  )
}