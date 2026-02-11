import { Test, TestingModule } from '@nestjs/testing';
import { GradingChatService } from './grading-chat.service';

describe('GradingChatService', () => {
  let service: GradingChatService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GradingChatService],
    }).compile();

    service = module.get<GradingChatService>(GradingChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
