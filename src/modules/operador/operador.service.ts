import { Inject, Injectable } from "@nestjs/common";
import { DatabaseService } from "src/config/config.bd";

@Injectable()
export class OperadorService {
    constructor(@Inject() private databaseService: DatabaseService) { }

    async getNameOperadorBySupervisor(nome_supervisor: string) {
        const query = `
            SELECT DISTINCT nome FROM dbo.MAPA_GESTAO_CHAT WHERE supervisor = '${nome_supervisor}'
            UNION
            SELECT DISTINCT nome FROM dbo.MAPA_GESTAO_VOZ WHERE supervisor = '${nome_supervisor}'
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
    async getAllNameSupervisor(canal:string) {
      let query;
      if(canal ==='CHAT'){
        query = `
            SELECT DISTINCT supervisor FROM dbo.MAPA_GESTAO_CHAT`;
      }
      else{
        query = `
        SELECT DISTINCT supervisor FROM dbo.MAPA_GESTAO_VOZ`;
      }

        const operadores = await this.databaseService.query(query);
        return operadores; // Retorna os operadores encontrados nas duas tabelas para o supervisor
    }

}