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
import { DiagnosisService } from './diagnosis.service';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';

@Controller('diagnoses')
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDiagnosisDto: CreateDiagnosisDto) {
    console.log('Received DTO:', createDiagnosisDto);
    return await this.diagnosisService.create(createDiagnosisDto);
  }

  @Get()
  @Roles([RolesEnum.ADMIN, RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll() {
    return await this.diagnosisService.findAll();
  }

  @Get(':id')
  @Roles([RolesEnum.ADMIN, RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.diagnosisService.findOne(id);
  }

  @Patch(':id')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiagnosisDto: UpdateDiagnosisDto,
  ) {
    return await this.diagnosisService.update(id, updateDiagnosisDto);
  }

  @Delete(':id')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.diagnosisService.remove(id);
  }
}
