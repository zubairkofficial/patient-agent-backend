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
  Req,
} from '@nestjs/common';
import { ClassService } from './class.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { Roles } from 'src/decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';
import { RolesGuard } from 'src/guards/roles.guard';
import { CreateClassDto } from './dto/create-class.dto';
import { UpdateClassDto } from './dto/update-class.dto';

@Controller('classes')
export class ClassController {
  constructor(private readonly classService: ClassService) {}

  // CREATE
  @Post('/')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async createClass(@Body() createClassDto: CreateClassDto, @Req() req: any) {
    return this.classService.create(createClassDto);
  }

  // GET ALL
  @Get('/')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll() {
    return this.classService.findAll();
  }

  // GET BY ID
  @Get('/:id')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.classService.findOne(id);
  }

  // UPDATE
  @Patch('/:id')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClassDto: UpdateClassDto,
  ) {
    return this.classService.update(id, updateClassDto);
  }

  // DELETE
  @Delete('/:id')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return this.classService.remove(id);
  }
}
