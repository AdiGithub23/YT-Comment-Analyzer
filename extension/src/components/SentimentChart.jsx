import React from 'react';
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const centerLabelPlugin = {
  id: 'centerLabel',
  beforeDraw(chart) {
    const { ctx, data, chartArea: { width, height, left, top } } = chart;
    const values = data.datasets[0].data;
    const labels = data.labels;
    const maxIndex = values.indexOf(Math.max(...values));
    const colors = ['#00e70c', '#00eaff', '#ff0000'];

    const cx = left + width / 2;
    const cy = top + height / 2;

    ctx.save();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = '700 22px Inter, sans-serif';
    ctx.fillStyle = colors[maxIndex];
    ctx.fillText(`${values[maxIndex]}%`, cx, cy - 8);

    ctx.font = '500 10px Inter, sans-serif';
    ctx.fillStyle = '#666666';
    ctx.letterSpacing = '1px';
    ctx.fillText(labels[maxIndex].toUpperCase(), cx, cy + 12);

    ctx.restore();
  },
};

ChartJS.register(centerLabelPlugin);

const SentimentChart = ({ data }) => {
  const values = [
    parseFloat(data.percentages.positive),
    parseFloat(data.percentages.neutral),
    parseFloat(data.percentages.negative),
  ];

  const chartData = {
    labels: ['Positive', 'Neutral', 'Negative'],
    datasets: [
      {
        data: values,
        backgroundColor: ['#00e70c', '#00eaff', '#ff0000'],
        borderColor: '#0f0f0f',
        borderWidth: 2,
        borderRadius: 4,
        hoverOffset: 8,
        hoverBorderColor: '#0f0f0f',
        hoverBorderWidth: 2,
      },
    ],
  };

  const options = {
    cutout: '70%',
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#1a1a1a',
        titleColor: '#e8e8e8',
        bodyColor: '#a0a0a0',
        borderColor: '#2a2a2a',
        borderWidth: 1,
        cornerRadius: 8,
        padding: 12,
        callbacks: {
          label: (ctx) => `  ${ctx.label}  ${ctx.parsed}%`,
        },
      },
    },
    animation: {
      animateRotate: true,
      animateScale: true,
      duration: 900,
      easing: 'easeInOutQuart',
    },
  };

  return (
    <div className="sentiment-chart">
      <h4>Sentiment Distribution</h4>
      <div className="chart-wrapper">
        <Doughnut data={chartData} options={options} />
      </div>
      <div className="stats">
        <div className="stat-item">
          <div className="stat-label">Comments</div>
          <div className="stat-value">{data.totalComments}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Confidence</div>
          <div className="stat-value">{data.avgConfidence}</div>
        </div>
        <div className="stat-item">
          <div className="stat-label">Time</div>
          <div className="stat-value">
            {data.processingTime}
            <span style={{ fontSize: '10px', color: '#666', fontWeight: 400 }}>ms</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentChart;
