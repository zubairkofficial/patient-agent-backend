import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { DiagnosisService } from './diagnosis.service';
import { CreateDiagnosisDto } from './dto/create-diagnosis.dto';
import { UpdateDiagnosisDto } from './dto/update-diagnosis.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';

@Controller('diagnoses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  @Roles([RolesEnum.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDiagnosisDto: CreateDiagnosisDto) {
    return await this.diagnosisService.create(createDiagnosisDto);
  }

  @Get()
  @Roles([RolesEnum.ADMIN, RolesEnum.USER])
  async findAll() {
    return await this.diagnosisService.findAll();
  }

  @Get(':code')
  @Roles([RolesEnum.ADMIN, RolesEnum.USER])
  async findOne(@Param('code') code: string) {
    return await this.diagnosisService.findOne(code);
  }

  @Patch(':code')
  @Roles([RolesEnum.ADMIN])
  async update(
    @Param('code') code: string,
    @Body() updateDiagnosisDto: UpdateDiagnosisDto,
  ) {
    return await this.diagnosisService.update(code, updateDiagnosisDto);
  }

  @Delete(':code')
  @Roles([RolesEnum.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('code') code: string) {
    await this.diagnosisService.remove(code);
  }
}

