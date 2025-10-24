"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Project } from "@/lib/types";
import {
  Building,
  Calendar,
  MapPin,
  ArrowRight,
  Plus,
  FileText,
  CheckCircle,
  Users,
  TrendingUp,
  Zap,
  Shield,
  Globe,
  MessageSquare,
} from "lucide-react";
import CreateProjectForm from "@/components/forms/CreateProjectForm";

export default function LandingPage() {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showProjects, setShowProjects] = useState(false);

  const {
    data: projects,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get<Project[]>("/projects");
      return response.data;
    },
    enabled: showProjects, // Only fetch when user clicks to view projects
  });

  const scrollToProjects = () => {
    setShowProjects(true);
    setTimeout(() => {
      document.getElementById("projects-section")?.scrollIntoView({
        behavior: "smooth",
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b border-gray-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-8 h-8 text-gray-950" />
              <span className="text-2xl font-bold text-gray-950">Lobocon</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={scrollToProjects}
                className="text-gray-600 hover:text-gray-950 font-medium transition-colors"
              >
                My Projects
              </button>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gray-950 text-white px-6 py-2.5 rounded-lg hover:bg-gray-800 font-medium transition-colors flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Start Free</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero Content */}
            <div>
              <div className="inline-flex items-center space-x-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
                <Zap className="w-4 h-4" />
                <span>Free During Beta • Help Us Improve</span>
              </div>

              <h1 className="text-5xl lg:text-6xl font-bold text-gray-950 mb-6 leading-tight">
                Draft BOQs for Free.
                <br />
                <span className="text-gray-600">Build Better Projects.</span>
              </h1>

              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                The modern construction management platform for quantity
                surveyors, contractors, and project managers. Create detailed
                Bills of Quantities in minutes, not hours.
              </p>

              <div className="flex items-center space-x-4 mb-12">
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gray-950 text-white px-8 py-4 rounded-lg hover:bg-gray-800 font-semibold transition-all flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <span>Create Your First BOQ</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                <button
                  onClick={scrollToProjects}
                  className="text-gray-950 px-8 py-4 rounded-lg border-2 border-gray-950 hover:bg-gray-50 font-semibold transition-colors"
                >
                  View Projects
                </button>
              </div>

              {/* Social Proof */}
              <div className="flex items-center space-x-6 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>No credit card required</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span>100% free during beta</span>
                </div>
              </div>
            </div>

            {/* Right: Hero Visual */}
            <div className="relative">
              <div className="bg-gradient-to-br from-gray-950 to-gray-700 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                {/* Mock BOQ Preview */}
                <div className="bg-white rounded-lg p-6 shadow-xl relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-950">
                          Bill No. 1
                        </p>
                        <p className="text-sm text-gray-600">Building Works</p>
                      </div>
                    </div>
                    <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-medium">
                      Active
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Total Items</span>
                      <span className="font-semibold">87</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Sections</span>
                      <span className="font-semibold">12</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Cost</span>
                      <span className="text-xl font-bold text-gray-950">
                        Ksh 15.2M
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-gray-950 text-white py-2 rounded-lg text-sm font-medium">
                      View Details
                    </button>
                    <button className="px-4 border border-gray-200 rounded-lg">
                      <ArrowRight className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-950 mb-4">
              Everything You Need to Manage BOQs
            </h2>
            <p className="text-xl text-gray-600">
              Professional tools without the enterprise price tag
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-3">
                Detailed BOQ Management
              </h3>
              <p className="text-gray-600">
                Create comprehensive Bills of Quantities with sections, items,
                and collections. Automatic calculations and totals.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-3">
                Real-time Cost Tracking
              </h3>
              <p className="text-gray-600">
                Track project budgets, contingencies, and variances in
                real-time. Know exactly where your money is going.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-3">
                Team Collaboration
              </h3>
              <p className="text-gray-600">
                Work together with your team. Share projects, assign tasks, and
                keep everyone on the same page.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-3">
                Lightning Fast
              </h3>
              <p className="text-gray-600">
                Built with modern technology for speed. Create, edit, and manage
                BOQs without the lag.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-3">
                Secure & Reliable
              </h3>
              <p className="text-gray-600">
                Your data is encrypted and backed up. We take security seriously
                so you can focus on your projects.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-xl p-8 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-cyan-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-950 mb-3">
                Access Anywhere
              </h3>
              <p className="text-gray-600">
                Cloud-based platform accessible from any device. Work from the
                office, site, or home.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Beta Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-12 text-center">
            <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <MessageSquare className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-3xl font-bold text-gray-950 mb-4">
              We're Building Lobocon Together
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Lobocon is completely{" "}
              <span className="font-bold">free during beta</span>. We're looking
              for construction professionals like you to help us build the best
              BOQ management tool. All we ask is your honest feedback.
            </p>
            <div className="flex items-center justify-center space-x-8 mb-8">
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-950">100%</p>
                <p className="text-gray-600">Free</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-950">∞</p>
                <p className="text-gray-600">Projects</p>
              </div>
              <div className="text-center">
                <p className="text-3xl font-bold text-gray-950">24/7</p>
                <p className="text-gray-600">Support</p>
              </div>
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-gray-950 text-white px-8 py-4 rounded-lg hover:bg-gray-800 font-semibold transition-all inline-flex items-center space-x-2 shadow-lg"
            >
              <span>Join the Beta</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* Projects Section */}
      {showProjects && (
        <section id="projects-section" className="py-20 px-6 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-950 mb-2">
                  Your Projects
                </h2>
                <p className="text-gray-600">
                  Manage your construction projects and BOQs
                </p>
              </div>
              <button
                onClick={() => setShowCreateForm(true)}
                className="bg-gray-950 text-white px-6 py-3 rounded-lg hover:bg-gray-800 flex items-center space-x-2 font-medium transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Project</span>
              </button>
            </div>

            {isLoading && (
              <div className="text-center py-12">
                <div className="text-lg text-gray-600">Loading projects...</div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                <p className="text-red-600 font-medium">
                  Unable to load projects. Please check your connection.
                </p>
              </div>
            )}

            {projects && projects.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                  <div
                    key={project.id}
                    className="bg-white rounded-lg shadow-sm border hover:shadow-lg hover:border-gray-950 transition-all cursor-pointer group"
                    onClick={() =>
                      (window.location.href = `/projects/${project.id}`)
                    }
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-bold text-gray-950 mb-1 group-hover:text-blue-600 transition-colors">
                            {project.name}
                          </h3>
                          <p className="text-sm text-gray-600 font-mono">
                            {project.code}
                          </p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-gray-950 group-hover:translate-x-1 transition-all" />
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <Building className="w-4 h-4 mr-2" />
                          {project.type}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {project.city}, {project.county}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Calendar className="w-4 h-4 mr-2" />
                          {new Date(project.createdAt).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="pt-4 border-t">
                        <span
                          className={`inline-flex px-3 py-1 text-xs font-medium rounded-full ${
                            project.status === "ACTIVE"
                              ? "bg-green-100 text-green-700"
                              : project.status === "COMPLETED"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-amber-100 text-amber-700"
                          }`}
                        >
                          {project.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {projects && projects.length === 0 && (
              <div className="text-center py-16 bg-white rounded-xl shadow-sm">
                <Building className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-950 mb-2">
                  No projects yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Create your first project to get started with Lobocon
                </p>
                <button
                  onClick={() => setShowCreateForm(true)}
                  className="bg-gray-950 text-white px-8 py-3 rounded-lg hover:bg-gray-800 inline-flex items-center space-x-2 font-medium transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Your First Project</span>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Building className="w-6 h-6 text-gray-950" />
              <span className="text-lg font-bold text-gray-950">Lobocon</span>
            </div>
            <p className="text-gray-600 text-sm">
              © 2025 Lobocon. Built with ❤️ for construction professionals.
            </p>
          </div>
        </div>
      </footer>

      {/* Create Project Modal */}
      <CreateProjectForm
        isOpen={showCreateForm}
        onClose={() => setShowCreateForm(false)}
      />
    </div>
  );
}
