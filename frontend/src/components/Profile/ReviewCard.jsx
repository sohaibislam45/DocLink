import React from 'react';
import { motion } from 'framer-motion';
import { Star } from 'lucide-react';
import { Card, CardContent } from '../ui/Card';
import { Avatar, AvatarFallback } from '../ui/Avatar';

const ReviewCard = ({ review }) => {
  return (
    <Card className="bg-background-secondary/50 backdrop-blur-sm border-border/50 overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-border">
              <AvatarFallback className="bg-gradient-to-br from-accent-primary to-accent-secondary text-white font-bold">
                {review.initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h4 className="font-semibold text-text-primary">{review.author}</h4>
              <p className="text-xs text-text-secondary">{review.date}</p>
            </div>
          </div>
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < review.rating ? 'fill-yellow-500 text-yellow-500' : 'text-text-secondary/30'
                }`}
              />
            ))}
          </div>
        </div>
        <p className="text-text-secondary text-sm leading-relaxed">
          "{review.text}"
        </p>
      </CardContent>
    </Card>
  );
};

export default ReviewCard;
