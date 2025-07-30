import BusinessHeader from "@/components/business-header";

export default function BusinessLayout({ children }) {
  return (
    <>
      {/* Business Header for navigation and sign out */}
      <BusinessHeader />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {children}
      </div>
    </>
  );
}
