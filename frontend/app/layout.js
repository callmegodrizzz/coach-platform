import { Inter, Manrope } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
});

const manrope = Manrope({
  variable: "--font-manrope",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata = {
  title: "MATERIUM — Лаборатория лидеров будущего",
  description: "Креативный образовательный процесс для визионеров, предпринимателей и креаторов.",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ru"
      className={`${inter.variable} ${manrope.variable} antialiased`}
    >
      <body className="min-h-screen bg-cream text-ink font-sans">
        {children}
      </body>
    </html>
  );
}
