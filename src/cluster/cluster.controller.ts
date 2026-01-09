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
import { ClusterService } from './cluster.service';
import { CreateClusterDto } from './dto/create-cluster.dto';
import { UpdateClusterDto } from './dto/update-cluster.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';

@Controller('clusters')
@UseGuards(JwtAuthGuard, RolesGuard)
export class ClusterController {
  constructor(private readonly clusterService: ClusterService) {}

  @Post()
  @Roles([RolesEnum.ADMIN])
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createClusterDto: CreateClusterDto) {
    return await this.clusterService.create(createClusterDto);
  }

  @Get()
  @Roles([RolesEnum.ADMIN, RolesEnum.USER])
  async findAll() {
    return await this.clusterService.findAll();
  }

  @Get(':id')
  @Roles([RolesEnum.ADMIN, RolesEnum.USER])
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.clusterService.findOne(id);
  }

  @Patch(':id')
  @Roles([RolesEnum.ADMIN])
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateClusterDto: UpdateClusterDto,
  ) {
    return await this.clusterService.update(id, updateClusterDto);
  }

  @Delete(':id')
  @Roles([RolesEnum.ADMIN])
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.clusterService.remove(id);
  }
}

