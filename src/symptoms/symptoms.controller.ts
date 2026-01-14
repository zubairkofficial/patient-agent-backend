import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { SymptomsService } from './symptoms.service';
import { CreateSymptomsDto } from './dto/create-symptoms.dto';
import { UpdateSymptomsDto } from './dto/update-symptoms.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { roles } from '../auth/decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';

@Controller('symptoms')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SymptomsController {
  constructor(private readonly symptomsService: SymptomsService) {}

  @Post()
  @roles([RolesEnum.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSymptomsDto: CreateSymptomsDto) {
    return await this.symptomsService.create(createSymptomsDto);
  }

  @Get()
  @roles([RolesEnum.ADMIN])
  async findAll() {
    return await this.symptomsService.findAll();
  }

  @Get(':id')
  @roles([RolesEnum.ADMIN])
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.symptomsService.findOne(id);
  }

  @Patch(':id')
  @roles([RolesEnum.ADMIN])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSymptomsDto: UpdateSymptomsDto,
  ) {
    return await this.symptomsService.update(id, updateSymptomsDto);
  }

  @Delete(':id')
  @roles([RolesEnum.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.symptomsService.remove(id);
  }
}

