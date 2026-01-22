import { Injectable } from '@nestjs/common';
import { OPERATIONS } from '../utils/enums/operations.enum';

@Injectable()
export class OperationsService {
  findAll(): any {
    const operations = Object.values(OPERATIONS);
    return {
      success: true,
      message: 'Operations fetched successfully',
      data: operations,
    };
  }
}
