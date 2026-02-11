import { Test, TestingModule } from '@nestjs/testing';
import { GradingChatController } from './grading-chat.controller';

describe('GradingChatController', () => {
  let controller: GradingChatController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GradingChatController],
    }).compile();

    controller = module.get<GradingChatController>(GradingChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
