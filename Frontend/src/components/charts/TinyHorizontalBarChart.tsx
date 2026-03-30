import { Bar } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import { ensureChartSetup } from "./chartSetup";

ensureChartSetup();

interface TinyHorizontalBarChartProps {
  labels: string[];
  dataPoints: number[];
  label?: string;
  color?: string;
}

export const TinyHorizontalBarChart = ({
  labels,
  dataPoints,
  label = "Count",
  color = "rgba(53, 162, 235, 0.6)",
}: TinyHorizontalBarChartProps) => {
  const data: ChartData<"bar"> = {
    labels,
    datasets: [
      {
        label,
        data: dataPoints,
        backgroundColor: color,
        borderColor: color.replace("0.6", "1"),
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      x: { beginAtZero: true },
    },
  };

  return (
    <div className="h-64 w-full">
      <Bar options={options} data={data} />
    </div>
  );
};

