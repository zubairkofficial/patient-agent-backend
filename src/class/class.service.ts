import {
  Injectable,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Course } from '../models/course.model';
import { User } from '../models/user.model';
import { Class } from 'src/models/class.model';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Injectable()
export class ClassService {
  constructor(
    @InjectModel(Class)
    private readonly classModel: typeof Class,
  ) {}

  // CREATE
  async create(createClassDto: CreateClassDto): Promise<Class> {
    try {
      return await this.classModel.create(createClassDto as any);
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to create class',
      );
    }
  }

  // FIND ALL
  async findAll(): Promise<Class[]> {
    try {
      return await this.classModel.findAll({
        include: [Course, User],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch classes',
      );
    }
  }

  // FIND ONE
  async findOne(id: number): Promise<Class> {
    try {
      const classItem = await this.classModel.findByPk(id, {
        include: [Course, User],
      });

      if (!classItem) {
        throw new NotFoundException('Class not found');
      }

      return classItem;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to fetch class',
      );
    }
  }

  // UPDATE
  async update(id: number, updateClassDto: UpdateClassDto): Promise<Class> {
    try {
      const classItem = await this.findOne(id);

      await classItem.update(updateClassDto);

      return classItem;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to update class',
      );
    }
  }

  // DELETE
  async remove(id: number): Promise<{ message: string }> {
    try {
      const classItem = await this.findOne(id);

      await classItem.destroy();

      return { message: 'Class deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to delete class',
      );
    }
  }
}
