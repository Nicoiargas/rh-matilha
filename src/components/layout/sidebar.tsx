"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { 
  Menu,
  LayoutDashboard,
  Users,
  Calendar,
  Monitor,
  DollarSign,
  FolderOpen,
  FileText,
  ChevronRight,
  ChevronDown
} from "lucide-react";

interface MenuItem {
  name: string;
  href?: string;
  icon: any;
  children?: MenuItem[];
}

const navigation: MenuItem[] = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { 
    name: "Funcionários", 
    icon: Users,
    children: [
      { name: "Lista de Funcionários", href: "/funcionarios", icon: Users },
      { name: "Férias", href: "/ferias", icon: Calendar },
      { name: "Salários", href: "/salarios", icon: DollarSign }
    ]
  },
  { name: "Equipamentos", href: "/equipamentos", icon: Monitor },
  { name: "Projetos", href: "/projetos", icon: FolderOpen },
  { name: "Contratos", href: "/contratos", icon: FileText },
];

export function Sidebar() {
  const pathname = usePathname();
  const [expandedMenus, setExpandedMenus] = useState<Set<string>>(new Set());

  // Função para verificar se um menu está ativo
  const isMenuActive = (item: MenuItem): boolean => {
    if (item.href) {
      return pathname === item.href;
    }
    if (item.children) {
      return item.children.some(child => pathname === child.href);
    }
    return false;
  };

  // Função para alternar expansão do menu
  const toggleMenu = (menuName: string) => {
    setExpandedMenus(prev => {
      const newSet = new Set(prev);
      if (newSet.has(menuName)) {
        newSet.delete(menuName);
      } else {
        newSet.add(menuName);
      }
      return newSet;
    });
  };

  // Auto-expandir menu se algum filho estiver ativo
  React.useEffect(() => {
    navigation.forEach(item => {
      if (item.children && item.children.some(child => pathname === child.href)) {
        setExpandedMenus(prev => new Set(prev).add(item.name));
      }
    });
  }, [pathname]);

  // Componente para renderizar item do menu
  const MenuItemComponent = ({ item, level = 0 }: { item: MenuItem; level?: number }) => {
    const isExpanded = expandedMenus.has(item.name);
    const isActive = isMenuActive(item);
    const hasChildren = item.children && item.children.length > 0;

    if (hasChildren) {
      return (
        <div>
          <button
            onClick={() => toggleMenu(item.name)}
            className={cn(
              "group flex items-center w-full px-2 py-2 text-sm font-medium rounded-md transition-colors",
              isActive
                ? "bg-gray-100 text-gray-900"
                : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            )}
            style={{ paddingLeft: `${8 + level * 16}px` }}
          >
            <item.icon className="mr-3 h-5 w-5" />
            {item.name}
            {isExpanded ? (
              <ChevronDown className="ml-auto h-4 w-4" />
            ) : (
              <ChevronRight className="ml-auto h-4 w-4" />
            )}
          </button>
          {isExpanded && (
            <div className="ml-4">
              {item.children!.map((child) => (
                <MenuItemComponent key={child.name} item={child} level={level + 1} />
              ))}
            </div>
          )}
        </div>
      );
    }

    return (
      <Link
        href={item.href!}
        className={cn(
          "group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors",
          isActive
            ? "bg-gray-100 text-gray-900"
            : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
        )}
        style={{ paddingLeft: `${8 + level * 16}px` }}
      >
        <item.icon className="mr-3 h-5 w-5" />
        {item.name}
      </Link>
    );
  };

  return (
    <>
      {/* Mobile sidebar */}
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="mr-2 px-0 text-base hover:bg-transparent focus-visible:bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 lg:hidden"
          >
            <Menu className="h-6 w-6" />
            <span className="sr-only">Toggle Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64">
          <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <h2 className="text-xl font-bold text-gray-900">
                RH Matilha
              </h2>
            </div>
            <nav className="mt-8 flex-1 px-2 space-y-1">
              {navigation.map((item) => (
                <MenuItemComponent key={item.name} item={item} />
              ))}
            </nav>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:fixed lg:inset-y-0 lg:z-50 lg:bg-white lg:border-r lg:border-gray-200">
        <div className="flex flex-col flex-grow pt-5 bg-white overflow-y-auto">
          <div className="flex items-center flex-shrink-0 px-4">
            <h2 className="text-xl font-bold text-gray-900">
              RH Matilha
            </h2>
          </div>
          <nav className="mt-8 flex-1 px-2 space-y-1">
            {navigation.map((item) => (
              <MenuItemComponent key={item.name} item={item} />
            ))}
          </nav>
        </div>
      </div>
    </>
  );
}
