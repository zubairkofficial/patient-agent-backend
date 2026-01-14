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
import { TreatmentsService } from './treatments.service';
import { CreateTreatmentsDto } from './dto/create-treatments.dto';
import { UpdateTreatmentsDto } from './dto/update-treatments.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { roles } from '../auth/decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';

@Controller('treatments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TreatmentsController {
  constructor(private readonly treatmentsService: TreatmentsService) {}

  @Post()
  @roles([RolesEnum.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createTreatmentsDto: CreateTreatmentsDto) {
    return await this.treatmentsService.create(createTreatmentsDto);
  }

  @Get()
  @roles([RolesEnum.ADMIN])
  async findAll() {
    return await this.treatmentsService.findAll();
  }

  @Get(':id')
  @roles([RolesEnum.ADMIN])
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.treatmentsService.findOne(id);
  }

  @Patch(':id')
  @roles([RolesEnum.ADMIN])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateTreatmentsDto: UpdateTreatmentsDto,
  ) {
    return await this.treatmentsService.update(id, updateTreatmentsDto);
  }

  @Delete(':id')
  @roles([RolesEnum.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.treatmentsService.remove(id);
  }
}

