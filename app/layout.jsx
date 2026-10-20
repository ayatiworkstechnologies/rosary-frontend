import "./globals.css";

export const metadata = {
  title: "Rosary School Portal",
  description: "Parent and Teacher Portal - Rosary School",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body>{children}</body>
    </html>
  );
}
