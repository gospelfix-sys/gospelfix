import TopBar from "@/components/layout/TopBar";
import Footer from "@/components/layout/Footer";

export default function PublicLayout({
  children,
  modal,
}: {
  children: React.ReactNode;
  modal: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-gf-bg">
      <TopBar />
      <main className="flex-1">{children}</main>
      <Footer />
      {modal}
    </div>
  );
}
