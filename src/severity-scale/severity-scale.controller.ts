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
import { SeverityScaleService } from './severity-scale.service';
import { CreateSeverityScaleDto } from './dto/create-severity-scale.dto';
import { UpdateSeverityScaleDto } from './dto/update-severity-scale.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';

@Controller('severity-scales')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SeverityScaleController {
  constructor(private readonly severityScaleService: SeverityScaleService) {}

  @Post()
  @Roles([RolesEnum.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createSeverityScaleDto: CreateSeverityScaleDto) {
    return await this.severityScaleService.create(createSeverityScaleDto);
  }

  @Get()
  @Roles([RolesEnum.ADMIN])
  async findAll() {
    return await this.severityScaleService.findAll();
  }

  @Get(':id')
  @Roles([RolesEnum.ADMIN])
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.severityScaleService.findOne(id);
  }

  @Patch(':id')
  @Roles([RolesEnum.ADMIN])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateSeverityScaleDto: UpdateSeverityScaleDto,
  ) {
    return await this.severityScaleService.update(id, updateSeverityScaleDto);
  }

  @Delete(':id')
  @Roles([RolesEnum.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.severityScaleService.remove(id);
  }
}

