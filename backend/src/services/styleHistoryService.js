const StyleHistory = require('../models/StyleHistory');
const Outfit = require('../models/Outfit');
const DailyOutfit = require('../models/DailyOutfit');

/**
 * Track worn outfit in style history
 */
const trackWornOutfit = async (userId, outfitId, wornDate, rating, feedback, photos) => {
  try {
    // Calculate style score based on various factors
    const styleScore = calculateStyleScore(rating, feedback);

    // Generate improvement suggestions
    const improvementSuggestions = generateImprovementSuggestions(rating, feedback);

    const styleHistory = new StyleHistory({
      userId,
      outfitId,
      wornDate: new Date(wornDate),
      rating,
      feedback,
      photos: photos || [],
      styleScore,
      improvementSuggestions,
    });

    await styleHistory.save();

    return styleHistory;
  } catch (error) {
    throw error;
  }
};

/**
 * Get style history for user
 */
const getStyleHistory = async (userId, limit = 30) => {
  try {
    const history = await StyleHistory.find({ userId })
      .populate('outfitId')
      .sort({ wornDate: -1 })
      .limit(limit);

    return history;
  } catch (error) {
    throw error;
  }
};

/**
 * Get style progress/analytics
 */
const getStyleProgress = async (userId) => {
  try {
    const history = await StyleHistory.find({ userId })
      .populate('outfitId')
      .sort({ wornDate: -1 });

    if (history.length === 0) {
      return {
        totalOutfits: 0,
        averageRating: 0,
        averageStyleScore: 0,
        improvementTrend: 'neutral',
        topOccasions: [],
        recommendations: [],
      };
    }

    // Calculate averages
    const ratings = history.map(h => h.rating).filter(Boolean);
    const styleScores = history.map(h => h.styleScore).filter(Boolean);
    
    const averageRating = ratings.length > 0
      ? ratings.reduce((a, b) => a + b, 0) / ratings.length
      : 0;
    
    const averageStyleScore = styleScores.length > 0
      ? styleScores.reduce((a, b) => a + b, 0) / styleScores.length
      : 0;

    // Calculate improvement trend
    const recentScores = styleScores.slice(0, 5);
    const olderScores = styleScores.slice(5, 10);
    
    let improvementTrend = 'neutral';
    if (recentScores.length > 0 && olderScores.length > 0) {
      const recentAvg = recentScores.reduce((a, b) => a + b, 0) / recentScores.length;
      const olderAvg = olderScores.reduce((a, b) => a + b, 0) / olderScores.length;
      
      if (recentAvg > olderAvg + 5) {
        improvementTrend = 'improving';
      } else if (recentAvg < olderAvg - 5) {
        improvementTrend = 'declining';
      }
    }

    // Get top occasions
    const occasions = history
      .map(h => h.occasion)
      .filter(Boolean);
    
    const occasionFrequency = {};
    occasions.forEach(occ => {
      occasionFrequency[occ] = (occasionFrequency[occ] || 0) + 1;
    });
    
    const topOccasions = Object.entries(occasionFrequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([occasion, count]) => ({ occasion, count }));

    // Generate recommendations
    const recommendations = generateRecommendations(history, averageRating, averageStyleScore);

    return {
      totalOutfits: history.length,
      averageRating: Math.round(averageRating * 10) / 10,
      averageStyleScore: Math.round(averageStyleScore),
      improvementTrend,
      topOccasions,
      recommendations,
      recentHistory: history.slice(0, 10),
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Calculate style score (0-100)
 */
const calculateStyleScore = (rating, feedback) => {
  let score = 50; // Base score

  // Add points based on rating
  if (rating) {
    score += (rating - 3) * 10; // -20 to +20 based on rating (1-5)
  }

  // Add points for positive feedback keywords
  if (feedback) {
    const positiveKeywords = ['love', 'great', 'perfect', 'amazing', 'beautiful', 'stylish', 'comfortable'];
    const negativeKeywords = ['hate', 'bad', 'ugly', 'uncomfortable', 'wrong'];
    
    const feedbackLower = feedback.toLowerCase();
    const positiveCount = positiveKeywords.filter(kw => feedbackLower.includes(kw)).length;
    const negativeCount = negativeKeywords.filter(kw => feedbackLower.includes(kw)).length;
    
    score += positiveCount * 5;
    score -= negativeCount * 10;
  }

  // Clamp score between 0 and 100
  return Math.max(0, Math.min(100, score));
};

/**
 * Generate improvement suggestions
 */
const generateImprovementSuggestions = (rating, feedback) => {
  const suggestions = [];

  if (!rating || rating < 3) {
    suggestions.push('Try experimenting with different color combinations');
    suggestions.push('Consider adding accessories to enhance your look');
  }

  if (feedback) {
    const feedbackLower = feedback.toLowerCase();
    if (feedbackLower.includes('color') || feedbackLower.includes('colour')) {
      suggestions.push('Explore color theory to find better combinations');
    }
    if (feedbackLower.includes('fit') || feedbackLower.includes('size')) {
      suggestions.push('Ensure your clothes fit well for a polished look');
    }
    if (feedbackLower.includes('accessory') || feedbackLower.includes('jewelry')) {
      suggestions.push('Accessories can elevate any outfit - try adding some');
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('Keep experimenting with different styles');
    suggestions.push('Take photos to track what works best for you');
  }

  return suggestions;
};

/**
 * Generate recommendations based on history
 */
const generateRecommendations = (history, averageRating, averageStyleScore) => {
  const recommendations = [];

  if (averageRating < 3.5) {
    recommendations.push({
      type: 'rating',
      message: 'Your outfit ratings are below average. Try experimenting with different styles.',
      priority: 'high',
    });
  }

  if (averageStyleScore < 60) {
    recommendations.push({
      type: 'score',
      message: 'Your style score can improve. Focus on color coordination and fit.',
      priority: 'high',
    });
  }

  // Check for variety
  const uniqueOccasions = new Set(history.map(h => h.occasion).filter(Boolean));
  if (uniqueOccasions.size < 3 && history.length > 5) {
    recommendations.push({
      type: 'variety',
      message: 'Try exploring different occasions and styles for more variety.',
      priority: 'medium',
    });
  }

  // Check for consistency
  const recentRatings = history.slice(0, 5).map(h => h.rating).filter(Boolean);
  if (recentRatings.length > 0) {
    const variance = calculateVariance(recentRatings);
    if (variance > 1.5) {
      recommendations.push({
        type: 'consistency',
        message: 'Your outfit quality varies. Focus on consistent styling principles.',
        priority: 'medium',
      });
    }
  }

  return recommendations;
};

/**
 * Calculate variance of an array
 */
const calculateVariance = (values) => {
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const squaredDiffs = values.map(value => Math.pow(value - mean, 2));
  return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
};

module.exports = {
  trackWornOutfit,
  getStyleHistory,
  getStyleProgress,
};

