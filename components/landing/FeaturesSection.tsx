"use client";
import { motion } from "framer-motion";

export default function FeaturesSection() {
  const features = [
    {
      title: "Location-Based Filtering",
      description:
        "Filter donations based on location, ensuring that the food reaches the needy in the right place.",
      icon: "📍",
      color: "orange",
    },
    {
      title: "Food Safety Verification",
      description:
        "Automated safety checks and quality verification ensure only safe food is donated.",
      icon: "🛡️",
      color: "green",
    },
    {
      title: "OTP-Based Pickup",
      description:
        "Secure pickup process with OTP verification for both restaurants and NGOs.",
      icon: "🔐",
      color: "blue",
    },
    {
      title: "Tax Benefits",
      description:
        "Automatic generation of tax-deductible donation receipts and impact reports.",
      icon: "💰",
      color: "purple",
    },
    {
      title: "Impact Analytics",
      description:
        "Detailed insights on meals served, waste reduced, and community impact created.",
      icon: "📊",
      color: "red",
    },
    {
      title: "24/7 Support",
      description:
        "Round-the-clock support for both restaurants and NGOs to ensure smooth operations.",
      icon: "🕐",
      color: "teal",
    },
  ];

  const getColorClasses = (color: string) => {
    const colorMap = {
      orange: "bg-orange-100 text-orange-600 border-orange-200",
      green: "bg-green-100 text-green-600 border-green-200",
      blue: "bg-blue-100 text-blue-600 border-blue-200",
      purple: "bg-purple-100 text-purple-600 border-purple-200",
      red: "bg-red-100 text-red-600 border-red-200",
      teal: "bg-teal-100 text-teal-600 border-teal-200",
    };
    return (
      colorMap[color as keyof typeof colorMap] ||
      "bg-gray-100 text-gray-600 border-gray-200"
    );
  };

  return (
    <section id="features" className="py-20 bg-white">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Why Choose <span className="text-orange-500">Re-Serve</span>?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Powerful features designed to make food donation seamless, secure,
            and impactful for everyone involved
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group"
            >
              <div
                className={`bg-white border border-gray-100 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2`}
              >
                <div
                  className={`inline-flex items-center justify-center w-14 h-14 rounded-xl border-2 mb-4 ${getColorClasses(
                    feature.color
                  )}`}
                >
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-3 group-hover:text-orange-500 transition-colors">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Call to Action */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mt-16"
        >
          <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-8 md:p-12 text-white">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">
              Ready to Make a Difference?
            </h3>
            <p className="text-lg mb-6 opacity-90">
              Join hundreds of restaurants and NGOs already making an impact
              through Re-Serve
            </p>
            {/* TODO: Add navigation or function for CTA below if needed */}
            <button className="bg-white text-orange-500 px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors">
              Get Started Today
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
