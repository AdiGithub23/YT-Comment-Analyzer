import React, { useState } from 'react';

const VideoInput = ({ onAnalyze, loading }) => {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      onAnalyze(url);
    }
  };

  return (
    <div className="video-input">
      <h3>Sentiment Analyzer</h3>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Paste YouTube video URL…"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button className="btn-primary" type="submit" disabled={loading || !url.trim()}>
          {loading ? 'Analyzing…' : 'Analyze Comments'}
        </button>
      </form>
    </div>
  );
};

export default VideoInput;