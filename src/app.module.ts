import { Global, Module } from '@nestjs/common';
import AuthModule from './modules/auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import ConfigDatabaseModule from './config/config.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { ClientSideModule } from './client/client.module';
import AcaoModule from './modules/5w2h/5w2h.module';
import { IndicadoresModule } from './modules/indicadores/indicadores.module';
import { OperadorModule } from './modules/operador/operador.module';

@Global()
@Module({
  imports: [AuthModule,JwtModule.register({
    global:true
  }),
  ConfigDatabaseModule,
  ServeStaticModule.forRoot({rootPath: join(__dirname,'..', 'src', 'client'),
    serveRoot:'/client'
  }),
  ClientSideModule,AcaoModule,IndicadoresModule,OperadorModule
],
  controllers: [],
  providers: [],
})
export class AppModule {}
