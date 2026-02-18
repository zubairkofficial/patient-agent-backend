import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  UseGuards,
} from '@nestjs/common';
import { CourseService } from './course.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';

@Controller('courses')
export class CourseController {
  constructor(private readonly courseService: CourseService) {}

  // CREATE
  @Post('/')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.courseService.create(createCourseDto);
  }

  // GET ALL
  @Get('/')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll() {
    return this.courseService.findAll();
  }

  // GET BY ID
  @Get('/:id')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.findOne(id);
  }

  // GET BY CLASS
  @Get('/get-by-class/:classId')
  @Roles([RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findByClass(@Param('classId', ParseIntPipe) classId: number) {
    return this.courseService.findByClass(classId);
  }

  // UPDATE
  @Patch('/:id')
  @Roles([RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCourseDto: UpdateCourseDto,
  ) {
    return this.courseService.update(id, updateCourseDto);
  }

  // DELETE
  @Delete('/:id')
  @Roles([RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.courseService.remove(id);
  }
}
