import { Pencil, Zap, Users, Download, Github, ArrowRight } from 'lucide-react';
import Link from 'next/link';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Pencil className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold text-gray-900">DrawSpace</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 transition">Features</a>
              <a href="#how-it-works" className="text-gray-600 hover:text-gray-900 transition">How It Works</a>
              <a href="#github" className="text-gray-600 hover:text-gray-900 transition flex items-center space-x-1">
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium">
                Launch App
              </button>
            </div>
          </div>
        </div>
      </nav>

      <section className="pt-20 pb-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Sketch Your Ideas,
              <span className="text-blue-600"> Share Your Vision</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              A powerful whiteboard tool for creating beautiful diagrams, sketches, and wireframes.
              Collaborate in real-time with your team, anywhere in the world.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href={"/signin"}>
                <button className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 transition font-semibold text-lg flex items-center justify-center space-x-2 shadow-lg shadow-blue-600/30">
                  <span>Sign in</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link href={"/signup"}>
                <button className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-gray-400 hover:bg-gray-50 transition font-semibold text-lg">
                  Sign up
                </button>
              </Link>
            </div>
          </div>

          <div className="mt-20 relative">
            <div className="absolute inset-0 bg-linear-to-r from-blue-100 to-cyan-100 rounded-3xl transform rotate-1"></div>
            <div className="relative bg-white rounded-2xl shadow-2xl border border-gray-200 p-8">
              <div className="aspect-video bg-linear-to-br from-gray-50 to-gray-100 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <Pencil className="w-24 h-24 text-blue-600 mx-auto mb-4 opacity-50" />
                  <p className="text-gray-500 text-lg">Interactive Canvas Preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Built for Creators</h2>
            <p className="text-xl text-gray-600">Everything you need to bring your ideas to life</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Lightning Fast</h3>
              <p className="text-gray-600 leading-relaxed">
                Optimized performance for smooth drawing experience. No lag, no delays, just pure creativity.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Real-Time Collaboration</h3>
              <p className="text-gray-600 leading-relaxed">
                Work together with your team in real-time. See changes instantly as everyone contributes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Download className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Export Anywhere</h3>
              <p className="text-gray-600 leading-relaxed">
                Export your drawings as PNG, SVG, or share with a link. Your work, your way.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple. Powerful. Free.</h2>
            <p className="text-xl text-gray-600">Get started in seconds</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Open the Canvas</h3>
              <p className="text-gray-600">No signup required. Just click and start creating immediately.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Create & Collaborate</h3>
              <p className="text-gray-600">Use intuitive tools to draw, write, and design. Share with your team.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Save & Share</h3>
              <p className="text-gray-600">Export your work or share a link. Your creations are always saved.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-linear-to-br from-blue-600 to-cyan-600 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to Start Creating?
          </h2>
          <p className="text-xl text-blue-100 mb-10">
            Join thousands of creators who use DrawSpace to bring their ideas to life
          </p>
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition font-semibold text-lg shadow-xl">
            Launch DrawSpace
          </button>
        </div>
      </section>

      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Pencil className="w-6 h-6 text-blue-500" />
              <span className="text-xl font-bold text-white">DrawSpace</span>
            </div>
            <div className="flex space-x-6">
              <a href="#" className="hover:text-white transition">Privacy</a>
              <a href="#" className="hover:text-white transition">Terms</a>
              <a href="#" className="hover:text-white transition">Contact</a>
              <a href="#" className="hover:text-white transition">GitHub</a>
            </div>
          </div>
          <div className="mt-8 text-center text-sm">
            <p>&copy; 2024 DrawSpace. Open source and free forever.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
