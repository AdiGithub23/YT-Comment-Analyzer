import React, { useState, useEffect, useRef } from 'react';
import VideoInput from './VideoInput';
import SentimentChart from './SentimentChart';
import { extractVideoId } from '../utils/youtube';

const Popup = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const pollRef = useRef(null);

  // Read current state from storage on mount
  useEffect(() => {
    syncFromStorage();
    return () => clearInterval(pollRef.current);
  }, []);

  const syncFromStorage = () => {
    chrome.storage?.local?.get(
      ['sentimentStatus', 'sentimentResults', 'sentimentError'],
      (data) => {
        if (data?.sentimentStatus === 'loading') {
          setLoading(true);
          setError(null);
          setResults(null);
          startPolling();
        } else if (data?.sentimentStatus === 'done' && data?.sentimentResults) {
          setLoading(false);
          setError(null);
          setResults(data.sentimentResults);
        } else if (data?.sentimentStatus === 'error') {
          setLoading(false);
          setError(data.sentimentError || 'Unknown error');
          setResults(null);
        }
      }
    );
  };

  const startPolling = () => {
    clearInterval(pollRef.current);
    pollRef.current = setInterval(() => {
      chrome.storage?.local?.get(
        ['sentimentStatus', 'sentimentResults', 'sentimentError'],
        (data) => {
          if (data?.sentimentStatus === 'done') {
            setLoading(false);
            setResults(data.sentimentResults);
            setError(null);
            clearInterval(pollRef.current);
          } else if (data?.sentimentStatus === 'error') {
            setLoading(false);
            setError(data.sentimentError || 'Unknown error');
            setResults(null);
            clearInterval(pollRef.current);
          }
        }
      );
    }, 500);
  };

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
    const videoId = extractVideoId(url);
    if (!videoId) {
      setError('Invalid YouTube URL');
      return;
    }

    setLoading(true);
    setError(null);
    setResults(null);

    chrome.runtime.sendMessage(
      { action: 'analyze', url, maxResults: 100 },
      () => {
        startPolling();
      }
    );
  };

  const handleAnalyzeCurrent = async () => {
    try {
      const url = await getCurrentTabUrl();
      if (!url.includes('youtube.com/watch') && !url.includes('youtu.be/')) {
        throw new Error('Current tab is not a YouTube video page');
      }
      await handleAnalyze(url);
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="popup">
      <VideoInput onAnalyze={handleAnalyze} loading={loading} />

      <div className="divider"><span>or</span></div>

      <button
        className="btn-secondary"
        onClick={handleAnalyzeCurrent}
        disabled={loading}
      >
        {loading ? 'Analyzing…' : 'Analyze Current Tab'}
      </button>

      {loading && (
        <div className="loading-container">
          <div className="spinner" />
          <p>Analyzing comments…</p>
        </div>
      )}

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {results && (
        <div className="results">
          <SentimentChart data={results} />
          <div className="breakdown">
            <div className="breakdown-item positive">
              <span className="breakdown-emoji">😊</span>
              <span className="breakdown-label">Positive</span>
              <span className="breakdown-count">{results.counts.Positive}</span>
            </div>
            <div className="breakdown-item neutral">
              <span className="breakdown-emoji">😐</span>
              <span className="breakdown-label">Neutral</span>
              <span className="breakdown-count">{results.counts.Neutral}</span>
            </div>
            <div className="breakdown-item negative">
              <span className="breakdown-emoji">😞</span>
              <span className="breakdown-label">Negative</span>
              <span className="breakdown-count">{results.counts.Negative}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Popup;