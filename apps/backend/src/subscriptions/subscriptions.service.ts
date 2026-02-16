import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import type { UserProfile } from '../users/entities/user.entity';
import { CreateSubscriptionDto } from './dto/create-subscription.dto';
import { QuerySubscriptionsDto } from './dto/query-subscriptions.dto';
import { UpdateSubscriptionDto } from './dto/update-subscription.dto';
import { Subscription, SubscriptionStatus } from './entities/subscription.entity';

@Injectable()
export class SubscriptionsService {
  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionsRepository: Repository<Subscription>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(
    dto: CreateSubscriptionDto,
    currentUser: UserProfile,
  ): Promise<Subscription> {
    // Verificar que el trainer existe y tiene el rol TRAINER
    const trainer = await this.usersRepository.findOne({
      where: { id: dto.trainerId },
    });
    if (!trainer) {
      throw new NotFoundException('Trainer not found');
    }
    if (trainer.role !== UserRole.TRAINER && currentUser.role !== UserRole.ADMIN) {
      throw new BadRequestException('User is not a trainer');
    }

    // Verificar que el cliente existe
    const client = await this.usersRepository.findOne({
      where: { id: dto.clientId },
    });
    if (!client) {
      throw new NotFoundException('Client not found');
    }

    // Solo ADMIN o el mismo trainer puede crear suscripciones
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== dto.trainerId
    ) {
      throw new ForbiddenException('Only the trainer or admin can create subscriptions');
    }

    // Actualizar trainerId en el cliente
    client.trainerId = dto.trainerId;
    await this.usersRepository.save(client);

    const subscription = this.subscriptionsRepository.create({
      clientId: dto.clientId,
      trainerId: dto.trainerId,
      startDate: new Date(dto.startDate),
      endDate: new Date(dto.endDate),
      nextPaymentDate: new Date(dto.nextPaymentDate),
      status: dto.status ?? SubscriptionStatus.PENDING,
      amount: dto.amount,
      currency: dto.currency ?? 'USD',
      autoRenew: dto.autoRenew ?? true,
      notes: dto.notes,
    });

    return this.subscriptionsRepository.save(subscription);
  }

  async findAll(
    query: QuerySubscriptionsDto,
    currentUser: UserProfile,
  ): Promise<{
    items: Subscription[];
    total: number;
    page: number;
    limit: number;
  }> {
    const qb = this.subscriptionsRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.client', 'client')
      .leftJoinAndSelect('subscription.trainer', 'trainer')
      .orderBy('subscription.nextPaymentDate', 'ASC');

    // Filtros
    if (query.trainerId) {
      qb.andWhere('subscription.trainerId = :trainerId', {
        trainerId: query.trainerId,
      });
    }

    if (query.clientId) {
      qb.andWhere('subscription.clientId = :clientId', {
        clientId: query.clientId,
      });
    }

    if (query.status) {
      qb.andWhere('subscription.status = :status', { status: query.status });
    }

    // Permisos: Trainers solo ven sus propias suscripciones, clientes solo ven las suyas
    if (currentUser.role === UserRole.TRAINER) {
      qb.andWhere('subscription.trainerId = :userId', {
        userId: currentUser.id,
      });
    } else if (currentUser.role === UserRole.CLIENT) {
      qb.andWhere('subscription.clientId = :userId', {
        userId: currentUser.id,
      });
    }
    // ADMIN puede ver todas

    const [items, total] = await qb
      .skip((query.page - 1) * query.limit)
      .take(query.limit)
      .getManyAndCount();

    return { items, total, page: query.page, limit: query.limit };
  }

  async findOne(id: string, currentUser: UserProfile): Promise<Subscription> {
    const subscription = await this.subscriptionsRepository.findOne({
      where: { id },
      relations: ['client', 'trainer'],
    });

    if (!subscription) {
      throw new NotFoundException('Subscription not found');
    }

    // Verificar permisos
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== subscription.trainerId &&
      currentUser.id !== subscription.clientId
    ) {
      throw new ForbiddenException('Access denied');
    }

    return subscription;
  }

  async update(
    id: string,
    dto: UpdateSubscriptionDto,
    currentUser: UserProfile,
  ): Promise<Subscription> {
    const subscription = await this.findOne(id, currentUser);

    // Solo ADMIN o el trainer pueden actualizar
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== subscription.trainerId
    ) {
      throw new ForbiddenException('Only the trainer or admin can update subscriptions');
    }

    Object.assign(subscription, {
      ...(dto.endDate && { endDate: new Date(dto.endDate) }),
      ...(dto.nextPaymentDate && { nextPaymentDate: new Date(dto.nextPaymentDate) }),
      ...(dto.status && { status: dto.status }),
      ...(dto.amount !== undefined && { amount: dto.amount }),
      ...(dto.currency && { currency: dto.currency }),
      ...(dto.autoRenew !== undefined && { autoRenew: dto.autoRenew }),
      ...(dto.notes !== undefined && { notes: dto.notes }),
    });

    return this.subscriptionsRepository.save(subscription);
  }

  async cancel(id: string, currentUser: UserProfile): Promise<Subscription> {
    const subscription = await this.findOne(id, currentUser);

    // Solo ADMIN o el trainer pueden cancelar
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== subscription.trainerId
    ) {
      throw new ForbiddenException('Only the trainer or admin can cancel subscriptions');
    }

    subscription.status = SubscriptionStatus.CANCELLED;
    subscription.autoRenew = false;

    return this.subscriptionsRepository.save(subscription);
  }

  async registerPayment(
    id: string,
    currentUser: UserProfile,
  ): Promise<Subscription> {
    const subscription = await this.findOne(id, currentUser);

    // Solo ADMIN o el trainer pueden registrar pagos
    if (
      currentUser.role !== UserRole.ADMIN &&
      currentUser.id !== subscription.trainerId
    ) {
      throw new ForbiddenException('Only the trainer or admin can register payments');
    }

    // Calcular siguiente fecha de pago (30 días después)
    const nextPayment = new Date(subscription.nextPaymentDate);
    nextPayment.setDate(nextPayment.getDate() + 30);

    // Extender endDate también
    const newEndDate = new Date(subscription.endDate);
    newEndDate.setDate(newEndDate.getDate() + 30);

    subscription.nextPaymentDate = nextPayment;
    subscription.endDate = newEndDate;
    subscription.status = SubscriptionStatus.ACTIVE;

    return this.subscriptionsRepository.save(subscription);
  }

  async getExpiringSoon(
    currentUser: UserProfile,
    days = 7,
  ): Promise<Subscription[]> {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + days);

    const qb = this.subscriptionsRepository
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.client', 'client')
      .leftJoinAndSelect('subscription.trainer', 'trainer')
      .where('subscription.status = :status', { status: SubscriptionStatus.ACTIVE })
      .andWhere('subscription.nextPaymentDate <= :targetDate', { targetDate })
      .orderBy('subscription.nextPaymentDate', 'ASC');

    // Filtrar por trainer si no es admin
    if (currentUser.role === UserRole.TRAINER) {
      qb.andWhere('subscription.trainerId = :trainerId', {
        trainerId: currentUser.id,
      });
    }

    return qb.getMany();
  }

  async checkAndExpireSubscriptions(): Promise<number> {
    const now = new Date();

    const expiredSubscriptions = await this.subscriptionsRepository.find({
      where: {
        status: SubscriptionStatus.ACTIVE,
        endDate: LessThan(now),
      },
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = SubscriptionStatus.EXPIRED;
      await this.subscriptionsRepository.save(subscription);
    }

    return expiredSubscriptions.length;
  }
}
