"use client";
import React, { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { SidebarProvider, useSidebar } from "@/context/SidebarContext";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { useAuth } from "@/hooks/useAuth";

// 👇 1. Import đúng file AppSidebar bạn vừa tìm thấy
// (Lưu ý: Bạn kiểm tra xem file AppSidebar.tsx nằm ở đâu để sửa đường dẫn cho đúng nhé)
// Ví dụ nếu nó nằm ngay trong thư mục components:
import AppSidebar from "@/layout/AppSidebar";
// Hoặc nếu export default thì bỏ dấu ngoặc nhọn: import AppSidebar from "@/components/AppSidebar";

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isLoading, isAuthenticated, hasRole } = useAuth();
  const sidebar = useSidebar() as
    | { isOpen?: boolean; isCollapsed?: boolean; collapsed?: boolean }
    | null;
  const isCollapsed: boolean = (() => {
    if (!sidebar) return false;
    if ("isOpen" in sidebar) return !sidebar.isOpen;
    if ("isCollapsed" in sidebar) return !!sidebar.isCollapsed;
    if ("collapsed" in sidebar) return !!sidebar.collapsed;
    return false;
  })();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;

    if (pathname === "/" && !hasRole(["admin", "staff"])) {
      router.replace("/profile");
    }
  }, [pathname, isLoading, isAuthenticated, hasRole, router]);

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      
      {/* 👇 2. Hiển thị Sidebar ở đây */}
      <AppSidebar />
      
      <main 
        className={`flex-1 transition-all duration-300 w-full ${
          // Nếu menu đóng lại: Cách lề trái 16 (khoảng 64px - vừa đủ icon)
          // Nếu menu mở ra: Cách lề trái 72 (khoảng 288px) hoặc 80 (320px)
          isCollapsed ? "ml-[70px] md:ml-[80px]" : "ml-[290px] md:ml-[300px]"
        }`}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <ProtectedRoute>
        <AdminLayoutContent>
          {children}
        </AdminLayoutContent>
      </ProtectedRoute>
    </SidebarProvider>
  );
}