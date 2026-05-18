import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Avatar, AvatarFallback } from '../ui/Avatar';
import { fetchTestimonials } from '../../api/common';

const TestimonialSection = () => {
  const [testimonialsData, setTestimonialsData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const getTestimonials = async () => {
      const data = await fetchTestimonials();
      setTestimonialsData(data || []);
      setLoading(false);
    };
    getTestimonials();
  }, []);

  if (loading) {
    return (
      <section id="testimonials" className="py-24 bg-background-secondary relative overflow-hidden">
        <div className="container mx-auto px-6 text-center">
          <p className="text-text-secondary">Loading testimonials...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="testimonials" className="py-24 bg-background-secondary relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="flex flex-col items-center text-center mb-16">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl lg:text-5xl font-bold mb-4"
          >
            What Our <span className="text-accent-primary">Patients</span> Say
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-text-secondary max-w-2xl"
          >
            Trusted by thousands of patients worldwide for reliable and compassionate virtual healthcare.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonialsData.map((testimonial, index) => (
            <motion.div
              key={testimonial.id || testimonial._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="h-full hover:border-accent-primary/30 transition-colors duration-300">
                <CardContent className="p-8 flex flex-col h-full">
                  <div className="mb-6">
                    <Quote className="w-10 h-10 text-accent-primary/20" />
                  </div>
                  <p className="text-text-secondary italic mb-8 flex-grow">
                    "{testimonial.text}"
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <div className="flex items-center gap-4">
                      <Avatar className="w-12 h-12 border border-accent-primary/20">
                        <AvatarFallback className="bg-background-tertiary text-accent-primary font-bold">
                          {testimonial.initials}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-bold text-black">{testimonial.name}</h4>
                        <p className="text-xs text-text-secondary">{testimonial.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={cn(
                            "w-4 h-4",
                            i < testimonial.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-600"
                          )}
                        />
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;

function cn(...classes) {
  return classes.filter(Boolean).join(' ');
}
