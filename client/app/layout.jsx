import { Raleway, Outfit } from "next/font/google";
import "./globals.css";

const raleway = Raleway({
  subsets: ["latin"],
  weight: ["100","200","300", "400","500","600", "700"],
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
        {children}
      </body>
    </html>
  );
}