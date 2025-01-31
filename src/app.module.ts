import { Global, Module } from '@nestjs/common';
import AuthModule from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import ConfigDatabaseModule from './config/config.module';
import { AppController } from './modules/app.controller';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ClientSideModule } from './client/client.module';
import { ConfigModule } from '@nestjs/config';

@Global()
@Module({
  imports: [AuthModule,JwtModule.register({
    global:true
  }),

  ConfigModule.forRoot({
    isGlobal:true
  }),

  ConfigDatabaseModule,
  ServeStaticModule.forRoot({rootPath: join(__dirname,'..', 'src', 'client'),
    serveRoot:'/client'
  }),
  ClientSideModule
  
],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
