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
import { roles } from '../auth/decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';

@Controller('diagnoses')
@UseGuards(JwtAuthGuard, RolesGuard)
export class DiagnosisController {
  constructor(private readonly diagnosisService: DiagnosisService) {}

  @Post()
  @roles([RolesEnum.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDiagnosisDto: CreateDiagnosisDto) {
    return await this.diagnosisService.create(createDiagnosisDto);
  }

  @Get()
  @roles([RolesEnum.ADMIN, RolesEnum.USER])
  async findAll() {
    return await this.diagnosisService.findAll();
  }

  @Get(':id')
  @roles([RolesEnum.ADMIN, RolesEnum.USER])
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.diagnosisService.findOne(id);
  }

  @Patch(':id')
  @roles([RolesEnum.ADMIN])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateDiagnosisDto: UpdateDiagnosisDto,
  ) {
    return await this.diagnosisService.update(id, updateDiagnosisDto);
  }

  @Delete(':id')
  @roles([RolesEnum.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.diagnosisService.remove(id);
  }
}

