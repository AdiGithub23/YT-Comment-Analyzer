import React, { useState } from 'react';
import VideoInput from './VideoInput';
import SentimentChart from './SentimentChart';
import { extractVideoId, fetchVideoComments } from '../utils/youtube';
import { analyzeComments } from '../api/sentiment';

const Popup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);

  const getCurrentTabUrl = () => {
    return new Promise((resolve, reject) => {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (tabs.length === 0) {
          reject(new Error('No active tab found'));
        } else {
          resolve(tabs[0].url);
        }
      });
    });
  };

  const handleAnalyze = async (url) => {
    setLoading(true);
    setError(null);
    setResults(null);

    try {
      // Extract video ID
      const videoId = extractVideoId(url);
      if (!videoId) {
        throw new Error('Invalid YouTube URL');
      }

      // Fetch comments
      const commentsResult = await fetchVideoComments(videoId, 50);
      if (!commentsResult.success) {
        throw new Error(`YouTube API: ${commentsResult.error}`);
      }

      if (commentsResult.comments.length === 0) {
        throw new Error('No comments found for this video');
      }

      // Analyze sentiment
      const sentimentResult = await analyzeComments(commentsResult.comments);
      if (!sentimentResult.success) {
        throw new Error(`Sentiment API: ${sentimentResult.error}`);
      }

      setResults(sentimentResult);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAnalyzeCurrent = async () => {
    try {
      const url = await getCurrentTabUrl();
      // Check if it's a YouTube URL
      if (!url.includes('youtube.com/watch') && !url.includes('youtu.be/')) {
        throw new Error('Current tab is not a YouTube video page');
      }
      await handleAnalyze(url);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="popup">
      <VideoInput onAnalyze={handleAnalyze} loading={loading} />
      
      <div style={{ marginTop: '10px', textAlign: 'center' }}>
        <button 
          onClick={handleAnalyzeCurrent} 
          disabled={loading}
          style={{
            padding: '8px 16px',
            backgroundColor: '#4285f4',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            width: '100%'
          }}
        >
          {loading ? 'Analyzing...' : 'Analyze Current Video'}
        </button>
      </div>
      
      {error && (
        <div className="error">
          ❌ {error}
        </div>
      )}
      
      {results && (
        <div className="results">
          <SentimentChart data={results} />
          <div className="breakdown">
            <div className="positive">😊 Positive: {results.counts.Positive}</div>
            <div className="neutral">😐 Neutral: {results.counts.Neutral}</div>
            <div className="negative">😞 Negative: {results.counts.Negative}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;


