import axios from 'axios';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';

export const extractVideoId = (url) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

export const fetchVideoComments = async (videoId, maxResults = 100) => {
  try {
    const response = await axios.get(`${BACKEND_URL}/fetch-comments`, {
      params: {
        videoId: videoId,
        maxResults: maxResults
      }
    });
    
    return response.data;
  } catch (error) {
    return {
      success: false,
      comments: [],
      total: 0,
      error: error.response?.data?.detail || error.message
    };
  }
};