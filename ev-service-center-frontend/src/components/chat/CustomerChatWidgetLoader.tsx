"use client";

import dynamic from "next/dynamic";

const CustomerChatWidget = dynamic(() => import("./CustomerChatWidget"), {
  loading: () => null,
  ssr: false,
});

export default function CustomerChatWidgetLoader() {
  return <CustomerChatWidget />;
}
