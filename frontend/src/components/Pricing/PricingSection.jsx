import React from 'react';
import { motion } from 'framer-motion';
import * as Lucide from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';

const PricingSection = () => {
  const plans = [
    {
      name: "Basic",
      price: "0",
      description: "Perfect for a single consultation",
      features: ["1 Virtual consultation", "7 Days chat support", "Digital prescription", "Basic health dashboard"],
      buttonText: "Start Free",
      isPopular: false,
    },
    {
      name: "Premium",
      price: "299",
      description: "Best for families and regular care",
      features: ["Unlimited consultations", "24/7 Priority support", "Family account (3 members)", "Specialist referrals", "Health data tracking"],
      buttonText: "Get Premium",
      isPopular: true,
    },
    {
      name: "Elite",
      price: "599",
      description: "Comprehensive care for your business",
      features: ["Everything in Premium", "Corporate health wellness", "On-site diagnostic kits", "Mental health coaching", "Global expert access"],
      buttonText: "Contact Sales",
      isPopular: false,
    },
  ];

  return (
    <div className="container mx-auto px-6">
      <div className="text-center mb-20">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl lg:text-7xl font-bold mb-6"
        >
          Simple, Transparent <span className="text-accent-primary">Pricing</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl text-text-secondary max-w-2xl mx-auto"
        >
          Choose the plan that fits your needs. No hidden fees, cancel anytime.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-24">
        {plans.map((plan, index) => (
          <motion.div
            key={plan.name}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -10 }}
          >
            <Card className={`h-full flex flex-col relative ${plan.isPopular ? 'border-accent-primary shadow-lg shadow-accent-primary/15' : 'border-border/50'}`}>
              {plan.isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent-primary text-white text-xs font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                  Most Popular
                </div>
              )}
              <CardHeader className="p-8">
                <CardTitle className="text-2xl mb-2">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold">৳{plan.price}</span>
                  <span className="text-text-secondary">/month</span>
                </div>
              </CardHeader>
              <CardContent className="p-8 pt-0 flex-grow">
                <ul className="flex flex-col gap-4">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <div className="bg-accent-primary/20 p-0.5 rounded-full mt-1">
                        <Lucide.Check className="w-4 h-4 text-accent-primary" />
                      </div>
                      <span className="text-sm text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="p-8 pt-0">
                <Button variant={plan.isPopular ? 'default' : 'outline'} className="w-full h-12 text-lg">
                  {plan.buttonText}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default PricingSection;
