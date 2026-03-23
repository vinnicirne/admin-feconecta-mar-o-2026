import React from "react";

export default function CommunityLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ width: "100%", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {children}
    </div>
  );
}
