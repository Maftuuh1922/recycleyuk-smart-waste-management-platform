import React from 'react';
import { Link } from 'react-router-dom';
import { Leaf, Recycle, MapPin, Truck, ChevronRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/ThemeToggle';
export function HomePage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <ThemeToggle />
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50 to-transparent dark:from-emerald-950/20 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-sm font-medium animate-fade-in">
              <Sparkles className="w-4 h-4" />
              <span>Modernizing Waste Logistics</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold tracking-tight text-balance leading-tight">
              Manage Waste with <span className="text-emerald-600">Intelligence.</span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty max-w-2xl mx-auto">
              RecycleYuk connects households with local waste collectors in real-time. Smart tracking, automated scheduling, and eco-friendly logistics at your fingertips.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-full px-8 h-12 text-lg">
                <Link to="/login">
                  Get Started <ChevronRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" className="rounded-full px-8 h-12 text-lg">
                View Network
              </Button>
            </div>
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <FeatureCard 
              icon={<Recycle className="w-8 h-8 text-emerald-600" />}
              title="Easy Booking"
              description="Request a pickup for various waste types (Organic, Plastic, Electronic) with just two taps."
            />
            <FeatureCard 
              icon={<MapPin className="w-8 h-8 text-emerald-600" />}
              title="Live Tracking"
              description="Watch your collector arrive in real-time. No more waiting outside or missing the truck."
            />
            <FeatureCard 
              icon={<Truck className="w-8 h-8 text-emerald-600" />}
              title="Reliable Network"
              description="Vetted collectors (TPU) dedicated to keeping our neighborhoods clean and sustainable."
            />
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-emerald-600 rounded-3xl p-8 md:p-16 text-center text-white relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Leaf className="w-64 h-64 rotate-12" />
            </div>
            <h2 className="text-3xl md:text-5xl font-bold mb-6">Ready to make a change?</h2>
            <p className="text-emerald-100 text-lg mb-10 max-w-xl mx-auto">
              Join thousands of residents in the RW 04 Community improving their environmental footprint today.
            </p>
            <Button asChild size="lg" variant="secondary" className="rounded-full px-12 h-14 text-lg font-semibold text-emerald-700">
              <Link to="/login">Login Now</Link>
            </Button>
          </div>
        </div>
      </section>
      <footer className="py-12 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-muted-foreground">
          <div className="flex items-center justify-center gap-2 mb-4 font-bold text-foreground">
            <Recycle className="w-6 h-6 text-emerald-600" />
            <span>RecycleYuk</span>
          </div>
          <p>© 2024 RecycleYuk Logistics. Built for cleaner communities.</p>
        </div>
      </footer>
    </div>
  );
}
function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="space-y-4 p-6 rounded-2xl bg-background border hover:shadow-lg transition-shadow">
      <div className="w-16 h-16 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
        {icon}
      </div>
      <h3 className="text-xl font-bold">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </div>
  );
}