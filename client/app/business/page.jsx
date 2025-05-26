"use client"

import { useState } from "react"
import {
  Bell,
  Building2,
  Calendar,
  ChevronDown,
  Eye,
  FileText,
  MessageSquare,
  Plus,
  Search,
  Settings,
  Users,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data
const projects = [
  {
    id: 1,
    title: "AI-Powered Customer Analytics Platform",
    postedDate: "2024-01-15",
    interestedGroups: 8,
    status: "Active",
    groups: [
      { name: "Tech Innovation Society", university: "MIT", proposalLink: "#" },
      { name: "Data Science Club", university: "Stanford", proposalLink: "#" },
      { name: "AI Research Group", university: "Berkeley", proposalLink: "#" },
    ],
  },
  {
    id: 2,
    title: "Sustainable Energy Management System",
    postedDate: "2024-01-10",
    interestedGroups: 12,
    status: "Active",
    groups: [
      { name: "Green Tech Society", university: "Harvard", proposalLink: "#" },
      { name: "Environmental Engineering Club", university: "Caltech", proposalLink: "#" },
    ],
  },
  {
    id: 3,
    title: "Mobile Health Monitoring App",
    postedDate: "2024-01-08",
    interestedGroups: 5,
    status: "In Review",
    groups: [
      { name: "Health Tech Innovation", university: "Johns Hopkins", proposalLink: "#" },
      { name: "Medical Software Society", university: "UCLA", proposalLink: "#" },
    ],
  },
  {
    id: 4,
    title: "Blockchain Supply Chain Solution",
    postedDate: "2024-01-05",
    interestedGroups: 15,
    status: "Active",
    groups: [
      { name: "Blockchain Society", university: "NYU", proposalLink: "#" },
      { name: "Crypto Development Club", university: "Carnegie Mellon", proposalLink: "#" },
    ],
  },
]

const navigationItems = [
  {
    title: "Projects",
    icon: FileText,
    url: "#",
    isActive: true,
  },
  {
    title: "Interested Student Societies",
    icon: Users,
    url: "#",
  },
  {
    title: "Messages",
    icon: MessageSquare,
    url: "#",
    badge: "3",
  },
  {
    title: "Settings",
    icon: Settings,
    url: "#",
  },
]

export default function BusinessDashboard() {
  const [selectedProject, setSelectedProject] = useState(null)

  const getStatusColor = (status) => {
    switch (status) {
      case "Active":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "In Review":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-primary">
        <Sidebar className="border-r border-accent/20">
          <SidebarHeader className="border-b border-accent/20 p-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">TechCorp</h2>
                <p className="text-sm text-white/70">Business Dashboard</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/70 text-xs uppercase tracking-wider mb-2">
                Navigation
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {navigationItems.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        asChild
                        isActive={item.isActive}
                        className="text-white hover:bg-accent/20 data-[active=true]:bg-secondary data-[active=true]:text-white"
                      >
                        <a href={item.url} className="flex items-center gap-3">
                          <item.icon className="h-4 w-4" />
                          <span>{item.title}</span>
                          {item.badge && (
                            <Badge className="ml-auto bg-secondary text-white border-0">{item.badge}</Badge>
                          )}
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          {/* Top Navigation */}
          <header className="flex h-16 items-center gap-4 border-b border-accent/20 bg-primary px-6">
            <SidebarTrigger className="text-white hover:bg-accent/20" />

            <div className="flex flex-1 items-center gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
                <Input
                  placeholder="Search projects..."
                  className="pl-10 bg-accent/10 border-accent/20 text-white placeholder:text-white/50 focus:border-secondary"
                />
              </div>

              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-white hover:bg-accent/20">
                  <Bell className="h-4 w-4" />
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-accent/20">
                      <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                        <span className="text-sm font-medium">JD</span>
                      </div>
                      <span className="hidden md:block">John Doe</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-primary border-accent/20">
                    <DropdownMenuLabel className="text-white">My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-accent/20" />
                    <DropdownMenuItem className="text-white hover:bg-accent/20">Profile</DropdownMenuItem>
                    <DropdownMenuItem className="text-white hover:bg-accent/20">Settings</DropdownMenuItem>
                    <DropdownMenuSeparator className="bg-accent/20" />
                    <DropdownMenuItem className="text-white hover:bg-accent/20">Sign out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white">Projects</h1>
                <p className="text-white/70">Manage and track your posted projects</p>
              </div>
              <Button className="bg-secondary hover:bg-secondary/90 text-white">
                <Plus className="mr-2 h-4 w-4" />
                Post New Project
              </Button>
            </div>

            {/* Projects Table */}
            <div className="rounded-lg border border-accent/20 bg-primary/50 backdrop-blur">
              <Table>
                <TableHeader>
                  <TableRow className="border-accent/20 hover:bg-accent/5">
                    <TableHead className="text-white/70">Project Title</TableHead>
                    <TableHead className="text-white/70">Posted Date</TableHead>
                    <TableHead className="text-white/70">Interested Groups</TableHead>
                    <TableHead className="text-white/70">Status</TableHead>
                    <TableHead className="text-white/70">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} className="border-accent/20 hover:bg-accent/5">
                      <TableCell className="font-medium text-white">{project.title}</TableCell>
                      <TableCell className="text-white/70">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {new Date(project.postedDate).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
                          {project.interestedGroups} groups
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-white hover:bg-accent/20"
                              onClick={() => setSelectedProject(project)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              View Interest
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="bg-primary border-accent/20 text-white max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="text-white">Interested Student Societies</DialogTitle>
                              <DialogDescription className="text-white/70">
                                Groups that have shown interest in "{project.title}"
                              </DialogDescription>
                            </DialogHeader>

                            <div className="space-y-4">
                              {project.groups.map((group, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between p-4 rounded-lg bg-accent/10 border border-accent/20"
                                >
                                  <div className="space-y-1">
                                    <h4 className="font-medium text-white">{group.name}</h4>
                                    <p className="text-sm text-white/70">{group.university}</p>
                                  </div>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-secondary text-secondary hover:bg-secondary hover:text-white"
                                  >
                                    View Proposal
                                  </Button>
                                </div>
                              ))}
                            </div>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
