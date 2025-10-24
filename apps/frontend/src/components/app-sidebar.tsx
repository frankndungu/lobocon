"use client";

import {
  Building2,
  Users,
  Network,
  CheckSquare,
  FileText,
  MessageSquare,
  DollarSign,
  ShoppingCart,
  Package,
} from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        {/* Project Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Project Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Projects - Single Link */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/projects">
                    <Building2 />
                    <span>All Projects</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Resource Workflow */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/resources/allocation">
                    <Users />
                    <span>Resources Workflow</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* WBS */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/wbs">
                    <Network />
                    <span>WBS</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Tasks */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/tasks">
                    <CheckSquare />
                    <span>Tasks</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Reports */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/reports">
                    <FileText />
                    <span>Reports</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Collaboration */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/collaboration">
                    <MessageSquare />
                    <span>Collaboration</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Procurement Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Procurement</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Expenses */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/procurement/expenses">
                    <DollarSign />
                    <span>Expenses</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Purchase Orders */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/procurement/purchase-orders">
                    <ShoppingCart />
                    <span>Purchase Orders</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Material Requests */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/procurement/material-requests">
                    <Package />
                    <span>Material Requests</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
