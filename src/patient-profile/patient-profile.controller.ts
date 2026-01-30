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
import { GeneratePatientProfileDto } from './dto/generate-patient-profile.dto';
import { SavePatientProfileDto } from './dto/save-patient-profile.dto';
import { RegeneratePatientProfileDto } from './dto/regenerate-patient-profile.dto';

@Controller('patient-profiles')
export class PatientProfileController {
  constructor(private readonly patientProfileService: PatientProfileService) {}

  @Post('/generate')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async generate(@Body() generatePatientProfileDto: GeneratePatientProfileDto) {
    return await this.patientProfileService.generateProfile(
      generatePatientProfileDto.diagnosis_id,
    );
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

  @Post(':id/save-profile')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async saveProfile(
    @Param('id', ParseIntPipe) id: number,
    @Body() savePatientProfileDto: SavePatientProfileDto,
  ) {
    return await this.patientProfileService.saveProfile(
      id,
      savePatientProfileDto.save,
    );
  }

  @Post(':id/regenerate')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.OK)
  async regenerate(
    @Param('id', ParseIntPipe) id: number,
    @Body() regeneratePatientProfileDto: RegeneratePatientProfileDto,
  ) {
    return await this.patientProfileService.regenerateProfile(
      id,
      regeneratePatientProfileDto.instruction,
    );
  }
}
