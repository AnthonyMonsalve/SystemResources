// Enums matching backend
export enum MuscleGroup {
  CHEST = 'chest',
  BACK = 'back',
  SHOULDERS = 'shoulders',
  ARMS = 'arms',
  LEGS = 'legs',
  CORE = 'core',
  FULL_BODY = 'full_body',
  CARDIO = 'cardio',
}

export enum EquipmentType {
  NONE = 'none',
  DUMBBELLS = 'dumbbells',
  BARBELL = 'barbell',
  KETTLEBELL = 'kettlebell',
  RESISTANCE_BAND = 'resistance_band',
  MACHINE = 'machine',
  CABLE = 'cable',
  OTHER = 'other',
}

export enum ExerciseDifficulty {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
}

// Exercise type
export interface Exercise {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  difficulty: ExerciseDifficulty;
  defaultSets?: number;
  defaultReps?: number;
  defaultDuration?: number;
  defaultRest?: number;
  createdById: string;
  createdBy?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

// API Response types
export interface ExercisesResponse {
  data: Exercise[];
  total: number;
  page: number;
  limit: number;
}

// Form types
export interface CreateExerciseData {
  name: string;
  description?: string;
  instructions?: string;
  videoUrl?: string;
  thumbnailUrl?: string;
  muscleGroup: MuscleGroup;
  equipment: EquipmentType;
  difficulty: ExerciseDifficulty;
  defaultSets?: number;
  defaultReps?: number;
  defaultDuration?: number;
  defaultRest?: number;
}

export interface UpdateExerciseData extends Partial<CreateExerciseData> {}

export interface QueryExercisesParams {
  muscleGroup?: MuscleGroup;
  equipment?: EquipmentType;
  difficulty?: ExerciseDifficulty;
  page?: number;
  limit?: number;
}

// Helper constants for UI
export const MUSCLE_GROUP_LABELS: Record<MuscleGroup, string> = {
  [MuscleGroup.CHEST]: 'Pecho',
  [MuscleGroup.BACK]: 'Espalda',
  [MuscleGroup.SHOULDERS]: 'Hombros',
  [MuscleGroup.ARMS]: 'Brazos',
  [MuscleGroup.LEGS]: 'Piernas',
  [MuscleGroup.CORE]: 'Core',
  [MuscleGroup.FULL_BODY]: 'Cuerpo Completo',
  [MuscleGroup.CARDIO]: 'Cardio',
};

export const EQUIPMENT_LABELS: Record<EquipmentType, string> = {
  [EquipmentType.NONE]: 'Sin Equipo',
  [EquipmentType.DUMBBELLS]: 'Mancuernas',
  [EquipmentType.BARBELL]: 'Barra',
  [EquipmentType.KETTLEBELL]: 'Kettlebell',
  [EquipmentType.RESISTANCE_BAND]: 'Banda Elástica',
  [EquipmentType.MACHINE]: 'Máquina',
  [EquipmentType.CABLE]: 'Polea',
  [EquipmentType.OTHER]: 'Otro',
};

export const DIFFICULTY_LABELS: Record<ExerciseDifficulty, string> = {
  [ExerciseDifficulty.BEGINNER]: 'Principiante',
  [ExerciseDifficulty.INTERMEDIATE]: 'Intermedio',
  [ExerciseDifficulty.ADVANCED]: 'Avanzado',
};

export const DIFFICULTY_COLORS: Record<ExerciseDifficulty, string> = {
  [ExerciseDifficulty.BEGINNER]: 'bg-green-100 text-green-800',
  [ExerciseDifficulty.INTERMEDIATE]: 'bg-yellow-100 text-yellow-800',
  [ExerciseDifficulty.ADVANCED]: 'bg-red-100 text-red-800',
};
