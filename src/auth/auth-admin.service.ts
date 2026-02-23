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
import {
  AdminCreateUserDto,
  AdminUpdateUserDto,
} from './dto/admin-create-user.dto';
import { Roles } from './roles.enum';
import { Class } from 'src/models/class.model';

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
      const hashedPassword = await bcrypt.hash(dto.password, 10);

      const user = await this.userModel.create({
        ...dto,
        password: hashedPassword,
        emailVerified: true, // admin created users are auto
      } as any);

      // Send email with password
      await this.emailService.sendUserCredentials(user.email, dto.password);

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

  async getUserById(id: number) {
    try {
      const user = await this.userModel.findByPk(id, {
        attributes: { exclude: ['password'] },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return {
        success: true,
        data: user,
      };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      console.error('[getUserById] failed', error);
      throw new InternalServerErrorException('Failed to fetch user');
    }
  }

  async updateUser(dto: AdminUpdateUserDto) {
    try {
      const user = await this.userModel.findByPk(dto.id);

      if (!user) {
        throw new NotFoundException('User not found');
      }

      await user.update({
        classId: dto.classId,
      });

      return {
        success: true,
        message: 'User updated successfully',
        data: {
          id: user.id,
          email: user.email,
          role: user.role,
          classId: user.classId,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      )
        throw error;
      console.error('[updateUser] failed', error);
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async getAllUsers() {
    const users = await this.userModel.findAll({
      include: [
        {
          model: Class,
          required: false,
        },
      ],
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
