import StickyHeader from "../components/plumbazing/StickyHeader";
import HeroSection from "../components/plumbazing/HeroSection";
import TrustStrip from "../components/plumbazing/TrustStrip";
import ServicesGrid from "../components/plumbazing/ServicesGrid";
import HowItWorks from "../components/plumbazing/HowItWorks";
import ReviewsSection from "../components/plumbazing/ReviewsSection";
import ServiceArea from "../components/plumbazing/ServiceArea";
import FAQSection from "../components/plumbazing/FAQSection";
import CTABand from "../components/plumbazing/CTABand";
import Footer from "../components/plumbazing/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <StickyHeader />
      <main>
        <HeroSection />
        <TrustStrip />
        <ServicesGrid />
        <HowItWorks />
        <ReviewsSection />
        <ServiceArea />
        <FAQSection />
        <CTABand />
      </main>
      <Footer />
    </div>
  );
}