// Reusable utils for the Results feature
import { Medal, TrendingUp } from 'lucide-react';

export const formatTime = (seconds: number) => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-success';
  if (score >= 60) return 'text-warning';
  return 'text-destructive';
};

export const getScoreVariant = (score: number): 'default' | 'success' | 'warning' => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'warning';
  return 'default';
};

export const getRankIcon = (rank?: number) => {
  if (!rank) return <TrendingUp size={20} />;
  if (rank === 1) return <Medal size={20} className="text-yellow-500" />;
  if (rank === 2) return <Medal size={20} className="text-gray-400" />;
  if (rank === 3) return <Medal size={20} className="text-yellow-600" />;
  return <TrendingUp size={20} />;
};
