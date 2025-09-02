'use client';

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseClient } from "@/lib/supabaseClient";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Camera,
  ArrowRight,
  Eye,
  Heart,
  Award,
  TrendingUp,
  MessageCircle,
} from "lucide-react";

// Types
interface Profile {
  id: string;
  society_name: string;
  domain: string;
  services_offered: string;
  description?: string;
  logo_url?: string;
}

export default function SocietyDashboard() {
  const router = useRouter();
  const supabase = getSupabaseClient();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [stats] = useState({
    portfolioItems: 0,
    profileViews: 1200,
    totalLikes: 89,
    projectsDone: 12,
    activeProposals: 3,
    completionRate: 95,
  });

  useEffect(() => {
    const loadProfile = async (): Promise<void> => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (!session) return;

        const { data: userProfile, error } = await supabase
          .from("college_society_profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) {
          console.error(error);
        } else {
          setProfile(userProfile);
        }
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [supabase]);

  const quickActions = [
    {
      title: "Browse Marketplace",
      description: "Find new business opportunities",
      icon: Building2,
      link: "/society/marketplace",
      color: "from-accent to-blue-600",
      badge: "New Projects",
    },
    {
      title: "Manage Portfolio",
      description: "Showcase your work and achievements",
      icon: Camera,
      link: "/society/portfolio",
      color: "from-blue-600 to-accent",
      badge: `${stats.portfolioItems} Items`,
    },
  ];

  if (loading) {
    return (
      <main 
        className="min-h-screen bg-white dark:bg-[#15325a] transition-colors duration-200 ease-in-out font-outfit flex items-center justify-center"
        style={{
          transition: 'background-color 0.2s ease-in-out',
        }}
      >
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#15325a] dark:text-white font-outfit">Loading Dashboard...</p>
        </div>
      </main>
    );
  }

  return (
    <main 
      className="min-h-screen bg-white dark:bg-[#15325a] transition-colors duration-200 ease-in-out font-outfit"
      style={{
        transition: 'background-color 0.2s ease-in-out',
      }}
    >
      {/* Header Section */}
      <div className="bg-gradient-to-br from-accent via-accent/90 to-blue-600 dark:from-accent dark:via-accent/80 dark:to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between space-y-6 lg:space-y-0">
            {/* Welcome Section */}
            <div className="space-y-4">
              <div className="inline-flex items-center space-x-2 bg-white/20 dark:bg-white/30 backdrop-blur-sm rounded-full px-3 py-2 sm:px-4 text-sm font-medium">
                <Users className="w-4 h-4" />
                <span>Society Dashboard</span>
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-white leading-tight">
                  Welcome back,
                  <span className="block text-white/90 mt-2">
                    {profile?.society_name || "Society"}
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-white/80 mt-4 max-w-2xl leading-relaxed">
                  Manage your collaborations, showcase your work, and grow your impact
                </p>
              </div>
            </div>

            {/* Profile Card */}
            {profile && (
              <div className="bg-white/10 dark:bg-white/20 backdrop-blur-sm rounded-2xl p-4 sm:p-6 w-full lg:w-auto lg:min-w-[300px]">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden ring-4 ring-white/30">
                    <img
                      src={profile.logo_url || "/placeholder.svg?height=80&width=80&query=society+logo"}
                      alt="Society Logo"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-lg mb-1">{profile.society_name}</h3>
                    <Badge className="bg-white/20 text-white border-white/30 mb-2 rounded-xl">
                      {profile.domain}
                    </Badge>
                    <p className="text-white/70 text-sm line-clamp-2">{profile.services_offered}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8 relative z-10 pb-12 sm:pb-16">
        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 mb-8">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card
                key={index}
                className="group bg-white dark:bg-[#15325a]/90 border border-gray-200 dark:border-white/10 hover:border-blue-600 dark:hover:border-accent hover:shadow-xl rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 ease-in-out transform hover:-translate-y-1"
                onClick={() => router.push(action.link)}
                style={{
                  transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                }}
              >
                <CardContent className="p-6 sm:p-8">
                  <div className="flex items-start justify-between mb-6">
                    <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br ${action.color} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                      <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                    </div>
                    <Badge className="bg-accent/10 dark:bg-accent/20 text-accent rounded-xl">
                      {action.badge}
                    </Badge>
                  </div>
                  <div className="space-y-3">
                    <h3 className="text-xl sm:text-2xl font-bold text-[#15325a] dark:text-white group-hover:text-blue-600 dark:group-hover:text-accent transition-colors duration-200 ease-in-out">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed transition-colors duration-200 ease-in-out">
                      {action.description}
                    </p>
                    <div className="flex items-center text-accent font-medium">
                      <span className="mr-2">Get Started</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200 ease-in-out" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 sm:gap-6">
          <Card 
            className="bg-white dark:bg-[#15325a]/90 border border-gray-200 dark:border-white/10 rounded-xl transition-all duration-200 ease-in-out"
            style={{
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
            }}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent" />
                <span className="text-xl sm:text-2xl font-bold text-[#15325a] dark:text-white transition-colors duration-200 ease-in-out">
                  {stats.portfolioItems}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm transition-colors duration-200 ease-in-out">
                Portfolio Items
              </p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white dark:bg-[#15325a]/90 border border-gray-200 dark:border-white/10 rounded-xl transition-all duration-200 ease-in-out"
            style={{
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
            }}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Eye className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent" />
                <span className="text-xl sm:text-2xl font-bold text-[#15325a] dark:text-white transition-colors duration-200 ease-in-out">
                  {stats.profileViews}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm transition-colors duration-200 ease-in-out">
                Profile Views
              </p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white dark:bg-[#15325a]/90 border border-gray-200 dark:border-white/10 rounded-xl transition-all duration-200 ease-in-out"
            style={{
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
            }}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent" />
                <span className="text-xl sm:text-2xl font-bold text-[#15325a] dark:text-white transition-colors duration-200 ease-in-out">
                  {stats.totalLikes}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm transition-colors duration-200 ease-in-out">
                Total Likes
              </p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white dark:bg-[#15325a]/90 border border-gray-200 dark:border-white/10 rounded-xl transition-all duration-200 ease-in-out"
            style={{
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
            }}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <Award className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent" />
                <span className="text-xl sm:text-2xl font-bold text-[#15325a] dark:text-white transition-colors duration-200 ease-in-out">
                  {stats.projectsDone}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm transition-colors duration-200 ease-in-out">
                Projects Done
              </p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white dark:bg-[#15325a]/90 border border-gray-200 dark:border-white/10 rounded-xl transition-all duration-200 ease-in-out"
            style={{
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
            }}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-accent" />
                <span className="text-xl sm:text-2xl font-bold text-[#15325a] dark:text-white transition-colors duration-200 ease-in-out">
                  {stats.activeProposals}
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm transition-colors duration-200 ease-in-out">
                Active Proposals
              </p>
            </CardContent>
          </Card>

          <Card 
            className="bg-white dark:bg-[#15325a]/90 border border-gray-200 dark:border-white/10 rounded-xl transition-all duration-200 ease-in-out"
            style={{
              transition: 'background-color 0.2s ease-in-out, border-color 0.2s ease-in-out',
            }}
          >
            <CardContent className="p-4 text-center">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 text-green-500" />
                <span className="text-xl sm:text-2xl font-bold text-[#15325a] dark:text-white transition-colors duration-200 ease-in-out">
                  {stats.completionRate}%
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-xs sm:text-sm transition-colors duration-200 ease-in-out">
                Success Rate
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
