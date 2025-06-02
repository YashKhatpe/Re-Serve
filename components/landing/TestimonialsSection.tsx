"use client";
import { motion } from "framer-motion";

export default function TestimonialsSection() {
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Director, Hope Kitchen NGO",
      content:
        "Re-Serve has transformed how we source meals for our community. The verification process gives us confidence in food safety, and the real-time tracking makes coordination seamless.",
      avatar: "👩",
      rating: 5,
    },
    {
      name: "Marco Rossi",
      role: "Head Chef, Bella Vista Restaurant",
      content:
        "Instead of throwing away perfectly good food, we now serve 50+ meals weekly to those in need. The tax benefits and impact reports make it even more rewarding.",
      avatar: "👨‍🍳",
      rating: 5,
    },
    {
      name: "Priya Sharma",
      role: "Manager, Community Care Foundation",
      content:
        "The OTP-based pickup system and 24/7 support have made our operations so much smoother. We can now serve 200% more meals than before.",
      avatar: "👩‍💼",
      rating: 5,
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-br from-orange-50 to-red-50">
      <div className="container mx-auto px-4 md:px-8 lg:px-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            What Our <span className="text-orange-500">Community</span> Says
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real stories from restaurants and NGOs making a difference together
          </p>
        </motion.div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group"
            >
              <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2">
                {/* Rating Stars */}
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <span key={i} className="text-yellow-400 text-lg">
                      ⭐
                    </span>
                  ))}
                </div>
                {/* Testimonial Content */}
                <p className="text-gray-600 leading-relaxed mb-6 italic">
                  "{testimonial.content}"
                </p>
                {/* Author Info */}
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-xl">{testimonial.avatar}</span>
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">
                      {testimonial.name}
                    </h4>
                    <p className="text-sm text-gray-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-16 bg-white rounded-2xl p-8 shadow-lg"
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">
                2,500+
              </div>
              <div className="text-gray-600">Meals Delivered</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">
                150+
              </div>
              <div className="text-gray-600">Partner Restaurants</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">75+</div>
              <div className="text-gray-600">NGO Partners</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-orange-500 mb-2">98%</div>
              <div className="text-gray-600">Satisfaction Rate</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
