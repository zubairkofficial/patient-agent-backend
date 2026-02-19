import { Module } from '@nestjs/common';
import { ClassController } from './class.controller';
import { ClassService } from './class.service';
import { SequelizeModule } from '@nestjs/sequelize';
import { Course } from 'src/models/course.model';
import { Class } from 'src/models/class.model';
import { User } from 'src/models/user.model';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [SequelizeModule.forFeature([Course, Class, User]), AuthModule],
  controllers: [ClassController],
  providers: [ClassService],
})
export class ClassModule {}
