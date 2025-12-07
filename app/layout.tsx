import "./globals.css";

export const metadata = {
  title: "Dot Voting Poll",
  description: "Minimal dot voting application"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
