"use client";

import {
  Building2,
  FileEdit,
  Briefcase,
  Rocket,
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
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight } from "lucide-react";

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent>
        {/* Project Management Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Project Management</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {/* Projects - Collapsible */}
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Building2 />
                      <span>Projects</span>
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="/projects">
                            <Building2 />
                            <span>All Projects</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="/projects">
                            <FileEdit />
                            <span>BOQs</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="/projects/bids">
                            <Briefcase />
                            <span>Bids</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="/projects/initialization">
                            <Rocket />
                            <span>Initialization</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* Resource Workflow - Collapsible */}
              <Collapsible defaultOpen className="group/collapsible">
                <SidebarMenuItem>
                  <CollapsibleTrigger asChild>
                    <SidebarMenuButton>
                      <Users />
                      <span>Resources Workflow</span>
                      <ChevronRight className="ml-auto transition-transform group-data-[state=open]/collapsible:rotate-90" />
                    </SidebarMenuButton>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarMenuSub>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton asChild>
                          <a href="/resources/allocation">
                            <Users />
                            <span>Allocation</span>
                          </a>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </CollapsibleContent>
                </SidebarMenuItem>
              </Collapsible>

              {/* WBS - Single Item */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/wbs">
                    <Network />
                    <span>WBS</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Tasks - Single Item */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/tasks">
                    <CheckSquare />
                    <span>Tasks</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Reports - Single Item */}
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <a href="/reports">
                    <FileText />
                    <span>Reports</span>
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Collaboration - Single Item */}
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
