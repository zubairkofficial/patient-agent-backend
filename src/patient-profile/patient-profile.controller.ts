import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { PatientProfileService } from './patient-profile.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';
import { CreatePatientProfileDto } from './dto/create-patient-profile.dto';

@Controller('patient-profiles')
export class PatientProfileController {
  constructor(private readonly patientProfileService: PatientProfileService) {}

  @Post()
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createPatientProfileDto: CreatePatientProfileDto) {
    return await this.patientProfileService.create(createPatientProfileDto);
  }

  @Get()
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll() {
    return await this.patientProfileService.findAll();
  }

  @Get(':id')
  @Roles([RolesEnum.ADMIN, RolesEnum.USER])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.patientProfileService.findOne(id);
  }

  @Delete(':id')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    return await this.patientProfileService.remove(id);
  }
}
