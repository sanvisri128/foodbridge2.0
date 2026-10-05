// HomePage — dynamic landing page with live platform statistics, urgent listings, and features overview
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext.jsx';
import CountdownTimer from '../components/CountdownTimer.jsx';
import {
  ArrowRight, Utensils, Heart, Building2,
  ChevronRight, Package, MapPin, ShieldCheck,
  KeyRound, Sparkles, Globe, CheckCircle2, Leaf
} from 'lucide-react';

export default function HomePage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalMealsRescued: 1450,
    foodSavedKg: 650,
    co2SavedKg: 1160,
    totalProviders: 52,
    totalNGOs: 38,
    activeDonations: 8,
  });
  const [liveDonations, setLiveDonations] = useState([]);

  useEffect(() => {
    // Fetch live platform metrics
    const loadPlatformData = async () => {
      try {
        const [statsRes, donationsRes] = await Promise.all([
          axios.get('/api/donations/stats/platform'),
          axios.get('/api/donations?category=&location='),
        ]);
        if (statsRes.data) setStats(statsRes.data);
        if (donationsRes.data?.donations) {
          setLiveDonations(donationsRes.data.donations.slice(0, 3));
        }
      } catch (err) {
        console.error('Home live stats fetch error:', err);
      }
    };
    loadPlatformData();
  }, []);

  return (
    <main className="overflow-hidden">
      {/* ─── Hero Section ────────────────────────────────────────── */}
      <section className="relative min-h-[90vh] flex items-center bg-neutral-950 text-white">
        {/* Ambient background with overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40 mix-blend-luminosity scale-105 transition-transform duration-1000"
          style={{
            backgroundImage:
              'url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1600)',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-28">
          <div className="max-w-2xl space-y-6">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 bg-emerald-500/10 backdrop-blur-md border border-emerald-500/30 text-emerald-400 text-xs sm:text-sm font-semibold px-4 py-1.5 rounded-full shadow-lg">
              <Sparkles className="w-4 h-4 text-emerald-400 animate-pulse" />
              FoodBridge 2.0 — Smart Surplus Food Rescue Network
            </div>

            <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.1]">
              Turn Surplus Food Into <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 via-emerald-300 to-primary-200">
                Nutritious Community Meals
              </span>
            </h1>

            <p className="text-base sm:text-lg text-neutral-300 leading-relaxed max-w-xl">
              Connecting restaurants, caterers, hostels, and wedding venues with registered NGOs,
              orphanages, and shelters in real-time — with verified OTP handovers.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              {user ? (
                user.role === 'provider' ? (
                  <>
                    <Link
                      to="/donate"
                      className="btn-primary flex items-center gap-2 text-sm sm:text-base px-7 py-3 shadow-lg shadow-primary-600/30"
                    >
                      Donate Food Now <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/provider-dashboard"
                      className="border border-white/30 text-white font-bold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors text-sm"
                    >
                      Provider Dashboard
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      to="/listings"
                      className="btn-primary flex items-center gap-2 text-sm sm:text-base px-7 py-3 shadow-lg shadow-primary-600/30"
                    >
                      Find Available Food <ArrowRight className="w-5 h-5" />
                    </Link>
                    <Link
                      to="/dashboard"
                      className="border border-white/30 text-white font-bold px-6 py-3 rounded-lg hover:bg-white/10 transition-colors text-sm"
                    >
                      NGO Dashboard
                    </Link>
                  </>
                )
              ) : (
                <>
                  <Link
                    to="/register"
                    className="btn-primary flex items-center gap-2 text-sm sm:text-base px-8 py-3.5 shadow-lg shadow-primary-600/30 font-bold"
                  >
                    Join the Network <ArrowRight className="w-5 h-5" />
                  </Link>
                  <Link
                    to="/listings"
                    className="border-2 border-white/40 text-white font-bold px-6 py-3.5 rounded-lg hover:bg-white/10 transition-colors text-sm sm:text-base flex items-center gap-2"
                  >
                    Browse Available Food
                  </Link>
                </>
              )}
            </div>

            {/* Micro proof tags */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 pt-4">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 100% Free for Charities
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Secure OTP Handover
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Food Safety Verified
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Real-Time Impact Counters ────────────────────────────── */}
      <section className="bg-gradient-to-r from-primary-800 via-primary-700 to-emerald-800 py-12 text-white border-y border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <p className="font-display text-4xl lg:text-5xl font-black text-white">
                {stats.totalMealsRescued?.toLocaleString()}+
              </p>
              <p className="text-primary-100 text-xs sm:text-sm font-semibold mt-1 uppercase tracking-wider">
                Meals Saved & Fed
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <p className="font-display text-4xl lg:text-5xl font-black text-emerald-300">
                {stats.co2SavedKg?.toLocaleString()} kg
              </p>
              <p className="text-primary-100 text-xs sm:text-sm font-semibold mt-1 uppercase tracking-wider">
                CO2 Emissions Prevented
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <p className="font-display text-4xl lg:text-5xl font-black text-white">
                {stats.totalProviders}+
              </p>
              <p className="text-primary-100 text-xs sm:text-sm font-semibold mt-1 uppercase tracking-wider">
                Verified Food Providers
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 backdrop-blur-xs border border-white/10">
              <p className="font-display text-4xl lg:text-5xl font-black text-amber-300">
                {stats.totalNGOs}+
              </p>
              <p className="text-primary-100 text-xs sm:text-sm font-semibold mt-1 uppercase tracking-wider">
                NGO & Shelter Partners
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works: 4-Step Secure Workflow ─────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-primary-600 font-extrabold text-xs uppercase tracking-widest bg-primary-50 px-3.5 py-1 rounded-full">
              End-to-End Workflow
            </span>
            <h2 className="section-title mt-3 mb-3">How FoodBridge 2.0 Works</h2>
            <p className="text-neutral-500 max-w-xl mx-auto text-sm sm:text-base">
              A transparent, safe, and lightning-fast process from surplus food declaration to distribution.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: <Building2 className="w-6 h-6 text-primary-600" />,
                title: 'Provider Posts Food',
                desc: 'Restaurants & canteens enter surplus meal quantity, storage condition, and pickup deadline with safety confirmation.',
              },
              {
                step: '02',
                icon: <Globe className="w-6 h-6 text-primary-600" />,
                title: 'Instant NGO Matching',
                desc: 'Shelters & NGOs in the area browse real-time listings with live countdown timers and claim with one click.',
              },
              {
                step: '03',
                icon: <KeyRound className="w-6 h-6 text-amber-600" />,
                title: 'Secure OTP Handover',
                desc: 'A unique 4-digit pickup code is generated for the NGO driver to verify upon collection with the provider.',
              },
              {
                step: '04',
                icon: <Heart className="w-6 h-6 text-rose-600" />,
                title: 'Communities Fed',
                desc: 'Wholesome, hot meals reach orphanages and hungry families within hours instead of going to landfills.',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="card border border-neutral-200/80 hover:border-primary-400 flex flex-col justify-between transition-all duration-300"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center border border-primary-100">
                      {item.icon}
                    </div>
                    <span className="font-display font-black text-2xl text-neutral-300">
                      {item.step}
                    </span>
                  </div>
                  <h3 className="font-display font-bold text-lg text-neutral-900 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-neutral-500 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Live Food Feed & Urgent Community Broadcasts ────────── */}
      <section className="py-20 bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-5 space-y-5">
              <span className="text-primary-600 font-extrabold text-xs uppercase tracking-widest bg-primary-100/70 px-3.5 py-1 rounded-full">
                Real-Time Rescue Feed
              </span>
              <h2 className="section-title">Fresh Food Available Right Now</h2>
              <p className="text-neutral-600 text-sm sm:text-base leading-relaxed">
                Surplus food loses nutritional value and expires quickly. Our live system tracks every
                listing with precision timers so no portion is wasted.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3 text-xs text-neutral-700 font-medium">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                  <span>Quality certified & checked for freshness and dietary tags.</span>
                </div>
                <div className="flex items-start gap-3 text-xs text-neutral-700 font-medium">
                  <MapPin className="w-4 h-4 text-rose-500 mt-0.5 flex-shrink-0" />
                  <span>Integrated Google Maps directions for pickup drivers.</span>
                </div>
              </div>

              <div className="pt-4 flex flex-wrap gap-3">
                <Link to="/listings" className="btn-primary text-sm py-2.5 px-6 flex items-center gap-2">
                  View All Live Listings <ChevronRight className="w-4 h-4" />
                </Link>
                <Link to="/requests" className="btn-secondary text-sm py-2.5 px-5">
                  Community Food Requests
                </Link>
              </div>
            </div>

            {/* Live Preview Cards */}
            <div className="lg:col-span-7 space-y-4">
              {liveDonations.length > 0 ? (
                liveDonations.map((item) => (
                  <div
                    key={item._id}
                    className="card border border-neutral-200 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-primary-400 transition-all shadow-xs"
                  >
                    <div className="flex items-start gap-3.5">
                      <div className="w-11 h-11 bg-primary-50 rounded-2xl flex items-center justify-center flex-shrink-0 border border-primary-100">
                        <Utensils className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-neutral-900">{item.foodName}</h4>
                          <span className="text-[10px] uppercase font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                            {item.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-500 mt-1">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-neutral-400" />
                            {item.location}
                          </span>
                          <span>·</span>
                          <span className="font-semibold text-neutral-800">
                            {item.quantity} (~{item.servings || 15} meals)
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 flex-shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-neutral-100">
                      <CountdownTimer expiryTime={item.expiryTime} compact />
                      <Link
                        to="/listings"
                        className="btn-primary text-xs py-1.5 px-3.5 shadow-xs"
                      >
                        Claim
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="card text-center py-12 border border-neutral-200">
                  <Package className="w-12 h-12 text-neutral-300 mx-auto mb-2" />
                  <p className="text-neutral-700 font-bold text-sm">All surplus food currently claimed!</p>
                  <p className="text-neutral-500 text-xs mt-1">Check back shortly as providers post new batches.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Food Safety & Quality Standards ─────────────────────── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-emerald-900 via-primary-900 to-neutral-900 rounded-3xl p-8 lg:p-12 text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 bg-emerald-400/20 text-emerald-300 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                Food Safety Guarantee
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-extrabold text-white">
                Safe, Clean, and Dignified Food Rescue
              </h2>
              <p className="text-neutral-300 text-sm sm:text-base leading-relaxed">
                Food safety is our top priority. Providers adhere to strict hygiene protocols, sensory
                audits, temperature maintenance, and precise expiry limits before sharing food.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-4 text-xs font-semibold text-emerald-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Temperature Monitored
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Sealed Containers
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Allergen Transparency
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Verified Partners Only
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Call to Action ──────────────────────────────────────── */}
      <section className="py-20 bg-primary-600 text-white text-center">
        <div className="max-w-3xl mx-auto px-4">
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-4">
            Be the Bridge. Stop Food Waste Today.
          </h2>
          <p className="text-primary-100 text-sm sm:text-base mb-8 max-w-xl mx-auto">
            Whether you run a restaurant with surplus food or represent a shelter feeding hundreds,
            FoodBridge connects you seamlessly.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <Link
              to="/register"
              className="bg-white text-primary-800 font-extrabold text-sm sm:text-base px-8 py-3.5 rounded-xl hover:bg-primary-50 transition-colors shadow-lg"
            >
              Sign Up Now — It's Free
            </Link>
            <Link
              to="/listings"
              className="border-2 border-white/60 text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-xl hover:bg-white/10 transition-colors"
            >
              Browse Active Food
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────── */}
      <footer className="bg-neutral-950 text-neutral-400 py-12 border-t border-neutral-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center text-white">
              <Leaf className="w-4 h-4" />
            </div>
            <div>
              <p className="font-display font-bold text-white text-base">FoodBridge 2.0</p>
              <p className="text-[11px] text-neutral-500">Zero Hunger · Zero Waste</p>
            </div>
          </div>

          <p>© 2026 FoodBridge. Empowering food rescue operations worldwide.</p>

          <div className="flex items-center gap-5 font-semibold text-neutral-300">
            <Link to="/listings" className="hover:text-white transition-colors">
              Available Food
            </Link>
            <Link to="/requests" className="hover:text-white transition-colors">
              Food Requests
            </Link>
            <Link to="/login" className="hover:text-white transition-colors">
              Sign In
            </Link>
            <Link to="/register" className="hover:text-white transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
