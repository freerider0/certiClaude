import { HeroSection } from '@/components/landing/hero-section';
import { ProblemSolution } from '@/components/landing/problem-solution';
import { VideoShowcase } from '@/components/landing/video-showcase';
import { SocialProof } from '@/components/landing/social-proof';
import { FinalCTA } from '@/components/landing/final-cta';

export default function HomePage() {
  return (
    <div className="min-h-screen">
      <HeroSection />
      <ProblemSolution />
      <VideoShowcase />
      <SocialProof />
      <FinalCTA />
    </div>
  );
}