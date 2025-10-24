"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { DashboardLayout } from "@/components/dashboard-layout";
import {
  Calendar,
  FileText,
  Cloud,
  Wind,
  Droplets,
  ArrowRight,
  Users,
  HardHat,
  ClipboardCheck,
  ChevronRight,
  Building2,
  MapPin,
  Phone,
  DollarSign,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Project {
  id: string;
  name: string;
  code: string;
  client?: string;
  address?: string;
  city?: string;
  county?: string;
  postcode?: string;
  phone?: string;
  type: string;
  stage: string;
  status: string;
  department?: string;
  programme?: string;
  budget?: number;
  currency: string;
  progress: number;
  start_date?: string;
  end_date?: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

interface ProjectStats {
  billCount: number;
  sectionCount: number;
  itemCount: number;
  collectionCount: number;
  totalBudget: number;
}

export default function ProjectDetail() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [weather] = useState({
    temp: 12,
    condition: "Partly Cloudy",
    humidity: 69,
    windSpeed: 6,
  });

  // Fetch project details
  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["project", projectId],
    queryFn: async () => {
      const response = await api.get<Project>(`/projects/${projectId}`);
      return response.data;
    },
  });

  // Fetch project stats
  const { data: stats } = useQuery({
    queryKey: ["project-stats", projectId],
    queryFn: async () => {
      const response = await api.get<ProjectStats>(
        `/projects/${projectId}/stats`
      );
      return response.data;
    },
  });

  const formatCurrency = (amount?: number) => {
    if (!amount) return "Ksh 0.00";
    return `Ksh ${Number(amount).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: "bg-green-100 text-green-700",
      TENDERING: "bg-blue-100 text-blue-700",
      ON_HOLD: "bg-amber-100 text-amber-700",
      COMPLETED: "bg-gray-100 text-gray-700",
      CANCELLED: "bg-red-100 text-red-700",
    };
    return colors[status] || "bg-gray-100 text-gray-700";
  };

  const getWeatherIcon = () => {
    switch (weather.condition) {
      case "Partly Cloudy":
        return <Cloud className="w-12 h-12 text-gray-400" />;
      case "Rainy":
        return <Cloud className="w-12 h-12 text-blue-400" />;
      default:
        return <Cloud className="w-12 h-12 text-gray-400" />;
    }
  };

  if (projectLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg text-gray-900 font-medium">
            Loading project...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!project) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="text-red-600 font-medium">Project not found</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      {/* Breadcrumb */}
      <div className="flex items-center text-sm text-gray-600 mb-6 font-medium">
        <button
          onClick={() => router.push("/projects")}
          className="hover:text-gray-950 transition-colors"
        >
          Projects
        </button>
        <ChevronRight className="w-4 h-4 mx-2" />
        <span className="text-gray-950">{project.name}</span>
      </div>

      {/* Project Header */}
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-950 mb-2">
              {project.name}
            </h1>
            <p className="text-sm text-gray-600 font-medium mb-4">
              {project.code}
            </p>
            <div className="flex items-center gap-2 mb-4">
              <Badge className={getStatusColor(project.status)}>
                {project.status}
              </Badge>
              <Badge variant="outline">{project.type}</Badge>
              <Badge variant="outline">{project.stage}</Badge>
            </div>
          </div>
          <button
            onClick={() => router.push(`/projects/${projectId}/edit`)}
            className="bg-white text-gray-700 px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 font-medium transition-colors"
          >
            Edit Project
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview */}
          <Card>
            <CardHeader>
              <CardTitle>Project Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Project Type</p>
                  <p className="font-semibold text-gray-950">{project.type}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Department</p>
                  <p className="font-semibold text-gray-950">
                    {project.department || "N/A"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Current Stage</p>
                  <p className="font-semibold text-gray-950">{project.stage}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Budget</p>
                  <p className="font-semibold text-gray-950">
                    {formatCurrency(project.budget)}
                  </p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm text-gray-600">Overall Progress</p>
                  <p className="text-sm font-bold text-gray-950">
                    {project.progress}%
                  </p>
                </div>
                <Progress value={project.progress} className="h-2" />
              </div>

              <div className="mt-6">
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Programme Timeline</span>
                </div>
                <p className="text-gray-950 font-semibold">
                  {formatDate(project.start_date)} -{" "}
                  {formatDate(project.end_date)}
                </p>
              </div>

              {project.notes && (
                <div className="mt-6">
                  <p className="text-sm text-gray-600 mb-1 font-medium">
                    Project Notes
                  </p>
                  <p className="text-gray-950">{project.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* BOQ Card - MOST IMPORTANT */}
          <Card
            className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-gray-900"
            onClick={() => router.push(`/projects/${projectId}/boq`)}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-blue-100 rounded-lg">
                    <FileText className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-950">
                      Bill of Quantities (BOQ)
                    </h3>
                    <p className="text-sm text-gray-600">
                      View detailed cost breakdown and quantities
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-gray-600" />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Items</p>
                  <p className="text-2xl font-bold text-gray-950">
                    {stats?.itemCount || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Total Cost</p>
                  <p className="text-2xl font-bold text-gray-950">
                    {formatCurrency(stats?.totalBudget)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <Badge className="bg-green-100 text-green-700">
                    Approved
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Project Details Tabs */}
          <Card>
            <CardHeader>
              <CardTitle>Project Details</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="financial">
                <TabsList>
                  <TabsTrigger value="financial">Financial</TabsTrigger>
                  <TabsTrigger value="location">Location</TabsTrigger>
                  <TabsTrigger value="info">Information</TabsTrigger>
                </TabsList>

                <TabsContent value="financial" className="space-y-4 mt-4">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Total Budget</span>
                      <span className="text-xl font-bold text-gray-950">
                        {formatCurrency(project.budget)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">Currency</span>
                      <span className="font-medium">
                        {project.currency} (Kenyan Shilling)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-600">BOQ Total</span>
                      <span className="text-xl font-bold text-blue-600">
                        {formatCurrency(stats?.totalBudget)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between border-t pt-4">
                      <span className="text-gray-600">Variance</span>
                      <div className="text-right">
                        <p className="text-xl font-bold text-green-600">
                          {formatCurrency(
                            (project.budget || 0) - (stats?.totalBudget || 0)
                          )}
                        </p>
                        <p className="text-xs text-green-600">(Under Budget)</p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="location" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 text-gray-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Address</p>
                        <p className="font-medium text-gray-950">
                          {project.address || "N/A"}
                        </p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">City & County</p>
                      <p className="font-medium text-gray-950">
                        {project.city}, {project.county}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Postcode</p>
                      <p className="font-medium text-gray-950">
                        {project.postcode || "N/A"}
                      </p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Phone className="w-4 h-4 text-gray-600 mt-1" />
                      <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium text-gray-950">
                          {project.phone || "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="info" className="space-y-4 mt-4">
                  <div className="space-y-3">
                    <div>
                      <p className="text-sm text-gray-600">Client</p>
                      <p className="font-medium text-gray-950">
                        {project.client || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Programme</p>
                      <p className="font-medium text-gray-950">
                        {project.programme || "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Department</p>
                      <p className="font-medium text-gray-950">
                        {project.department || "N/A"}
                      </p>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Labor Tracking */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <HardHat className="w-5 h-5" />
                Labor Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-blue-600">24</p>
                  <p className="text-xs text-gray-600">Workers On-Site</p>
                </div>
                <div className="text-center p-3 bg-green-50 rounded-lg">
                  <ClipboardCheck className="w-6 h-6 text-green-600 mx-auto mb-1" />
                  <p className="text-2xl font-bold text-green-600">3</p>
                  <p className="text-xs text-gray-600">COW Pending</p>
                </div>
              </div>

              <div className="space-y-2 pt-2 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Carpenters</span>
                  <span className="font-medium">8</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Electricians</span>
                  <span className="font-medium">6</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Plumbers</span>
                  <span className="font-medium">4</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">General Labor</span>
                  <span className="font-medium">6</span>
                </div>
              </div>

              <div className="pt-2 border-t">
                <p className="text-xs text-gray-600">
                  Last updated: Today at 9:30 AM
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Weather Widget */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Site Weather</CardTitle>
              <p className="text-sm text-gray-600">{project.city}</p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-4xl font-bold">{weather.temp}°C</p>
                  <p className="text-sm text-gray-600">{weather.condition}</p>
                </div>
                {getWeatherIcon()}
              </div>

              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Droplets className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Humidity</span>
                  </div>
                  <span className="text-sm font-medium">
                    {weather.humidity}%
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wind className="w-4 h-4 text-gray-600" />
                    <span className="text-sm">Wind Speed</span>
                  </div>
                  <span className="text-sm font-medium">
                    {weather.windSpeed} km/h
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t">
                <p className="text-xs text-gray-600">
                  Weather conditions updated for construction site planning
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                  <div>
                    <p className="text-sm font-medium">
                      Foundation work completed
                    </p>
                    <p className="text-xs text-gray-600">2 days ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                  <div>
                    <p className="text-sm font-medium">New team member added</p>
                    <p className="text-xs text-gray-600">5 days ago</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 mt-2" />
                  <div>
                    <p className="text-sm font-medium">
                      Budget review scheduled
                    </p>
                    <p className="text-xs text-gray-600">1 week ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
