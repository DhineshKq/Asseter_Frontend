import {
    Chart as ChartJS,
    ArcElement,
    Tooltip,
    Legend,
} from "chart.js";
import { Pie } from "react-chartjs-2";
import { useRef } from "react";
import type { Chart } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
    total: number;
    reachable: number;
    onReady: (base64Image: string) => void;
}

const PieChartGenerator = ({ total, reachable, onReady }: Props) => {
    const unreachable = total - reachable;
    const chartRef = useRef<Chart<"pie", number[], unknown> | null>(null);

    const data = {
        labels: ["Reachable", "Unreachable"],
        datasets: [
            {
                label: "Reachability",
                data: [reachable, unreachable],
                backgroundColor: [ "#4CAF50","#808080"],
                borderColor: ["#ffffff", "#ffffff"],
                borderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            onComplete: () => {
                const chart = chartRef.current;
                if (chart) {
                    const base64 = chart.toBase64Image();
                    onReady(base64);
                }
            },
        },
        plugins: {
            legend: {
                display: true,
                position: "bottom" as const,
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const label = context.label || "";
                        const value = context.raw as number;
                        const percentage = ((value / total) * 100).toFixed(3);
                        return `${label}: ${percentage}%`;
                    },
                },
            },
        },
    };

    return (
        <div
            style={{
                width: "300px",
                height: "300px",
                position: "relative",
            }}
        >
            <Pie
                data={data}
                options={options}
                width={300}
                height={300}
                ref={chartRef}
            />
        </div>
    );
};

export default PieChartGenerator;