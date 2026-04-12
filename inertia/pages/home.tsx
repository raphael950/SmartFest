import HeroSection from "../components/HeroSection";
import LivePreview from "../components/LivePreview";
import FeaturesSection from "../components/FeaturesSection";
import CommunitySection from "../components/CommunitySection";

const Home = () => {
  return (
    <div className="min-h-screen bg-background">
      <main className="pt-14">
        <HeroSection />
        <LivePreview />
        <FeaturesSection />
        <CommunitySection />
      </main>
    </div>
  );
};

export default Home;