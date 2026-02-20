import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models/user.model';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';

import { EmailService } from '../services/email.service';
import { SignupDto } from './dto/signup.dto';
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { Roles } from './roles.enum';

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private emailService: EmailService,
  ) {}

  async createUser(dto: AdminCreateUserDto) {
    try {
      const existingUser = await this.userModel.findOne({
        where: { email: dto.email },
      });

      if (existingUser) {
        throw new BadRequestException('User already exists');
      }

      // Generate random password
      const plainPassword = crypto.randomBytes(6).toString('hex'); // 12 chars

      const hashedPassword = await bcrypt.hash(plainPassword, 10);

      const user = await this.userModel.create({
        ...dto,
        password: hashedPassword,
        emailVerified: true, // admin created users are auto
      } as any);

      // Send email with password
      await this.emailService.sendUserCredentials(user.email, plainPassword);

      return {
        success: true,
        message: 'User created successfully. Credentials sent via email.',
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      if (error instanceof BadRequestException) throw error;
      console.error('[createUser] failed', error);
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async getAllUsers() {
    const users = await this.userModel.findAll({
      attributes: { exclude: ['password'] },
      where: {
        role: Roles.USER, // only return regular users, not admins
      },
    });

    return {
      success: true,
      data: users,
    };
  }

  async deleteUser(id: number) {
    const user = await this.userModel.findByPk(id);

    if (!user) {
      throw new NotFoundException('User not found');
    }

    await user.destroy();

    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}
