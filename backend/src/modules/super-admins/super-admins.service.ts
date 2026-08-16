import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { SuperAdminUser } from '../../database/entities/super-admin-user.entity';
import { Role } from '../../database/entities/role.entity';
import { CreateSuperAdminDto } from './dto/create-super-admin.dto';
import { UpdateSuperAdminDto } from './dto/update-super-admin.dto';

const SALT_ROUNDS = 12;

@Injectable()
export class SuperAdminsService {
  constructor(
    @InjectRepository(SuperAdminUser)
    private readonly usersRepo: Repository<SuperAdminUser>,
    @InjectRepository(Role)
    private readonly rolesRepo: Repository<Role>,
  ) {}

  findAll(): Promise<SuperAdminUser[]> {
    return this.usersRepo.find({
      relations: { role: true },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<SuperAdminUser> {
    const user = await this.usersRepo.findOne({
      where: { id },
      relations: { role: true },
    });
    if (!user) throw new NotFoundException('Super admin user not found');
    return user;
  }

  async create(dto: CreateSuperAdminDto): Promise<SuperAdminUser> {
    const existing = await this.usersRepo.findOne({
      where: { email: dto.email },
    });
    if (existing)
      throw new ConflictException('A user with this email already exists');

    const role = await this.rolesRepo.findOne({ where: { id: dto.roleId } });
    if (!role) throw new NotFoundException('Role not found');

    const passwordHash = await bcrypt.hash(dto.password, SALT_ROUNDS);
    const user = this.usersRepo.create({
      fullName: dto.fullName,
      email: dto.email,
      passwordHash,
      roleId: role.id,
    });
    return this.usersRepo.save(user);
  }

  async update(id: string, dto: UpdateSuperAdminDto): Promise<SuperAdminUser> {
    const user = await this.findOne(id);
    if (dto.roleId) {
      const role = await this.rolesRepo.findOne({ where: { id: dto.roleId } });
      if (!role) throw new NotFoundException('Role not found');
      user.roleId = role.id;
    }
    if (dto.fullName !== undefined) user.fullName = dto.fullName;
    if (dto.isActive !== undefined) user.isActive = dto.isActive;
    return this.usersRepo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.usersRepo.remove(user);
  }

  listRoles(): Promise<Role[]> {
    return this.rolesRepo.find({ order: { name: 'ASC' } });
  }
}
