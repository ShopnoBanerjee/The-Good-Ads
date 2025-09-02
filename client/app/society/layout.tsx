import Header from "@/components/header";

export default function SocietyLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      {/* Society Header for navigation and sign out */}
      <Header /> 
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        {children}
      </div>
    </>
  );
}
