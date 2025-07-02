import { Raleway, Outfit } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";
import { AuthProvider } from "@/app/providers";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700"],
  variable: "--font-raleway",
});

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
});

export const metadata = {
  title: "inHalt",
  description: "A Title Description To Go Here!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${raleway.variable} ${outfit.variable}`}>
      <body>
        <AuthProvider>
          <Toaster />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
