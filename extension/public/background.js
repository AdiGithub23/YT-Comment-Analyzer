// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8000';
const BACKEND_URL = 'http://localhost:8000';

function extractVideoId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

async function fetchComments(videoId, maxResults) {
  const res = await fetch(`${BACKEND_URL}/fetch-comments?videoId=${videoId}&maxResults=${maxResults}`);
  if (!res.ok) throw new Error(`YouTube API error: ${res.statusText}`);
  return res.json();
}

async function analyzeSentiment(comments) {
  const res = await fetch(`${BACKEND_URL}/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ comments }),
  });
  if (!res.ok) throw new Error(`Sentiment API error: ${res.statusText}`);
  return res.json();
}

async function runAnalysis(url, maxResults = 100) {
  // Set loading state
  await chrome.storage.local.set({
    sentimentStatus: 'loading',
    sentimentResults: null,
    sentimentError: null,
  });

  try {
    const videoId = extractVideoId(url);
    if (!videoId) throw new Error('Invalid YouTube URL');

    const commentsResult = await fetchComments(videoId, maxResults);
    if (!commentsResult.success) throw new Error(`YouTube API: ${commentsResult.error}`);
    if (commentsResult.comments.length === 0) throw new Error('No comments found for this video');

    const data = await analyzeSentiment(commentsResult.comments);

    // Aggregate results
    const counts = { Positive: 0, Neutral: 0, Negative: 0 };
    data.results.forEach((r) => counts[r.label]++);
    const total = data.results.length;

    const results = {
      success: true,
      counts,
      percentages: {
        positive: total > 0 ? ((counts.Positive / total) * 100).toFixed(1) : 0,
        neutral: total > 0 ? ((counts.Neutral / total) * 100).toFixed(1) : 0,
        negative: total > 0 ? ((counts.Negative / total) * 100).toFixed(1) : 0,
      },
      totalComments: total,
      avgConfidence: (data.results.reduce((acc, r) => acc + r.confidence, 0) / total).toFixed(3),
      processingTime: data.processing_time_ms,
    };

    await chrome.storage.local.set({
      sentimentStatus: 'done',
      sentimentResults: results,
      sentimentError: null,
    });
  } catch (err) {
    await chrome.storage.local.set({
      sentimentStatus: 'error',
      sentimentResults: null,
      sentimentError: err.message,
    });
  }
}

// Listen for messages from the popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'analyze') {
    runAnalysis(message.url, message.maxResults || 100);
    sendResponse({ started: true });
  }
  return true;
});