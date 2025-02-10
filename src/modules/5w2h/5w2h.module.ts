import { Module } from '@nestjs/common';
import { AcaoController } from './5w2h.controller';
import { AcaoService } from './5w2h.service';
import ConfigDatabaseModule from 'src/config/config.module';
import AuthModule from '../auth/auth.module';

@Module({
  imports:[ConfigDatabaseModule, AuthModule],
  controllers:[AcaoController],
  providers:[AcaoService],
  exports:[AcaoService]
})
export default class AcaoModule{}