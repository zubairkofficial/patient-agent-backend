import {
  Controller,
  Get,
  HttpException,
  HttpStatus,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/decorators/roles.decorator';
import { Roles as RolesEnum } from 'src/auth/roles.enum';
import { JwtAuthGuard } from 'src/guards/jwt-auth.guard';
import { RolesGuard } from 'src/guards/roles.guard';

@Controller('api')
export class ApiController {
  @Get('deepgram')
  @Roles([RolesEnum.USER, RolesEnum.ADMIN])
  @UseGuards(JwtAuthGuard, RolesGuard)
  getDeepgramApi() {
    try {
      const apiKey = process.env.DEEPGRAM_API_KEY;

      if (!apiKey) {
        throw new HttpException('deepgram api not found', HttpStatus.NOT_FOUND);
      }

      return {
        deepgramApi: apiKey,
      };
    } catch (error) {
      throw new HttpException(
        error.message || 'error getting deepgram api key',
        error.code || HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
