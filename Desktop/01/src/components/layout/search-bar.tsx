"use client";

import { Search } from "lucide-react";

export function SearchBar() {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        const query = (e.target as any).search.value;
        console.log("Global search:", query);
      }}
      style={{
        display: "flex",
        gap: 8,
        alignItems: "center",
        border: "1px solid var(--line)",
        borderRadius: 999,
        padding: "8px 14px",
        background: "rgba(255,255,255,0.6)",
        minWidth: 320
      }}
    >
      <Search size={16} className="muted" />
      <input
        name="search"
        autoComplete="off"
        placeholder="Buscar..."
        style={{
          background: "transparent",
          border: "none",
          outline: "none",
          fontSize: 14,
          width: "100%"
        }}
      />
    </form>
  );
}
