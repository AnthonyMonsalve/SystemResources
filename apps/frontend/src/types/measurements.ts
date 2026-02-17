export type BodyMeasurement = {
  id: string;
  userId: string;
  weight: number;
  height?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
  measurementDate: string;
  createdAt: string;
};

export type CreateMeasurementDto = {
  weight: number;
  height?: number;
  bodyFatPercentage?: number;
  muscleMass?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  arms?: number;
  thighs?: number;
  notes?: string;
  measurementDate?: string;
};
