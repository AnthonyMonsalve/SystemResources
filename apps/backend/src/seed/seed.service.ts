import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise, EquipmentType, ExerciseDifficulty, MuscleGroup } from '../exercises/entities/exercise.entity';
import { Routine, DayOfWeek } from '../routines/entities/routine.entity';
import { RoutineExercise } from '../routines/entities/routine-exercise.entity';
import { TrainingProgram } from '../programs/entities/training-program.entity';
import { ProgramClient } from '../programs/entities/program-client.entity';
import { User, UserRole, FitnessGoal, FitnessLevel } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Exercise)
    private exercisesRepository: Repository<Exercise>,
    @InjectRepository(Routine)
    private routinesRepository: Repository<Routine>,
    @InjectRepository(RoutineExercise)
    private routineExercisesRepository: Repository<RoutineExercise>,
    @InjectRepository(TrainingProgram)
    private programsRepository: Repository<TrainingProgram>,
    @InjectRepository(ProgramClient)
    private programClientsRepository: Repository<ProgramClient>,
  ) {}

  async seed() {
    console.log('🌱 Starting database seeding...');

    // Clear existing data
    await this.clearDatabase();

    // Create users
    const { trainer, client1, client2, admin } = await this.createUsers();

    // Create exercises
    const exercises = await this.createExercises(trainer);

    // Create routines
    const routines = await this.createRoutines(trainer, exercises);

    // Create programs
    const programs = await this.createPrograms(trainer, routines);

    // Assign clients to programs
    await this.assignClientsToPrograms(programs, client1, client2);

    console.log('✅ Database seeding completed!');
    console.log('\n📊 Summary:');
    console.log(`   - Users: 4 (1 admin, 1 trainer, 2 clients)`);
    console.log(`   - Exercises: ${exercises.length}`);
    console.log(`   - Routines: ${routines.length}`);
    console.log(`   - Programs: ${programs.length}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin: admin@gym.com / admin123');
    console.log('   Trainer: trainer@gym.com / trainer123');
    console.log('   Client 1: client1@gym.com / client123');
    console.log('   Client 2: client2@gym.com / client123');
  }

  private async clearDatabase() {
    console.log('🗑️  Clearing existing data...');
    // Use CASCADE to handle foreign key constraints
    await this.programClientsRepository.query('TRUNCATE TABLE program_clients CASCADE');
    await this.routineExercisesRepository.query('TRUNCATE TABLE routine_exercises CASCADE');
    await this.programsRepository.query('TRUNCATE TABLE training_programs CASCADE');
    await this.routinesRepository.query('TRUNCATE TABLE routines CASCADE');
    await this.exercisesRepository.query('TRUNCATE TABLE exercises CASCADE');
    await this.usersRepository.query('TRUNCATE TABLE users CASCADE');
  }

  private async createUsers() {
    console.log('👥 Creating users...');

    const passwordHash = await bcrypt.hash('admin123', 10);
    const admin = await this.usersRepository.save({
      email: 'admin@gym.com',
      name: 'Admin User',
      passwordHash,
      role: UserRole.ADMIN,
    });

    const trainerHash = await bcrypt.hash('trainer123', 10);
    const trainer = await this.usersRepository.save({
      email: 'trainer@gym.com',
      name: 'Carlos Fitness',
      passwordHash: trainerHash,
      role: UserRole.TRAINER,
      bio: 'Entrenador personal certificado con 10 años de experiencia',
      specialization: 'Fuerza y acondicionamiento físico',
      certifications: 'NSCA-CPT, CrossFit Level 1',
      yearsExperience: 10,
    });

    const client1Hash = await bcrypt.hash('client123', 10);
    const client1 = await this.usersRepository.save({
      email: 'client1@gym.com',
      name: 'María García',
      passwordHash: client1Hash,
      role: UserRole.CLIENT,
      weight: 65,
      height: 165,
      goal: FitnessGoal.LOSE_WEIGHT,
      fitnessLevel: FitnessLevel.BEGINNER,
      trainerId: trainer.id,
    });

    const client2Hash = await bcrypt.hash('client123', 10);
    const client2 = await this.usersRepository.save({
      email: 'client2@gym.com',
      name: 'Juan Pérez',
      passwordHash: client2Hash,
      role: UserRole.CLIENT,
      weight: 80,
      height: 178,
      goal: FitnessGoal.GAIN_MUSCLE,
      fitnessLevel: FitnessLevel.INTERMEDIATE,
      trainerId: trainer.id,
    });

    return { admin, trainer, client1, client2 };
  }

  private async createExercises(trainer: User) {
    console.log('💪 Creating exercises...');

    const exercisesData = [
      // CHEST
      { name: 'Press de banca', muscleGroup: MuscleGroup.CHEST, equipment: EquipmentType.BARBELL, difficulty: ExerciseDifficulty.INTERMEDIATE, defaultSets: 4, defaultReps: 8, defaultRest: 90 },
      { name: 'Flexiones', muscleGroup: MuscleGroup.CHEST, equipment: EquipmentType.NONE, difficulty: ExerciseDifficulty.BEGINNER, defaultSets: 3, defaultReps: 12, defaultRest: 60 },
      { name: 'Press inclinado con mancuernas', muscleGroup: MuscleGroup.CHEST, equipment: EquipmentType.DUMBBELLS, difficulty: ExerciseDifficulty.INTERMEDIATE, defaultSets: 3, defaultReps: 10, defaultRest: 75 },

      // BACK
      { name: 'Dominadas', muscleGroup: MuscleGroup.BACK, equipment: EquipmentType.NONE, difficulty: ExerciseDifficulty.ADVANCED, defaultSets: 4, defaultReps: 6, defaultRest: 120 },
      { name: 'Remo con barra', muscleGroup: MuscleGroup.BACK, equipment: EquipmentType.BARBELL, difficulty: ExerciseDifficulty.INTERMEDIATE, defaultSets: 4, defaultReps: 8, defaultRest: 90 },
      { name: 'Jalón al pecho', muscleGroup: MuscleGroup.BACK, equipment: EquipmentType.CABLE, difficulty: ExerciseDifficulty.BEGINNER, defaultSets: 3, defaultReps: 12, defaultRest: 60 },

      // LEGS
      { name: 'Sentadilla con barra', muscleGroup: MuscleGroup.LEGS, equipment: EquipmentType.BARBELL, difficulty: ExerciseDifficulty.INTERMEDIATE, defaultSets: 4, defaultReps: 10, defaultRest: 120 },
      { name: 'Peso muerto', muscleGroup: MuscleGroup.LEGS, equipment: EquipmentType.BARBELL, difficulty: ExerciseDifficulty.ADVANCED, defaultSets: 4, defaultReps: 6, defaultRest: 180 },
      { name: 'Zancadas', muscleGroup: MuscleGroup.LEGS, equipment: EquipmentType.DUMBBELLS, difficulty: ExerciseDifficulty.BEGINNER, defaultSets: 3, defaultReps: 12, defaultRest: 60 },
      { name: 'Sentadillas búlgaras', muscleGroup: MuscleGroup.LEGS, equipment: EquipmentType.DUMBBELLS, difficulty: ExerciseDifficulty.INTERMEDIATE, defaultSets: 3, defaultReps: 10, defaultRest: 75 },

      // SHOULDERS
      { name: 'Press militar', muscleGroup: MuscleGroup.SHOULDERS, equipment: EquipmentType.BARBELL, difficulty: ExerciseDifficulty.INTERMEDIATE, defaultSets: 4, defaultReps: 8, defaultRest: 90 },
      { name: 'Elevaciones laterales', muscleGroup: MuscleGroup.SHOULDERS, equipment: EquipmentType.DUMBBELLS, difficulty: ExerciseDifficulty.BEGINNER, defaultSets: 3, defaultReps: 12, defaultRest: 60 },

      // ARMS
      { name: 'Curl de bíceps con barra', muscleGroup: MuscleGroup.ARMS, equipment: EquipmentType.BARBELL, difficulty: ExerciseDifficulty.BEGINNER, defaultSets: 3, defaultReps: 10, defaultRest: 60 },
      { name: 'Extensiones de tríceps', muscleGroup: MuscleGroup.ARMS, equipment: EquipmentType.CABLE, difficulty: ExerciseDifficulty.BEGINNER, defaultSets: 3, defaultReps: 12, defaultRest: 60 },

      // CORE
      { name: 'Plancha', muscleGroup: MuscleGroup.CORE, equipment: EquipmentType.NONE, difficulty: ExerciseDifficulty.BEGINNER, defaultSets: 3, defaultDuration: 60, defaultRest: 45 },
      { name: 'Abdominales en bicicleta', muscleGroup: MuscleGroup.CORE, equipment: EquipmentType.NONE, difficulty: ExerciseDifficulty.BEGINNER, defaultSets: 3, defaultReps: 20, defaultRest: 45 },

      // CARDIO
      { name: 'Burpees', muscleGroup: MuscleGroup.CARDIO, equipment: EquipmentType.NONE, difficulty: ExerciseDifficulty.INTERMEDIATE, defaultSets: 3, defaultReps: 15, defaultRest: 60 },
      { name: 'Saltos de cuerda', muscleGroup: MuscleGroup.CARDIO, equipment: EquipmentType.OTHER, difficulty: ExerciseDifficulty.BEGINNER, defaultSets: 3, defaultDuration: 120, defaultRest: 60 },
    ];

    const exercises: Exercise[] = [];
    for (const data of exercisesData) {
      const exercise = await this.exercisesRepository.save({
        ...data,
        description: `Ejercicio de ${data.muscleGroup}`,
        createdById: trainer.id,
      });
      exercises.push(exercise);
    }

    return exercises;
  }

  private async createRoutines(trainer: User, exercises: Exercise[]) {
    console.log('📋 Creating routines...');

    const routines: Routine[] = [];

    // Routine 1: Full Body Beginner (Monday)
    const fullBodyRoutine = await this.routinesRepository.save({
      name: 'Cuerpo Completo - Principiante',
      description: 'Rutina de cuerpo completo ideal para principiantes',
      dayOfWeek: DayOfWeek.MONDAY,
      isPublic: true,
      createdById: trainer.id,
    });

    await this.addExercisesToRoutine(fullBodyRoutine, [
      { exercise: exercises[1], order: 1 }, // Flexiones
      { exercise: exercises[5], order: 2 }, // Jalón al pecho
      { exercise: exercises[6], order: 3 }, // Sentadilla
      { exercise: exercises[11], order: 4 }, // Elevaciones laterales
      { exercise: exercises[14], order: 5 }, // Plancha
    ]);

    routines.push(fullBodyRoutine);

    // Routine 2: Upper Body (Wednesday)
    const upperBodyRoutine = await this.routinesRepository.save({
      name: 'Tren Superior - Intermedio',
      description: 'Enfoque en pecho, espalda y hombros',
      dayOfWeek: DayOfWeek.WEDNESDAY,
      isPublic: true,
      createdById: trainer.id,
    });

    await this.addExercisesToRoutine(upperBodyRoutine, [
      { exercise: exercises[0], order: 1 }, // Press de banca
      { exercise: exercises[4], order: 2 }, // Remo con barra
      { exercise: exercises[10], order: 3 }, // Press militar
      { exercise: exercises[12], order: 4 }, // Curl de bíceps
      { exercise: exercises[13], order: 5 }, // Extensiones de tríceps
    ]);

    routines.push(upperBodyRoutine);

    // Routine 3: Lower Body (Friday)
    const lowerBodyRoutine = await this.routinesRepository.save({
      name: 'Tren Inferior - Fuerza',
      description: 'Rutina intensa de piernas',
      dayOfWeek: DayOfWeek.FRIDAY,
      isPublic: false,
      createdById: trainer.id,
    });

    await this.addExercisesToRoutine(lowerBodyRoutine, [
      { exercise: exercises[6], order: 1, sets: 5, reps: 5 }, // Sentadilla (modificado)
      { exercise: exercises[7], order: 2, sets: 5, reps: 5 }, // Peso muerto (modificado)
      { exercise: exercises[8], order: 3 }, // Zancadas
      { exercise: exercises[9], order: 4 }, // Sentadillas búlgaras
    ]);

    routines.push(lowerBodyRoutine);

    // Routine 4: HIIT Cardio
    const hiitRoutine = await this.routinesRepository.save({
      name: 'HIIT - Cardio Intenso',
      description: 'Entrenamiento de alta intensidad',
      dayOfWeek: DayOfWeek.SATURDAY,
      isPublic: true,
      createdById: trainer.id,
    });

    await this.addExercisesToRoutine(hiitRoutine, [
      { exercise: exercises[16], order: 1 }, // Burpees
      { exercise: exercises[17], order: 2 }, // Saltos de cuerda
      { exercise: exercises[1], order: 3, sets: 4, reps: 20 }, // Flexiones (modificado)
      { exercise: exercises[15], order: 4 }, // Abdominales en bicicleta
    ]);

    routines.push(hiitRoutine);

    return routines;
  }

  private async addExercisesToRoutine(
    routine: Routine,
    exercisesData: Array<{ exercise: Exercise; order: number; sets?: number; reps?: number }>,
  ) {
    for (const data of exercisesData) {
      await this.routineExercisesRepository.save({
        routineId: routine.id,
        exerciseId: data.exercise.id,
        order: data.order,
        sets: data.sets || data.exercise.defaultSets,
        reps: data.reps || data.exercise.defaultReps,
        duration: data.exercise.defaultDuration,
        rest: data.exercise.defaultRest,
      });
    }
  }

  private async createPrograms(trainer: User, routines: Routine[]) {
    console.log('📅 Creating programs...');

    const programs: TrainingProgram[] = [];

    // Program 1: Beginner Full Body
    const beginnerProgram = await this.programsRepository.save({
      name: 'Programa Principiante - 8 Semanas',
      description: 'Programa completo para principiantes que buscan perder peso y mejorar su condición física',
      durationWeeks: 8,
      targetLevel: FitnessLevel.BEGINNER,
      targetGoal: FitnessGoal.LOSE_WEIGHT,
      isTemplate: true,
      createdById: trainer.id,
    });

    // Assign routine to program
    routines[0].programId = beginnerProgram.id;
    await this.routinesRepository.save(routines[0]);

    programs.push(beginnerProgram);

    // Program 2: Muscle Gain
    const muscleGainProgram = await this.programsRepository.save({
      name: 'Hipertrofia - 12 Semanas',
      description: 'Programa avanzado enfocado en ganancia de masa muscular',
      durationWeeks: 12,
      targetLevel: FitnessLevel.INTERMEDIATE,
      targetGoal: FitnessGoal.GAIN_MUSCLE,
      isTemplate: true,
      createdById: trainer.id,
    });

    // Assign routines to program
    routines[1].programId = muscleGainProgram.id;
    routines[2].programId = muscleGainProgram.id;
    await this.routinesRepository.save([routines[1], routines[2]]);

    programs.push(muscleGainProgram);

    // Program 3: General Fitness
    const fitnessProgram = await this.programsRepository.save({
      name: 'Fitness General - 6 Semanas',
      description: 'Programa balanceado para mejorar la condición física general',
      durationWeeks: 6,
      targetLevel: FitnessLevel.INTERMEDIATE,
      targetGoal: FitnessGoal.GENERAL_FITNESS,
      isTemplate: false,
      createdById: trainer.id,
    });

    routines[3].programId = fitnessProgram.id;
    await this.routinesRepository.save(routines[3]);

    programs.push(fitnessProgram);

    return programs;
  }

  private async assignClientsToPrograms(
    programs: TrainingProgram[],
    client1: User,
    client2: User,
  ) {
    console.log('🔗 Assigning clients to programs...');

    // Assign client1 (beginner) to beginner program
    await this.programClientsRepository.save({
      programId: programs[0].id,
      clientId: client1.id,
      assignedAt: new Date(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 8 * 7 * 24 * 60 * 60 * 1000), // 8 weeks
    });

    // Assign client2 (intermediate) to muscle gain program
    await this.programClientsRepository.save({
      programId: programs[1].id,
      clientId: client2.id,
      assignedAt: new Date(),
      startDate: new Date(),
      endDate: new Date(Date.now() + 12 * 7 * 24 * 60 * 60 * 1000), // 12 weeks
    });
  }
}
