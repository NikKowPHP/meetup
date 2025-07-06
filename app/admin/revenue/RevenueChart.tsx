import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface RevenueData {
  type: string;
  totalAmount: number;
  count: number;
}

export default function RevenueChart({ data }: { data: RevenueData[] }) {
  const chartData = {
    labels: data.map(item => item.type),
    datasets: [
      {
        label: 'Revenue ($)',
        data: data.map(item => item.totalAmount / 100),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
      },
      {
        label: 'Transactions',
        data: data.map(item => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      }
    ]
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Revenue Breakdown',
      },
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  };

  return <Bar options={options} data={chartData} />;
}