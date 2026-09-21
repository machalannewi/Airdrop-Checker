import Navbar from "./components/Navbar.jsx";
import Hero from "./components/Hero.jsx";
import Stats from "./components/Stats.jsx";
import Benefits from "./components/Benefits.jsx";
import Testimonials from "./components/Testimonials.jsx";
import Pricing from "./components/Pricing.jsx";
import FAQ from "./components/FAQ.jsx";
import CTA from "./components/CTA.jsx";
import Footer from "./components/Footer.jsx";

export default function Landing() {
  return (
    <div className="min-h-screen bg-black">
      <Navbar />
      <Hero />
      <Stats />
      <Benefits />
      <Testimonials />
      <Pricing />
      <FAQ />
      <CTA />
      <Footer />
    </div>
  );
}
