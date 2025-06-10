"use client";
import { motion } from "framer-motion";

export default function Footer() {
  const footerLinks = {
    Company: [
      { name: "About Us", href: "/about" },
      { name: "How It Works", href: "/how-it-works" },
      // { name: "Impact Stories", href: "#impact" },
      // { name: "Careers", href: "#careers" },
    ],
    "For Restaurants": [
      { name: "Get Started", href: "/register" },
      { name: "Features", href: "/features" },
      // { name: "Tax Information", href: "#tax-info" },
      // { name: "Support", href: "#support" },
    ],
    "For NGOs": [
      { name: "Join as NGO", href: "/register" },
      { name: "Benefits", href: "/features" },
      // { name: "Best Practices", href: "#practices" },
      // { name: "Resources", href: "#resources" },
    ],
  };

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

        {/* Bottom Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 py-6"
        >
          <div className="flex justify-center items-center text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Re-Serve. All rights reserved. Making every meal count.
            </p>
          </div>
        </motion.div>

      </div>
    </footer>
  );
}
