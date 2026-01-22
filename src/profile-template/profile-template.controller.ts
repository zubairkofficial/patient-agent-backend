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
import { ProfileTemplateService } from './profile-template.service';
import { CreateProfileTemplateDto } from './dto/create-profile-template.dto';
import { UpdateProfileTemplateDto } from './dto/update-profile-template.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard } from '../guards/roles.guard';
import { Roles } from '../decorators/roles.decorator';
import { Roles as RolesEnum } from '../auth/roles.enum';

@Controller('profile-templates')
export class ProfileTemplateController {
  constructor(
    private readonly profileTemplateService: ProfileTemplateService,
  ) {}

  @Post()
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProfileTemplateDto: CreateProfileTemplateDto) {
    return await this.profileTemplateService.create(createProfileTemplateDto);
  }

  @Get()
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findAll() {
    return await this.profileTemplateService.findAll();
  }

  @Get(':id')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return await this.profileTemplateService.findOne(id);
  }

  @Patch(':id')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateProfileTemplateDto: UpdateProfileTemplateDto,
  ) {
    return await this.profileTemplateService.update(id, updateProfileTemplateDto);
  }

  @Delete(':id')
  @Roles([RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id', ParseIntPipe) id: number) {
    await this.profileTemplateService.remove(id);
  }
}
