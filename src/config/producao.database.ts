import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

@Injectable()
export class ProducaoDataBase implements OnModuleDestroy, OnModuleInit {

  private pool: sql.ConnectionPool;

  constructor(private configService: ConfigService) {
  
  }
    // Inicializa a conexão quando o módulo for iniciado
 async onModuleInit() {
        await this.connect();
    }
  // Conectar ao banco de dados
  private async connect() {

    try {
      this.pool = await sql.connect(
        {
          server: this.configService.get<string>('server') as string,
          authentication: {
            type: 'default',
            options: {
              userName: this.configService.get('user'),
              password: this.configService.get('password')
            },

          },
          options: {
            database: 'MERCANTIL',
            encrypt: false, // Desabilita o uso de SSL
            trustServerCertificate: true, // Ignora o certificado SSL se o banco não tiver um válido
          },
        }
    );
      console.log('Conexão bem-sucedida ao SQL Server');
    } catch (error) {
      console.error('Erro ao conectar ao banco de dados', error);
    }
  }
  // Função para executar uma consulta
  async query(queryString: string) {
    try {
      const result = await this.pool.request().query(queryString);
      return result.recordset; // Retorna os dados da consulta
    } catch (error) {
      console.error('Erro ao executar consulta', error);
      throw new Error('Erro ao executar consulta');
    }
  }

  // Fechar a conexão ao destruir o módulo
  async onModuleDestroy() {
    if (this.pool) {
      await this.pool.close();
      console.log('Conexão fechada');
    }
  }
}
