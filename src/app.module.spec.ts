import { ConfigModule } from '@nestjs/config';
import { Test, type TestingModule } from '@nestjs/testing';
import { AppModule } from './app.module';
import { DatabaseModule } from './modules/database/database.module';

describe('AppModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
  });

  it('should be defined', () => {
    expect(module).toBeDefined();
  });

  it('should import ConfigModule', () => {
    expect(module.get(ConfigModule)).toBeDefined();
  });

  it('should import DatabaseModule', () => {
    expect(module.get(DatabaseModule)).toBeDefined();
  });
});
