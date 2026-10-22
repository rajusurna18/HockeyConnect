import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function HomePage() {
  const { isAuthenticated, user } = useAuth();
  const dashboardLink = user?.role === 'ADMIN' ? '/admin/dashboard'
    : user?.role === 'COACH' ? '/coach/dashboard' : '/student/dashboard';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 text-white">
      {/* Nav */}
      <nav className="border-b border-slate-700/50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">H</span>
          </div>
          <span className="font-bold text-xl text-white">HockeyConnect</span>
        </div>
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link to={dashboardLink} className="btn-primary">Go to Dashboard</Link>
          ) : (
            <>
              <Link to="/login" className="btn-outline">Sign In</Link>
              <Link to="/register" className="btn-primary">Join Free</Link>
            </>
          )}
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-block bg-blue-900/40 border border-blue-700/50 text-blue-300 text-sm px-4 py-1.5 rounded-full mb-6">
          PSE Project — Problem Solving in Engineering
        </div>
        <h1 className="text-5xl md:text-7xl font-black leading-tight mb-6">
          Connect. Train.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">
            Compete. Grow.
          </span>
        </h1>
        <p className="text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed">
          The digital platform connecting school and college students in Hyderabad with hockey training opportunities, competitions, and coaching.
        </p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to={isAuthenticated ? dashboardLink : '/register'} className="btn-primary text-lg py-3 px-8">
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
          </Link>
          <Link to="/opportunities" className="btn-outline text-lg py-3 px-8">Browse Opportunities</Link>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="bg-slate-800/50 border-y border-slate-700/50 py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-3">The Problem We're Solving</h2>
            <div className="text-slate-400 text-lg">Declining Participation in Hockey Among School and College Students</div>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {[
              { label: 'Super System', value: 'Sports & Lifestyle', icon: '⚡' },
              { label: 'Location', value: 'Hyderabad, Telangana', icon: '📍' },
              { label: 'Target Group', value: 'School & College Students', icon: '🎓' },
            ].map(({ label, value, icon }) => (
              <div key={label} className="card text-center">
                <div className="text-3xl mb-2">{icon}</div>
                <div className="text-slate-400 text-sm">{label}</div>
                <div className="text-white font-semibold mt-1">{value}</div>
              </div>
            ))}
          </div>
          <div className="card">
            <div className="text-slate-400 text-sm font-medium mb-2">HMW Question</div>
            <div className="text-white text-lg font-medium italic">
              "How might we increase hockey participation among school and college students in Hyderabad?"
            </div>
          </div>
        </div>
      </section>

      {/* Leverage Point Flow */}
      <section className="py-16 max-w-4xl mx-auto px-6">
        <h2 className="text-3xl font-bold text-center mb-10">Module 3 Leverage Point</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
          {['Student Interest', 'Training Opportunity', 'Competition', 'Continued Participation'].map((step, i) => (
            <div key={step} className="flex items-center gap-4">
              <div className="bg-blue-900/40 border border-blue-700/50 rounded-xl px-6 py-4 text-center">
                <div className="text-blue-400 font-bold text-sm">STEP {i + 1}</div>
                <div className="text-white font-semibold mt-1">{step}</div>
              </div>
              {i < 3 && <div className="text-blue-400 text-2xl hidden md:block">→</div>}
            </div>
          ))}
        </div>
        <p className="text-center text-slate-400 mt-6">HockeyConnect strengthens every step of this pathway digitally.</p>
      </section>

      {/* Features */}
      <section className="bg-slate-800/30 py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="text-3xl font-bold text-center mb-10">Platform Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { icon: '🏑', title: 'For Students', features: ['Discover training opportunities', 'Register for competitions', 'Track attendance & performance', 'Get personalized recommendations'] },
              { icon: '🎽', title: 'For Coaches', features: ['Create training sessions', 'Mark student attendance', 'Record performance evaluations', 'Manage registrations'] },
              { icon: '📊', title: 'For Admins', features: ['Real-time analytics dashboard', 'Excel import/export', 'Manage all entities', 'Participation trend tracking'] },
            ].map(({ icon, title, features }) => (
              <div key={title} className="card-hover p-6">
                <div className="text-4xl mb-4">{icon}</div>
                <h3 className="text-white font-bold text-xl mb-3">{title}</h3>
                <ul className="space-y-2">
                  {features.map(f => (
                    <li key={f} className="text-slate-400 text-sm flex items-start gap-2">
                      <span className="text-emerald-400 mt-0.5">✓</span>{f}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 text-center px-6">
        <h2 className="text-3xl font-bold mb-4">Ready to Play?</h2>
        <p className="text-slate-400 mb-8">Join hundreds of students discovering hockey in Hyderabad</p>
        <div className="flex flex-wrap gap-4 justify-center">
          <Link to="/register" className="btn-primary text-lg py-3 px-8">Join as Student</Link>
          <Link to="/register" className="btn-outline text-lg py-3 px-8">Join as Coach</Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8 text-center text-slate-500 text-sm">
        <p>HockeyConnect — PSE Module 4 Project · Hyderabad, Telangana</p>
        <p className="mt-1">Demo data only. Not affiliated with any real hockey organization.</p>
      </footer>
    </div>
  );
}
