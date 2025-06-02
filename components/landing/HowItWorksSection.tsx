"use client";
import { motion } from "framer-motion";

export default function HowItWorksSection() {
  const steps = [
    {
      number: "01",
      title: "Restaurant Posts Surplus",
      description:
        "Restaurants list available surplus food with details about quantity, type, and pickup time.",
      icon: "🏪",
    },
    {
      number: "02",
      title: "Verification & Matching",
      description:
        "Our system verifies food safety and matches with nearby NGOs based on requirements.",
      icon: "✅",
    },
    {
      number: "03",
      title: "Secure Pickup",
      description:
        "NGO confirms pickup with OTP-based verification for secure and tracked collection.",
      icon: "🚚",
    },
    {
      number: "04",
      title: "Impact Created",
      description:
        "Meals reach those in need while restaurants receive tax benefits and impact reports.",
      icon: "🤝",
    },
  ];

  return (
    <section id="how-it-works" className="py-20 bg-gray-50">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            How <span className="text-orange-500">Re-Serve</span> Works
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Four simple steps to transform surplus food into meaningful impact
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="relative"
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-orange-200 z-0">
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2 w-3 h-3 bg-orange-400 rounded-full"></div>
                </div>
              )}
              <div className="relative z-10 bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4">
                  <span className="text-2xl">{step.icon}</span>
                </div>
                <div className="text-center">
                  <div className="text-orange-500 font-bold text-sm mb-2">
                    STEP {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
