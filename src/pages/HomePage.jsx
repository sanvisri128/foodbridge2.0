// HomePage — landing page with hero, stats, how-it-works, and CTA sections
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  Leaf, ArrowRight, Utensils, Heart, Users, Building2,
  ChevronRight, Package, MapPin, Clock
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();

  return (
    <main>
      {/* ─── Hero ─────────────────────────────────────────────── */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-neutral-900">
        {/* Background image with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          }}
        />
        <div className="absolute inset-0 bg-neutral-900/65" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="max-w-2xl">
            {/* Pill badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 text-white text-sm font-medium px-4 py-1.5 rounded-full mb-6">
              <Leaf className="w-4 h-4 text-primary-400" />
              Reducing food waste, one meal at a time
            </div>

            <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
              Bridge the Gap<br />
              <span className="text-primary-400">Between Surplus</span><br />
              and Need
            </h1>

            <p className="text-lg md:text-xl text-white/80 mb-8 leading-relaxed max-w-xl">
              FoodBridge connects restaurants, hostels, canteens, and wedding halls with NGOs,
              orphanages, and shelters — turning excess food into hope.
            </p>

            <div className="flex flex-wrap gap-4">
              {user ? (
                user.role === 'provider' ? (
                  <Link to="/donate" className="btn-primary flex items-center gap-2 text-base px-8 py-3">
                    Donate Food Now <ArrowRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <Link to="/listings" className="btn-primary flex items-center gap-2 text-base px-8 py-3">
                    Find Available Food <ArrowRight className="w-5 h-5" />
                  </Link>
                )
              ) : (
                <>
                  <Link to="/register" className="btn-primary flex items-center gap-2 text-base px-8 py-3">
                    Get Started <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link to="/listings" className="border-2 border-white/60 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-all duration-200 flex items-center gap-2">
                    Browse Donations
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/40 rounded-full flex items-start justify-center pt-2">
            <div className="w-1.5 h-2.5 bg-white/60 rounded-full" />
          </div>
        </div>
      </section>

      {/* ─── Stats ────────────────────────────────────────────── */}
      <section className="bg-primary-600 py-14">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
            {[
              { number: '1M+', label: 'Meals Saved' },
              { number: '500+', label: 'Food Providers' },
              { number: '200+', label: 'NGO Partners' },
              { number: '50+', label: 'Cities Covered' },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="font-display text-4xl font-bold">{stat.number}</p>
                <p className="text-primary-100 text-sm mt-1 font-medium">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── How It Works ─────────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
              Simple Process
            </p>
            <h2 className="section-title mb-4">How FoodBridge Works</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-lg">
              Three easy steps to connect surplus food with people who need it most.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connector line (desktop) */}
            <div className="hidden md:block absolute top-12 left-1/4 right-1/4 h-px bg-primary-100" />

            {[
              {
                step: '01',
                icon: <Building2 className="w-7 h-7 text-primary-600" />,
                title: 'Provider Posts Food',
                desc: 'Restaurants, canteens, and wedding halls list available surplus food with quantity, location, and pickup deadline.',
              },
              {
                step: '02',
                icon: <Package className="w-7 h-7 text-primary-600" />,
                title: 'NGO Finds & Claims',
                desc: 'NGOs, orphanages, and shelters browse real-time listings and claim donations with a single click.',
              },
              {
                step: '03',
                icon: <Heart className="w-7 h-7 text-primary-600" />,
                title: 'Food Reaches People',
                desc: 'Meals reach those in need before they expire, reducing waste and fighting hunger simultaneously.',
              },
            ].map((item) => (
              <div key={item.step} className="relative flex flex-col items-center text-center p-6">
                <div className="w-16 h-16 bg-primary-50 rounded-2xl flex items-center justify-center mb-4 relative z-10 border border-primary-100">
                  {item.icon}
                </div>
                <span className="text-xs font-bold text-primary-400 tracking-widest mb-2">STEP {item.step}</span>
                <h3 className="font-display font-bold text-xl text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-neutral-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Who Can Join ─────────────────────────────────────── */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">
              For Everyone
            </p>
            <h2 className="section-title mb-4">Who Uses FoodBridge?</h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: <Utensils className="w-8 h-8 text-accent-600" />, title: 'Restaurants', desc: 'Share leftover cooked meals at the end of service.' },
              { icon: <Building2 className="w-8 h-8 text-accent-600" />, title: 'Hostels & Canteens', desc: 'Donate surplus food from daily meal preparation.' },
              { icon: <Users className="w-8 h-8 text-primary-600" />, title: 'NGOs & Shelters', desc: 'Receive nutritious meals to feed the community.' },
              { icon: <Heart className="w-8 h-8 text-primary-600" />, title: 'Orphanages', desc: 'Access regular food donations for children in care.' },
            ].map((item) => (
              <div key={item.title} className="card text-center group">
                <div className="w-14 h-14 bg-neutral-100 group-hover:bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4 transition-colors">
                  {item.icon}
                </div>
                <h3 className="font-display font-bold text-neutral-900 mb-2">{item.title}</h3>
                <p className="text-sm text-neutral-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live Food Banner ──────────────────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-primary-600 font-semibold text-sm uppercase tracking-wider mb-3">Live Listings</p>
              <h2 className="section-title mb-4">Food Available Right Now</h2>
              <p className="text-neutral-500 text-lg mb-6 leading-relaxed">
                Browse real-time donations near you. Filter by food type, location, or urgency to
                find what your organisation needs most.
              </p>
              <Link to="/listings" className="btn-primary inline-flex items-center gap-2">
                View All Listings <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Preview cards */}
            <div className="space-y-3">
              {[
                { food: 'Biryani & Dal', qty: '40 portions', loc: 'Koramangala, Bangalore', expiry: '3 hours', cat: 'cooked' },
                { food: 'Sandwich Platter', qty: '60 pieces', loc: 'Connaught Place, Delhi', expiry: '5 hours', cat: 'packaged' },
                { food: 'Fresh Vegetables', qty: '15 kg', loc: 'T Nagar, Chennai', expiry: '2 days', cat: 'raw' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-4 bg-neutral-50 rounded-xl p-4 border border-neutral-100">
                  <div className="w-10 h-10 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Package className="w-5 h-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-neutral-900 text-sm">{item.food}</p>
                    <div className="flex items-center gap-3 text-xs text-neutral-500 mt-0.5">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{item.loc}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.expiry}</span>
                    </div>
                  </div>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                    item.cat === 'cooked' ? 'bg-amber-100 text-amber-700' :
                    item.cat === 'packaged' ? 'bg-blue-100 text-blue-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {item.qty}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA ──────────────────────────────────────────────── */}
      <section className="py-20 bg-primary-600">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="font-display text-4xl md:text-5xl font-bold text-white mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-primary-100 text-lg mb-8">
            Join thousands of providers and NGOs already using FoodBridge to fight food waste.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/register" className="bg-white text-primary-700 font-semibold px-8 py-3 rounded-lg hover:bg-primary-50 transition-colors">
              Sign Up Free
            </Link>
            <Link to="/listings" className="border-2 border-white/60 text-white font-semibold px-8 py-3 rounded-lg hover:bg-white/10 transition-colors">
              Browse Food
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ───────────────────────────────────────────── */}
      <footer className="bg-neutral-900 text-neutral-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-primary-600 rounded-lg flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold text-white text-lg">FoodBridge</span>
          </div>
          <p className="text-sm">© 2024 FoodBridge. Connecting surplus food with those who need it.</p>
          <div className="flex gap-4 text-sm">
            <Link to="/listings" className="hover:text-white transition-colors">Browse</Link>
            <Link to="/register" className="hover:text-white transition-colors">Register</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
