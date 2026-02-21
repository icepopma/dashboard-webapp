import { getLocalIdeas } from '@/lib/local-ideas'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Sparkles, FileText, CheckCircle2, Plus, RefreshCw } from 'lucide-react'
import { TabsNavigation, TabId } from '@/components/tabs-navigation'
import { TabsContent } from '@/components/ui/tabs'
import { KanbanBoard } from '@/components/kanban/kanban-board'
import { PipelineView } from '@/views/pipeline-view'
import { CalendarView } from '@/views/calendar-view'
import { MemoryView } from '@/views/memory-view'
import { TeamView } from '@/views/team-view'
import { OfficeView } from '@/views/office-view'

export default async function HomePage() {
  const localIdeas = await getLocalIdeas()

  const totalIdeas = localIdeas.length
  const ideasWithPlan = localIdeas.filter((i) => i.hasWorkPlan).length
  const totalTasks = localIdeas.reduce((sum, i) => sum + i.tasksCount, 0)

  return (
    <main className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border bg-sidebar flex-shrink-0">
        <ScrollArea className="h-screen">
          <div className="p-5">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-primary-foreground" />
              </div>
              <h1 className="text-lg font-semibold text-sidebar-foreground">Dashboard</h1>
            </div>

            <div className="space-y-1.5">
              {localIdeas.map((idea) => (
                <Card
                  key={idea.name}
                  className="p-3 hover:bg-sidebar-accent cursor-pointer transition-colors border-border/60 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h2 className="font-medium text-sm truncate text-sidebar-foreground">
                        {idea.name}
                      </h2>
                      <div className="flex gap-1.5 mt-2">
                        {idea.hasIdeaMd && (
                          <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
                            <FileText className="h-3 w-3 mr-1" />
                            Idea
                          </Badge>
                        )}
                        {idea.hasWorkPlan && (
                          <Badge variant="secondary" className="text-xs font-normal px-2 py-0.5">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Plan
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-xs font-medium text-sidebar-foreground">
                        {idea.tasksCount}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        task{idea.tasksCount !== 1 ? 's' : ''}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {localIdeas.length === 0 && (
              <div className="text-center py-10 text-muted-foreground">
                <Sparkles className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm font-medium">No ideas yet</p>
                <p className="text-xs mt-1.5">
                  Create your first idea in notes/ideas/
                </p>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* Main Content */}
      <section className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Welcome to Dashboard
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Manage your ideas and track your progress
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <RefreshCw className="h-4 w-4" />
                同步
              </Button>
              <Button size="sm" className="gap-2">
                <Plus className="h-4 w-4" />
                New Idea
              </Button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 bg-background">
          <TabsNavigation defaultValue="kanban">
            <TabsContent value="kanban" className="h-full m-0">
              <KanbanBoard />
            </TabsContent>

            <TabsContent value="pipeline" className="h-full m-0">
              <PipelineView />
            </TabsContent>

            <TabsContent value="calendar" className="h-full m-0">
              <CalendarView />
            </TabsContent>

            <TabsContent value="memory" className="h-full m-0">
              <MemoryView />
            </TabsContent>

            <TabsContent value="team" className="h-full m-0">
              <TeamView />
            </TabsContent>

            <TabsContent value="office" className="h-full m-0">
              <OfficeView />
            </TabsContent>

            {/* Dashboard Home (Stats) */}
            <TabsContent value="home" className="h-full m-0 p-6">
              <div className="max-w-4xl mx-auto space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-3 gap-4">
                  <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-5">
                      <div className="text-center">
                        <div className="text-4xl font-semibold text-primary">
                          {totalIdeas}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 font-medium">
                          Total Ideas
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-5">
                      <div className="text-center">
                        <div className="text-4xl font-semibold text-primary">
                          {ideasWithPlan}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 font-medium">
                          With Plan
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="border-border/60 shadow-sm">
                    <CardContent className="p-5">
                      <div className="text-center">
                        <div className="text-4xl font-semibold text-primary">
                          {totalTasks}
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 font-medium">
                          Total Tasks
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Welcome Card */}
                <Card className="border-border/60 shadow-sm">
                  <CardHeader>
                    <CardTitle className="text-lg">Get Started</CardTitle>
                    <CardDescription>
                      Select an idea from the sidebar to view details, manage tasks, and track progress
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-muted/50 border border-border/60">
                        <FileText className="h-5 w-5 text-primary mb-2" />
                        <h3 className="font-medium text-sm mb-1">Create Ideas</h3>
                        <p className="text-xs text-muted-foreground">
                          Document your ideas with markdown files
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50 border border-border/60">
                        <CheckCircle2 className="h-5 w-5 text-primary mb-2" />
                        <h3 className="font-medium text-sm mb-1">Plan Work</h3>
                        <p className="text-xs text-muted-foreground">
                          Break down ideas into actionable tasks
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50 border border-border/60">
                        <Sparkles className="h-5 w-5 text-primary mb-2" />
                        <h3 className="font-medium text-sm mb-1">Track Progress</h3>
                        <p className="text-xs text-muted-foreground">
                          Monitor completion and stay organized
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-muted/50 border border-border/60">
                        <Plus className="h-5 w-5 text-primary mb-2" />
                        <h3 className="font-medium text-sm mb-1">Stay Focused</h3>
                        <p className="text-xs text-muted-foreground">
                          Prioritize and execute efficiently
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </TabsNavigation>
        </div>
      </section>
    </main>
  )
}
