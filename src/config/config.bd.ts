import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as sql from 'mssql';

@Injectable()
export class DatabaseService implements OnModuleDestroy {

  private pool: sql.ConnectionPool;

  constructor() {
    this.connect();
  }

  // Conectar ao banco de dados
  private async connect() {

    try {
      this.pool = await sql.connect(
        {
          server: 'MISDEV30\\MIS_BI',
          authentication: {
            type: 'default',
            options: {
              userName: 'john',
              password: 'devmis@2'
            },
          },
          options: {
            database: 'MAPA_GESTAO_CHAT',
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
