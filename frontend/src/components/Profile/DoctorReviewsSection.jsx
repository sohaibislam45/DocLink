import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '../ui/Badge';
import ReviewCard from './ReviewCard';
import { useDoctorProfile } from '../../context/DoctorProfileContext';
import reviewsData from '../../data/reviews.json';

const DoctorReviewsSection = () => {
  const { doctor } = useDoctorProfile();
  
  // Find reviews for the specific doctor
  const doctorReviewsData = reviewsData.find(item => item.doctorId === doctor.id);
  const reviewsList = doctorReviewsData ? doctorReviewsData.reviews : [];

  return (
    <motion.section 
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Patient Reviews</h2>
        <Badge variant="outline" className="border-border text-text-secondary">
          Avg. {doctor.rating} Rating
        </Badge>
      </div>
      
      <div className="grid gap-4">
        {reviewsList.length > 0 ? (
          reviewsList.map((review, index) => (
            <motion.div
              key={review.id}
              whileInView={{ y: 0, opacity: 1 }}
              initial={{ y: 20, opacity: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <ReviewCard review={review} />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 bg-background-secondary/20 rounded-3xl border border-dashed border-border/50">
            <p className="text-text-secondary">No reviews yet for this doctor.</p>
          </div>
        )}
      </div>
    </motion.section>
  );
};

export default DoctorReviewsSection;
