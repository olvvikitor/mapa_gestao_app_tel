import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';
import { TesteDatabase } from './teste.database';
import { ProducaoDataBase } from './producao.database';

@Injectable()
export class DatabaseService {

  constructor(private configService: ConfigService) {
  }

  async createInstance(){
    const ambiente = this.configService.get('ambiente')
    if(ambiente === 'prod'){
      return new TesteDatabase(this.configService)
    }
    else{
      return new ProducaoDataBase(this.configService)
    }
  }
}
