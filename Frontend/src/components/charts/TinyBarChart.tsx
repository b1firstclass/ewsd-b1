import { Bar } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import { ensureChartSetup } from "./chartSetup";

ensureChartSetup();

interface TinyBarChartDataset {
  label: string;
  data: number[];
  backgroundColor: string;
}

interface TinyBarChartProps {
  labels: string[];
  datasets: TinyBarChartDataset[];
  stacked?: boolean;
}

export const TinyBarChart = ({ labels, datasets, stacked = false }: TinyBarChartProps) => {
  const data: ChartData<"bar"> = { labels, datasets };
  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "top" },
    },
    scales: {
      x: { stacked },
      y: { stacked, beginAtZero: true },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar options={options} data={data} />
    </div>
  );
};

