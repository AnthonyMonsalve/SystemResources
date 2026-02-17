import {
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import type { BodyMeasurement } from '../../types/measurements';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

type MeasurementChartsProps = {
  measurements: BodyMeasurement[];
};

export function MeasurementCharts({ measurements }: MeasurementChartsProps) {
  if (measurements.length === 0) {
    return null;
  }

  // Sort measurements by date (oldest first for proper chart display)
  const sortedMeasurements = [...measurements].sort(
    (a, b) =>
      new Date(a.measurementDate).getTime() - new Date(b.measurementDate).getTime()
  );

  // Prepare data for charts
  const dates = sortedMeasurements.map((m) =>
    new Date(m.measurementDate).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
    })
  );

  const weights = sortedMeasurements.map((m) => m.weight);
  const bodyFatPercentages = sortedMeasurements
    .filter((m) => m.bodyFatPercentage !== undefined)
    .map((m) => ({
      x: new Date(m.measurementDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      }),
      y: m.bodyFatPercentage!,
    }));
  const muscleMasses = sortedMeasurements
    .filter((m) => m.muscleMass !== undefined)
    .map((m) => ({
      x: new Date(m.measurementDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      }),
      y: m.muscleMass!,
    }));

  // Weight chart data
  const weightChartData = {
    labels: dates,
    datasets: [
      {
        label: 'Peso (kg)',
        data: weights,
        borderColor: 'rgb(249, 115, 22)',
        backgroundColor: 'rgba(249, 115, 22, 0.1)',
        tension: 0.3,
        fill: true,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  // Body composition chart data
  const hasBodyComposition =
    bodyFatPercentages.length > 0 || muscleMasses.length > 0;

  const bodyCompositionChartData = {
    labels: dates,
    datasets: [
      ...(bodyFatPercentages.length > 0
        ? [
            {
              label: '% Grasa Corporal',
              data: bodyFatPercentages,
              borderColor: 'rgb(239, 68, 68)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              tension: 0.3,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
            },
          ]
        : []),
      ...(muscleMasses.length > 0
        ? [
            {
              label: 'Masa Muscular (kg)',
              data: muscleMasses,
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.3,
              fill: true,
              pointRadius: 4,
              pointHoverRadius: 6,
              yAxisID: 'y1',
            },
          ]
        : []),
    ],
  };

  // Measurements chart data (circumferences)
  const chestMeasurements = sortedMeasurements
    .filter((m) => m.chest !== undefined)
    .map((m) => ({
      x: new Date(m.measurementDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      }),
      y: m.chest!,
    }));

  const waistMeasurements = sortedMeasurements
    .filter((m) => m.waist !== undefined)
    .map((m) => ({
      x: new Date(m.measurementDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      }),
      y: m.waist!,
    }));

  const hipsMeasurements = sortedMeasurements
    .filter((m) => m.hips !== undefined)
    .map((m) => ({
      x: new Date(m.measurementDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      }),
      y: m.hips!,
    }));

  const armsMeasurements = sortedMeasurements
    .filter((m) => m.arms !== undefined)
    .map((m) => ({
      x: new Date(m.measurementDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      }),
      y: m.arms!,
    }));

  const thighsMeasurements = sortedMeasurements
    .filter((m) => m.thighs !== undefined)
    .map((m) => ({
      x: new Date(m.measurementDate).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'short',
      }),
      y: m.thighs!,
    }));

  const hasCircumferences =
    chestMeasurements.length > 0 ||
    waistMeasurements.length > 0 ||
    hipsMeasurements.length > 0 ||
    armsMeasurements.length > 0 ||
    thighsMeasurements.length > 0;

  const circumferencesChartData = {
    labels: dates,
    datasets: [
      ...(chestMeasurements.length > 0
        ? [
            {
              label: 'Pecho (cm)',
              data: chestMeasurements,
              borderColor: 'rgb(59, 130, 246)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ]
        : []),
      ...(waistMeasurements.length > 0
        ? [
            {
              label: 'Cintura (cm)',
              data: waistMeasurements,
              borderColor: 'rgb(139, 92, 246)',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ]
        : []),
      ...(hipsMeasurements.length > 0
        ? [
            {
              label: 'Cadera (cm)',
              data: hipsMeasurements,
              borderColor: 'rgb(236, 72, 153)',
              backgroundColor: 'rgba(236, 72, 153, 0.1)',
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ]
        : []),
      ...(armsMeasurements.length > 0
        ? [
            {
              label: 'Brazos (cm)',
              data: armsMeasurements,
              borderColor: 'rgb(34, 197, 94)',
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ]
        : []),
      ...(thighsMeasurements.length > 0
        ? [
            {
              label: 'Muslos (cm)',
              data: thighsMeasurements,
              borderColor: 'rgb(251, 146, 60)',
              backgroundColor: 'rgba(251, 146, 60, 0.1)',
              tension: 0.3,
              pointRadius: 3,
              pointHoverRadius: 5,
            },
          ]
        : []),
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          padding: 15,
          font: {
            size: 12,
            family: "'Inter', sans-serif",
          },
        },
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        padding: 12,
        titleFont: {
          size: 13,
        },
        bodyFont: {
          size: 12,
        },
        usePointStyle: true,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        beginAtZero: false,
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  };

  const bodyCompositionOptions = {
    ...chartOptions,
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        beginAtZero: false,
        title: {
          display: true,
          text: '% Grasa',
          font: {
            size: 12,
          },
        },
        grid: {
          color: 'rgba(0, 0, 0, 0.05)',
        },
      },
      y1: {
        type: 'linear' as const,
        display: muscleMasses.length > 0,
        position: 'right' as const,
        beginAtZero: false,
        title: {
          display: true,
          text: 'Masa Muscular (kg)',
          font: {
            size: 12,
          },
        },
        grid: {
          drawOnChartArea: false,
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* Weight Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 className="text-lg font-semibold text-slate-900 mb-4">
          Evolución del Peso
        </h3>
        <div className="h-80">
          <Line data={weightChartData} options={chartOptions} />
        </div>
        {weights.length >= 2 && (
          <div className="mt-4 flex items-center justify-center gap-8 text-sm">
            <div className="text-center">
              <p className="text-slate-600">Peso inicial</p>
              <p className="text-xl font-bold text-slate-900">
                {weights[0].toFixed(1)} kg
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">Peso actual</p>
              <p className="text-xl font-bold text-slate-900">
                {weights[weights.length - 1].toFixed(1)} kg
              </p>
            </div>
            <div className="text-center">
              <p className="text-slate-600">Cambio total</p>
              <p
                className={`text-xl font-bold ${
                  weights[weights.length - 1] - weights[0] < 0
                    ? 'text-green-600'
                    : 'text-red-600'
                }`}
              >
                {(weights[weights.length - 1] - weights[0] > 0 ? '+' : '')}
                {(weights[weights.length - 1] - weights[0]).toFixed(1)} kg
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Body Composition Chart */}
      {hasBodyComposition && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Composición Corporal
          </h3>
          <div className="h-80">
            <Line data={bodyCompositionChartData} options={bodyCompositionOptions} />
          </div>
          <div className="mt-4 grid grid-cols-2 gap-4">
            {bodyFatPercentages.length >= 2 && (
              <div className="bg-red-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">% Grasa Corporal</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    {bodyFatPercentages[0].y.toFixed(1)}%
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="text-lg font-bold text-slate-900">
                    {bodyFatPercentages[bodyFatPercentages.length - 1].y.toFixed(1)}%
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      bodyFatPercentages[bodyFatPercentages.length - 1].y -
                        bodyFatPercentages[0].y <
                      0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {bodyFatPercentages[bodyFatPercentages.length - 1].y -
                      bodyFatPercentages[0].y >
                    0
                      ? '+'
                      : ''}
                    {(
                      bodyFatPercentages[bodyFatPercentages.length - 1].y -
                      bodyFatPercentages[0].y
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            )}
            {muscleMasses.length >= 2 && (
              <div className="bg-green-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-1">Masa Muscular</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-slate-900">
                    {muscleMasses[0].y.toFixed(1)} kg
                  </span>
                  <span className="text-slate-400">→</span>
                  <span className="text-lg font-bold text-slate-900">
                    {muscleMasses[muscleMasses.length - 1].y.toFixed(1)} kg
                  </span>
                  <span
                    className={`text-sm font-semibold ${
                      muscleMasses[muscleMasses.length - 1].y - muscleMasses[0].y > 0
                        ? 'text-green-600'
                        : 'text-red-600'
                    }`}
                  >
                    {muscleMasses[muscleMasses.length - 1].y - muscleMasses[0].y > 0
                      ? '+'
                      : ''}
                    {(
                      muscleMasses[muscleMasses.length - 1].y - muscleMasses[0].y
                    ).toFixed(1)}{' '}
                    kg
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Circumferences Chart */}
      {hasCircumferences && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">
            Evolución de Circunferencias
          </h3>
          <div className="h-80">
            <Line data={circumferencesChartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
}
