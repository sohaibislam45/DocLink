import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { fetchDoctors } from '../../api/doctors';
import DoctorCard from './DoctorCard';
import { Button } from '../ui/Button';
import { Skeleton } from '../ui/Skeleton';
import { AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const FeaturedDoctorsSection = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadDoctors = async () => {
      try {
        setLoading(true);
        const data = await fetchDoctors({ minRating: 4.5 });
        setDoctors(data.slice(0, 3));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    loadDoctors();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.5 } },
  };

  return (
    <section id="doctors" className="py-24 bg-background-secondary relative">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div className="flex flex-col max-w-2xl">
            <motion.h2
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="text-4xl lg:text-5xl font-bold mb-4"
            >
              Top-Rated <span className="text-accent-primary">Doctors</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-text-secondary"
            >
              Our doctors are board-certified, highly experienced, and committed to providing the best care possible.
            </motion.p>
          </div>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <Link to="/doctors">
              <Button variant="outline" className="h-12 px-6">View All Doctors</Button>
            </Link>
          </motion.div>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-[450px] w-full rounded-2xl" />
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <p className="text-text-secondary">Failed to load featured doctors.</p>
          </div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          >
            {doctors.map((doctor) => (
              <motion.div key={doctor.id} variants={itemVariants}>
                <DoctorCard doctor={doctor} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </section>
  );
};

export default FeaturedDoctorsSection;
