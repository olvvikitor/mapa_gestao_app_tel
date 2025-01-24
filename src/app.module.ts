import { Global, Module } from '@nestjs/common';
import AuthModule from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import ConfigDatabaseModule from './config/config.module';
import { AppController } from './modules/app.controller';

@Global()
@Module({
  imports: [AuthModule,JwtModule.register({
    global:true
  }),
  ConfigDatabaseModule
],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
