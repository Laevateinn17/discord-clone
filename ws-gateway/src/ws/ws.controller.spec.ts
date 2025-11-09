import { Test, TestingModule } from '@nestjs/testing';
import { WsController } from './ws.controller';

describe('WsController', () => {
  let controller: WsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WsController],
    }).compile();

    controller = module.get<WsController>(WsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
