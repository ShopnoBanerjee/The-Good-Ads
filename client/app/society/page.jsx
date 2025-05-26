"use client"

import { useState } from "react"
import { Bell, BookOpen, Calendar, ChevronDown, Filter, Grid3X3, Heart, List, MapPin, Search, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"

// Mock data
const projects = [
  {
    id: 1,
    title: "AI-Powered Customer Analytics Platform",
    company: "TechCorp Solutions",
    postedDate: "2024-01-15",
    description:
      "Develop an intelligent analytics platform that processes customer data to provide actionable insights for business growth. This project involves machine learning, data visualization, and real-time processing.",
    skills: ["Machine Learning", "Python", "React", "Data Analysis"],
    industry: "Technology",
    type: "Full Project",
    location: "Remote",
    duration: "3-4 months",
    compensation: "Paid",
  },
  {
    id: 2,
    title: "Sustainable Energy Management System",
    company: "GreenTech Innovations",
    postedDate: "2024-01-12",
    description:
      "Create a comprehensive energy management system for smart buildings that optimizes energy consumption and integrates renewable energy sources.",
    skills: ["IoT", "JavaScript", "Node.js", "Environmental Science"],
    industry: "Energy",
    type: "Research Project",
    location: "Boston, MA",
    duration: "4-6 months",
    compensation: "Academic Credit",
  },
  {
    id: 3,
    title: "Mobile Health Monitoring App",
    company: "HealthFirst Digital",
    postedDate: "2024-01-10",
    description:
      "Design and develop a mobile application that helps users track their health metrics and provides personalized recommendations based on their data.",
    skills: ["React Native", "UI/UX Design", "Healthcare", "Mobile Development"],
    industry: "Healthcare",
    type: "Full Project",
    location: "San Francisco, CA",
    duration: "2-3 months",
    compensation: "Paid",
  },
  {
    id: 4,
    title: "Blockchain Supply Chain Solution",
    company: "LogiChain Systems",
    postedDate: "2024-01-08",
    description:
      "Build a blockchain-based solution to track products through the supply chain, ensuring transparency and authenticity from manufacturer to consumer.",
    skills: ["Blockchain", "Solidity", "Web3", "Supply Chain"],
    industry: "Logistics",
    type: "Innovation Challenge",
    location: "Remote",
    duration: "6-8 weeks",
    compensation: "Prize Pool",
  },
  {
    id: 5,
    title: "Social Media Analytics Dashboard",
    company: "DataViz Pro",
    postedDate: "2024-01-05",
    description:
      "Create an interactive dashboard that analyzes social media trends and provides insights for marketing teams to optimize their campaigns.",
    skills: ["Data Visualization", "Python", "API Integration", "Marketing"],
    industry: "Marketing",
    type: "Full Project",
    location: "New York, NY",
    duration: "3-4 months",
    compensation: "Paid",
  },
  {
    id: 6,
    title: "Educational VR Experience",
    company: "EduTech Ventures",
    postedDate: "2024-01-03",
    description:
      "Develop an immersive virtual reality experience for teaching complex scientific concepts to high school and college students.",
    skills: ["VR Development", "Unity", "3D Modeling", "Education"],
    industry: "Education",
    type: "Research Project",
    location: "Austin, TX",
    duration: "4-5 months",
    compensation: "Academic Credit",
  },
]

const industries = ["Technology", "Healthcare", "Energy", "Finance", "Education", "Marketing", "Logistics"]
const skillOptions = [
  "Machine Learning",
  "Python",
  "React",
  "JavaScript",
  "Node.js",
  "UI/UX Design",
  "Blockchain",
  "Data Analysis",
  "Mobile Development",
  "VR Development",
]
const projectTypes = ["Full Project", "Research Project", "Innovation Challenge", "Consulting"]

export default function StudentDashboard() {
  const [viewMode, setViewMode] = useState("grid")
  const [selectedIndustries, setSelectedIndustries] = useState([])
  const [selectedSkills, setSelectedSkills] = useState([])
  const [selectedProjectType, setSelectedProjectType] = useState("")
  const [dateFilter, setDateFilter] = useState("")

  const handleIndustryChange = (industry, checked) => {
    if (checked) {
      setSelectedIndustries([...selectedIndustries, industry])
    } else {
      setSelectedIndustries(selectedIndustries.filter((i) => i !== industry))
    }
  }

  const handleSkillChange = (skill, checked) => {
    if (checked) {
      setSelectedSkills([...selectedSkills, skill])
    } else {
      setSelectedSkills(selectedSkills.filter((s) => s !== skill))
    }
  }

  const getCompensationColor = (compensation) => {
    switch (compensation) {
      case "Paid":
        return "bg-emerald-500/20 text-emerald-300 border-emerald-500/30"
      case "Academic Credit":
        return "bg-blue-500/20 text-blue-300 border-blue-500/30"
      case "Prize Pool":
        return "bg-amber-500/20 text-amber-300 border-amber-500/30"
      default:
        return "bg-slate-500/20 text-slate-300 border-slate-500/30"
    }
  }

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-primary">
        {/* Filter Sidebar */}
        <Sidebar className="border-r border-accent/20">
          <SidebarHeader className="border-b border-accent/20 p-4">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-white" />
              <h2 className="font-semibold text-white">Filters</h2>
            </div>
          </SidebarHeader>
          <SidebarContent className="p-4">
            {/* Industry Filter */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/70 text-sm font-medium mb-3">Industry</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-2">
                {industries.map((industry) => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox
                      id={industry}
                      checked={selectedIndustries.includes(industry)}
                      onCheckedChange={(checked) => handleIndustryChange(industry, checked)}
                      className="border-white/30 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                    />
                    <Label htmlFor={industry} className="text-sm text-white cursor-pointer">
                      {industry}
                    </Label>
                  </div>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Skills Filter */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/70 text-sm font-medium mb-3">Required Skills</SidebarGroupLabel>
              <SidebarGroupContent className="space-y-2">
                {skillOptions.map((skill) => (
                  <div key={skill} className="flex items-center space-x-2">
                    <Checkbox
                      id={skill}
                      checked={selectedSkills.includes(skill)}
                      onCheckedChange={(checked) => handleSkillChange(skill, checked)}
                      className="border-white/30 data-[state=checked]:bg-secondary data-[state=checked]:border-secondary"
                    />
                    <Label htmlFor={skill} className="text-sm text-white cursor-pointer">
                      {skill}
                    </Label>
                  </div>
                ))}
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Project Type Filter */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/70 text-sm font-medium mb-3">Project Type</SidebarGroupLabel>
              <SidebarGroupContent>
                <RadioGroup value={selectedProjectType} onValueChange={setSelectedProjectType}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="" id="all-types" className="border-white/30 text-secondary" />
                    <Label htmlFor="all-types" className="text-sm text-white cursor-pointer">
                      All Types
                    </Label>
                  </div>
                  {projectTypes.map((type) => (
                    <div key={type} className="flex items-center space-x-2">
                      <RadioGroupItem value={type} id={type} className="border-white/30 text-secondary" />
                      <Label htmlFor={type} className="text-sm text-white cursor-pointer">
                        {type}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* Date Filter */}
            <SidebarGroup>
              <SidebarGroupLabel className="text-white/70 text-sm font-medium mb-3">Posted Date</SidebarGroupLabel>
              <SidebarGroupContent>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="bg-accent/10 border-accent/20 text-white">
                    <SelectValue placeholder="Select timeframe" />
                  </SelectTrigger>
                  <SelectContent className="bg-primary border-accent/20">
                    <SelectItem value="all" className="text-white hover:bg-accent/20">
                      All Time
                    </SelectItem>
                    <SelectItem value="today" className="text-white hover:bg-accent/20">
                      Today
                    </SelectItem>
                    <SelectItem value="week" className="text-white hover:bg-accent/20">
                      This Week
                    </SelectItem>
                    <SelectItem value="month" className="text-white hover:bg-accent/20">
                      This Month
                    </SelectItem>
                  </SelectContent>
                </Select>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>

        <SidebarInset className="flex-1">
          {/* Top Navigation */}
          <header className="flex h-16 items-center gap-4 border-b border-accent/20 bg-primary px-6">
            <SidebarTrigger className="text-white hover:bg-accent/20" />

            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <span className="font-bold text-white">ProjectHub</span>
            </div>

            {/* Search Bar */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
              <Input
                placeholder="Search projects..."
                className="pl-10 bg-accent/10 border-accent/20 text-white placeholder:text-white/50 focus:border-secondary"
              />
            </div>

            <div className="flex items-center gap-2 ml-auto">
              {/* View Toggle */}
              <div className="flex items-center gap-1 bg-accent/10 rounded-lg p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("grid")}
                  className={`h-8 w-8 p-0 ${viewMode === "grid" ? "bg-secondary text-primary" : "text-white hover:bg-accent/20"}`}
                >
                  <Grid3X3 className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode("list")}
                  className={`h-8 w-8 p-0 ${viewMode === "list" ? "bg-secondary text-primary" : "text-white hover:bg-accent/20"}`}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>

              {/* Notifications */}
              <Button variant="ghost" size="icon" className="text-white hover:bg-accent/20 relative">
                <Bell className="h-4 w-4" />
                <span className="absolute -top-1 -right-1 h-3 w-3 bg-secondary rounded-full text-xs"></span>
              </Button>

              {/* Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 text-white hover:bg-accent/20">
                    <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center">
                      <span className="text-sm font-medium text-primary">AS</span>
                    </div>
                    <span className="hidden md:block">Alex Smith</span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-primary border-accent/20">
                  <DropdownMenuLabel className="text-white">Computer Science Society</DropdownMenuLabel>
                  <DropdownMenuSeparator className="bg-accent/20" />
                  <DropdownMenuItem className="text-white hover:bg-accent/20">My Applications</DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-accent/20">Saved Projects</DropdownMenuItem>
                  <DropdownMenuItem className="text-white hover:bg-accent/20">Profile Settings</DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-accent/20" />
                  <DropdownMenuItem className="text-white hover:bg-accent/20">Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-6">
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-white mb-2">Available Projects</h1>
              <p className="text-white/70">Discover exciting opportunities from industry partners</p>
            </div>

            {/* Projects Grid/List */}
            <div className={viewMode === "grid" ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" : "space-y-4"}>
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="bg-primary/50 border-accent/20 backdrop-blur hover:border-secondary/50 transition-colors"
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1">
                        <CardTitle className="text-white text-lg leading-tight">{project.title}</CardTitle>
                        <CardDescription className="text-secondary font-medium">{project.company}</CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white/50 hover:text-secondary hover:bg-accent/20"
                      >
                        <Heart className="h-4 w-4" />
                      </Button>
                    </div>

                    <div className="flex items-center gap-4 text-sm text-white/70">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(project.postedDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {project.location}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <p className="text-white/80 text-sm leading-relaxed line-clamp-3">{project.description}</p>

                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        {project.skills.slice(0, 3).map((skill) => (
                          <Badge
                            key={skill}
                            variant="secondary"
                            className="bg-accent/20 text-white border-accent/30 text-xs"
                          >
                            {skill}
                          </Badge>
                        ))}
                        {project.skills.length > 3 && (
                          <Badge variant="secondary" className="bg-accent/20 text-white border-accent/30 text-xs">
                            +{project.skills.length - 3} more
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge className={getCompensationColor(project.compensation)}>{project.compensation}</Badge>
                        <span className="text-xs text-white/60">{project.duration}</span>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button className="w-full bg-secondary hover:bg-secondary/90 text-primary font-medium">
                      <Star className="mr-2 h-4 w-4" />
                      Express Interest
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
