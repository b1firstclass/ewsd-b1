import { Doughnut } from "react-chartjs-2";
import type { ChartData, ChartOptions } from "chart.js";
import { ensureChartSetup } from "./chartSetup";

ensureChartSetup();

interface TinyDoughnutChartProps {
  labels: string[];
  dataPoints: number[];
  backgroundColor?: string[];
}

const defaultColors = [
  "rgba(53, 162, 235, 0.6)",
  "rgba(75, 192, 192, 0.6)",
  "rgba(255, 206, 86, 0.6)",
  "rgba(255, 99, 132, 0.6)",
  "rgba(153, 102, 255, 0.6)",
  "rgba(255, 159, 64, 0.6)",
];

export const TinyDoughnutChart = ({
  labels,
  dataPoints,
  backgroundColor = defaultColors,
}: TinyDoughnutChartProps) => {
  const data: ChartData<"doughnut"> = {
    labels,
    datasets: [
      {
        label: "Distribution",
        data: dataPoints,
        backgroundColor,
        borderWidth: 1,
      },
    ],
  };

  const options: ChartOptions<"doughnut"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: "bottom" },
    },
  };

  return (
    <div className="h-64 w-full">
      <Doughnut options={options} data={data} />
    </div>
  );
};

