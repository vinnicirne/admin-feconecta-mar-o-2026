"use client";

export function CommunitySkeleton() {
  return (
    <div style={{ padding: 0, display: "grid", width: "100%", gridTemplateColumns: "260px minmax(0, 900px) 320px", justifyContent: "center", background: "#f8fafc" }}>
      {/* Sidebar Left Skeleton */}
      <aside style={{ width: 260, padding: 24, borderRight: "1px solid var(--line)" }}>
        <div style={{ height: 20, width: 100, background: "#e5e7eb", borderRadius: 4, marginBottom: 20 }} className="skeleton" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} style={{ height: 44, background: "#f1f5f9", borderRadius: 12, marginBottom: 8 }} className="skeleton" />
        ))}
      </aside>

      {/* Main Skeleton */}
      <main style={{ width: "100%", background: "#f8fafc", overflowY: "hidden" }}>
        <div style={{ height: 180, width: "100%", background: "#e5e7eb" }} className="skeleton" />
        <div style={{ padding: 32 }}>
          <div style={{ width: 80, height: 80, borderRadius: 24, background: "white", padding: 4, marginTop: -70 }}>
            <div style={{ width: "100%", height: "100%", borderRadius: 20, background: "#f1f5f9" }} className="skeleton" />
          </div>
          <div style={{ height: 32, width: 200, background: "#e5e7eb", borderRadius: 8, marginTop: 20 }} className="skeleton" />
          <div style={{ height: 16, width: 120, background: "#f1f5f9", borderRadius: 4, marginTop: 8 }} className="skeleton" />
          
          <div style={{ marginTop: 40, display: "flex", flexDirection: "column", gap: 24 }}>
             {[1, 2].map(i => (
               <div key={i} style={{ height: 180, background: "white", borderRadius: 24, padding: 32, border: "1px solid var(--line)" }}>
                  <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
                     <div style={{ width: 44, height: 44, borderRadius: 12, background: "#f1f5f9" }} className="skeleton" />
                     <div style={{ flex: 1 }}>
                        <div style={{ height: 16, width: 140, background: "#e5e7eb", borderRadius: 4 }} className="skeleton" />
                        <div style={{ height: 12, width: 100, background: "#f1f5f9", borderRadius: 4, marginTop: 4 }} className="skeleton" />
                     </div>
                  </div>
                  <div style={{ height: 60, background: "#f1f5f9", borderRadius: 8 }} className="skeleton" />
               </div>
             ))}
          </div>
        </div>
      </main>

      {/* Sidebar Right Skeleton */}
      <aside style={{ width: 320, padding: 24, borderLeft: "1px solid var(--line)" }}>
        <div style={{ height: 20, width: 120, background: "#e5e7eb", borderRadius: 4, marginBottom: 20 }} className="skeleton" />
        {[1, 2, 3].map(i => (
          <div key={i} style={{ height: 60, background: "#f1f5f9", borderRadius: 16, marginBottom: 12 }} className="skeleton" />
        ))}
      </aside>

      <style jsx>{`
        .skeleton {
          animation: skeleton-loading 1.5s infinite linear alternate;
        }
        @keyframes skeleton-loading {
          from { opacity: 0.5; }
          to { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
