import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const SentimentChart = ({ data }) => {
  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: [
          parseFloat(data.percentages.positive),
          parseFloat(data.percentages.neutral),
          parseFloat(data.percentages.negative)
        ],
        backgroundColor: ['#2ecc71', '#3498db', '#e74c3c'],
        borderColor: ['#27ae60', '#2980b9', '#c0392b'],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom',
      },
    },
  };

  return (
    <div className="sentiment-chart">
      <Doughnut data={chartData} options={options} />
      <div className="stats">
        <p>Total Comments: {data.totalComments}</p>
        <p>Avg Confidence: {data.avgConfidence}</p>
        <p>Processing: {data.processingTime}ms</p>
      </div>
    </div>
  );
};

export default SentimentChart;
