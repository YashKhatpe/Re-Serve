"use client";
import { motion } from "framer-motion";

export default function Footer() {
  const footerLinks = {
    Company: [
      { name: "About Us", href: "#about" },
      { name: "How It Works", href: "#how-it-works" },
      { name: "Impact Stories", href: "#impact" },
      { name: "Careers", href: "#careers" },
    ],
    "For Restaurants": [
      { name: "Get Started", href: "#restaurant-signup" },
      { name: "Benefits", href: "#benefits" },
      { name: "Tax Information", href: "#tax-info" },
      { name: "Support", href: "#support" },
    ],
    "For NGOs": [
      { name: "Join as NGO", href: "#ngo-signup" },
      { name: "Verification Process", href: "#verification" },
      { name: "Best Practices", href: "#practices" },
      { name: "Resources", href: "#resources" },
    ],
    Legal: [
      { name: "Privacy Policy", href: "#privacy" },
      { name: "Terms of Service", href: "#terms" },
      { name: "Cookie Policy", href: "#cookies" },
      { name: "Data Security", href: "#security" },
    ],
  };

  const socialLinks = [
    { name: "Twitter", icon: "🐦", href: "#twitter" },
    { name: "Facebook", icon: "📘", href: "#facebook" },
    { name: "LinkedIn", icon: "💼", href: "#linkedin" },
    { name: "Instagram", icon: "📷", href: "#instagram" },
  ];

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        {/* Main Footer Content */}
        <div className="py-16">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* Brand Section */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="lg:col-span-2"
            >
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <span className="text-2xl font-bold">Re-Serve</span>
              </div>
              <p className="text-gray-300 leading-relaxed mb-6 max-w-md">
                Connecting restaurants with surplus food to NGOs, creating
                meaningful impact while reducing food waste. Together, we can
                serve a meal and change a life.
              </p>
              {/* Social Links */}
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => (
                  <motion.a
                    key={index}
                    href={social.href}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-orange-500 transition-colors"
                  >
                    <span className="text-lg">{social.icon}</span>
                  </motion.a>
                ))}
              </div>
            </motion.div>
            {/* Footer Links */}
            {Object.entries(footerLinks).map(
              ([category, links], categoryIndex) => (
                <motion.div
                  key={category}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                  viewport={{ once: true }}
                >
                  <h3 className="text-lg font-semibold mb-4 text-orange-400">
                    {category}
                  </h3>
                  <ul className="space-y-3">
                    {links.map((link, index) => (
                      <li key={index}>
                        <a
                          href={link.href}
                          className="text-gray-300 hover:text-orange-400 transition-colors"
                        >
                          {link.name}
                        </a>
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )
            )}
          </div>
        </div>
        {/* Newsletter Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 py-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-xl font-semibold mb-2">Stay Updated</h3>
              <p className="text-gray-300">
                Get the latest updates on our impact and new features.
              </p>
            </div>
            <div className="flex gap-4">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
              />
              <button className="bg-orange-500 hover:bg-orange-600 px-6 py-3 rounded-lg font-semibold transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </motion.div>
        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 py-6"
        >
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2025 Re-Serve. All rights reserved. Making every meal count.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#accessibility"
                className="text-gray-400 hover:text-orange-400 text-sm transition-colors"
              >
                Accessibility
              </a>
              <a
                href="#sitemap"
                className="text-gray-400 hover:text-orange-400 text-sm transition-colors"
              >
                Sitemap
              </a>
              <a
                href="#contact"
                className="text-gray-400 hover:text-orange-400 text-sm transition-colors"
              >
                Contact
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </footer>
  );
}
