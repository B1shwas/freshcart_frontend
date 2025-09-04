import { Header } from "@/components/header";
import { LandingPage } from "@/components/landing-page";
import { Footer } from "@/components/footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <LandingPage />
      <Footer />
    </div>
  );
}
