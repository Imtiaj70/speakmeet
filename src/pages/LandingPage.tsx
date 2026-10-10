import React from 'react';
import { HeroSection } from '../components/landing/HeroSection';
import { HowItWorksSection } from '../components/landing/HowItWorksSection';
import { WhySection } from '../components/landing/WhySection';
import { PopularTopicsSection } from '../components/landing/PopularTopicsSection';
import { LiveRoomsSection } from '../components/landing/LiveRoomsSection';
import { StatsSection } from '../components/landing/StatsSection';
import { TestimonialsSection } from '../components/landing/TestimonialsSection';
import { CTASection } from '../components/landing/CTASection';

export const LandingPage: React.FC = () => {
  return (
    <div className="flex flex-col">
      {/* 2. Hero Section */}
      <HeroSection />

      {/* 3. How It Works */}
      <HowItWorksSection />

      {/* 4. Why SpeakMate */}
      <WhySection />

      {/* 5. Popular Topics */}
      <PopularTopicsSection />

      {/* 6. Live Rooms Preview */}
      <LiveRoomsSection />

      {/* 7. Platform Statistics */}
      <StatsSection />

      {/* 8. Testimonials */}
      <TestimonialsSection />

      {/* 9. Final Call to Action */}
      <CTASection />
    </div>
  );
};
