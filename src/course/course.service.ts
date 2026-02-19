import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Class } from '../models/class.model';
import { Course } from 'src/models/course.model';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Injectable()
export class CourseService {
  constructor(
    @InjectModel(Course)
    private readonly courseModel: typeof Course,

    @InjectModel(Class)
    private readonly classModel: typeof Class,
  ) {}

  // CREATE
  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    try {
      const classExists = await this.classModel.findByPk(
        createCourseDto.classId,
      );

      if (!classExists) {
        throw new BadRequestException('Class does not exist');
      }

      return await this.courseModel.create(createCourseDto as any);
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to create course',
      );
    }
  }

  // FIND ALL
  async findAll(): Promise<Course[]> {
    try {
      return await this.courseModel.findAll({
        include: [Class],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch courses',
      );
    }
  }

  // FIND ONE
  async findOne(id: number): Promise<Course> {
    try {
      const course = await this.courseModel.findByPk(id, {
        include: [Class],
      });

      if (!course) {
        throw new NotFoundException('Course not found');
      }

      return course;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to fetch course',
      );
    }
  }

  // FIND BY CLASS
  async findByClass(classId: number): Promise<Course[]> {
    try {
      return await this.courseModel.findAll({
        where: { classId },
        include: [Class],
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to fetch courses by class',
      );
    }
  }

  // UPDATE
  async update(
    id: number,
    updateCourseDto: UpdateCourseDto,
  ): Promise<Course> {
    try {
      const course = await this.findOne(id);

      if (updateCourseDto.classId) {
        const classExists = await this.classModel.findByPk(
          updateCourseDto.classId,
        );

        if (!classExists) {
          throw new BadRequestException('Class does not exist');
        }
      }

      await course.update(updateCourseDto);

      return course;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to update course',
      );
    }
  }

  // DELETE
  async remove(id: number): Promise<{ message: string }> {
    try {
      const course = await this.findOne(id);

      await course.destroy();

      return { message: 'Course deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to delete course',
      );
    }
  }
}
