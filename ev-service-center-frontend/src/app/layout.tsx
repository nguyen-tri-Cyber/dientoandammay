import type { Metadata } from "next";
import "./globals.css";
import CustomerChatWidgetLoader from "@/components/chat/CustomerChatWidgetLoader";
import AIChatWidget from "@/components/chat/AIChatWidget";

export const metadata: Metadata = {
  title: "EV Service Center",
  description: "Hệ thống bảo dưỡng xe điện",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <AIChatWidget />
        <CustomerChatWidgetLoader />
      </body>
    </html>
  );
}
