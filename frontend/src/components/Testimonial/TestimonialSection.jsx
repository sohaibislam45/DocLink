import React from 'react';
import { motion } from 'framer-motion';
import { Quote, Star } from 'lucide-react';
import testimonialsData from '../../data/testimonials.json';
import { Card, CardContent } from '../ui/Card';
import { Avatar, AvatarFallback } from '../ui/Avatar';

const TestimonialSection = () => {
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
              key={testimonial.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <Card className="h-full bg-background-tertiary/30 border-border/30 hover:border-accent-primary/50 transition-all duration-300">
                <CardContent className="p-8 flex flex-col gap-6">
                  <div className="flex items-center justify-between">
                    <Quote className="w-10 h-10 text-accent-primary/20" />
                    <div className="flex gap-0.5">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-accent-secondary text-accent-secondary" />
                      ))}
                    </div>
                  </div>
                  
                  <p className="text-text-secondary italic leading-relaxed">
                    "{testimonial.text}"
                  </p>

                  <div className="flex items-center gap-4 mt-auto pt-6 border-t border-border/50">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className="bg-accent-primary/10 text-accent-primary">
                        {testimonial.initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col">
                      <span className="font-bold">{testimonial.name}</span>
                      <span className="text-xs text-text-secondary">{testimonial.date}</span>
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
