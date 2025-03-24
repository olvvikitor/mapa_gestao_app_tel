import { Inject, Injectable } from "@nestjs/common";
import { DatabaseService } from "src/config/config.bd";

@Injectable()
export class OperadorService {
  constructor(@Inject() private databaseService: DatabaseService) { }

  async getNameOperadorBySupervisor(nome_supervisor: string) {
    const nomeAjustado = nome_supervisor.split(' ')
    const query = `
            SELECT DISTINCT nome FROM dbo.MAPA_GESTAO_CHAT WHERE supervisor LIKE '${nomeAjustado[0] + ' ' + nomeAjustado[1]}%'
            UNION
            SELECT DISTINCT nome FROM dbo.MAPA_GESTAO_VOZ WHERE supervisor LIKE '${nomeAjustado[0] + ' ' + nomeAjustado[1]}%'
          `;
    const operadores = await this.databaseService.query(query);
    return operadores; // Retorna os operadores encontrados nas duas tabelas para o supervisor
  }

  async getAllNameOperador() {
    const query = `
            SELECT DISTINCT nome FROM dbo.MAPA_GESTAO_CHAT
            UNION
            SELECT DISTINCT nome FROM dbo.MAPA_GESTAO_VOZ
          `;
    const operadores = await this.databaseService.query(query);
    return operadores; // Retorna os operadores encontrados nas duas tabelas para o supervisor
  }
  async getAllNameSupervisor(canal: string, mes: string) {

    if (canal === 'CHAT') {
     const query = `
            SELECT DISTINCT supervisor FROM dbo.MAPA_GESTAO_CHAT WHERE mes = '${mes}';`;
      const operadores = await this.databaseService.query(query);
      return operadores; // Retorna os operadores encontrados nas duas tabelas para o supervisor
    }

    else {
      const query = `
        SELECT DISTINCT supervisor FROM dbo.MAPA_GESTAO_VOZ WHERE mes = '${mes}';`;
      const operadores = await this.databaseService.query(query);
      return operadores; // Retorna os operadores encontrados nas duas tabelas para o supervisor
    }

  }

}