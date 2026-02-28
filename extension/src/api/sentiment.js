import axios from 'axios';

const API_URL = `${import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000'}/predict`;

export const analyzeComments = async (comments) => {
  try {
    const response = await axios.post(API_URL, { 
      comments: comments 
    });
    
    const data = response.data;
    
    // Aggregate results
    const counts = { Positive: 0, Neutral: 0, Negative: 0 };
    data.results.forEach(r => counts[r.label]++);
    
    const total = data.results.length;
    const percentages = {
      positive: total > 0 ? ((counts.Positive / total) * 100).toFixed(1) : 0,
      neutral: total > 0 ? ((counts.Neutral / total) * 100).toFixed(1) : 0,
      negative: total > 0 ? ((counts.Negative / total) * 100).toFixed(1) : 0
    };
    
    return {
      success: true,
      counts,
      percentages,
      totalComments: total,
      avgConfidence: (data.results.reduce((acc, r) => acc + r.confidence, 0) / total).toFixed(3),
      processingTime: data.processing_time_ms,
      rawResults: data.results
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};
