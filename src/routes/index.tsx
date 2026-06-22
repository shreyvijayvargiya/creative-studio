import { Link, createFileRoute } from '@tanstack/react-router'
import { FileText, HardDrive, PenLine, Users } from 'lucide-react'

import { Alert, AlertDescription } from '#/components/ui/alert'
import { Button } from '#/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/ui/table'

export const Route = createFileRoute('/')({
  component: DashboardPage,
})

const statCards = [
  {
    title: 'Documents Generated',
    value: '0',
    hint: 'Phase 1',
    icon: FileText,
  },
  {
    title: 'PDFs Signed',
    value: '0',
    hint: 'Phase 1',
    icon: PenLine,
  },
  {
    title: 'Storage Used',
    value: '0 MB',
    hint: 'of 100MB',
    icon: HardDrive,
  },
  {
    title: 'Active Users',
    value: '1',
    hint: '(you)',
    icon: Users,
  },
] as const

function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Overview of your finance documents and activity
        </p>
      </div>

      {/* TODO Phase 2: wire stat cards to Supabase */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => (
          <Card key={card.title} className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {card.title}
              </CardTitle>
              <card.icon className="size-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-foreground">
                {card.value}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{card.hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Recent Documents</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>PIN Protected</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <Alert className="border-dashed">
                      <AlertDescription>
                        No documents yet — go to Budget Planner to generate your
                        first PDF
                      </AlertDescription>
                    </Alert>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full">
              <Link to="/grid">New Budget Document</Link>
            </Button>
            <Button asChild variant="outline" className="w-full">
              <Link to="/documents">View All Documents</Link>
            </Button>
            <Button variant="outline" className="w-full" disabled>
              Upload File
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              Upload coming in Phase 2
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
