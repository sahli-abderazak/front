"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import ArchiveTable from "./temoiniage_table"


export function TemoiniagesTabs({ refreshTrigger }: { refreshTrigger: boolean }) {
  return (
    <Tabs defaultValue="archive" className="w-full">
      <TabsList className="w-full justify-start rounded-none border-b bg-transparent p-0">
        <TabsTrigger
          value="archive"
          className="rounded-none border-b-2 border-transparent px-4 py-3 data-[state=active]:border-primary"
        >
          Temoiniages 
        </TabsTrigger>
      </TabsList>
      <TabsContent value="archive" className="p-6">
        <ArchiveTable refresh={refreshTrigger} />
      </TabsContent>
    </Tabs>
  )
}