import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/config/config.bd';
import { CreateAcaoDto } from './5w2h.dto';

@Injectable()
export class AcaoService {
  constructor(@Inject() private databaseService: DatabaseService) {}

  async createAcao(data: CreateAcaoDto, nome_logado:string): Promise<void> {
    data.status = 'ABERTO'
    try {
      const query = `
        INSERT INTO MERCANTIL.dbo.MAPA_GESTAO5W2H (
          operador, data_inicial, data_final, o_que_deve_ser_feito, 
          por_que_precisa_ser_realizado, quem_sera_responsavel, 
          onde_a_acao_sera_realizada, quando_ela_sera_iniciada, 
          como_ela_deve_ser_realizada, quanto_custa, status,
          criado_por
        ) VALUES (
          '${data.operador}', '${data.data_inicial}', '${data.data_final}', '${data.o_que_deve_ser_feito}', 
          '${data.por_que_precisa_ser_realizado}', '${data.quem_sera_responsavel}', 
          '${data.onde_a_acao_sera_realizada}', '${data.quando_ela_sera_iniciada}', 
          '${data.como_ela_deve_ser_realizada}', '${data.quanto_custa}','${data.status}',
          '${nome_logado}'
        )
      `;

      await this.databaseService.query(query);
    } catch (error) {
      console.error('Erro ao inserir ação:', error);
      throw error;
    }
  }


  async getAll(nome_logado:string):Promise<any>{
    try {
      const query = `
        SELECT * FROM MERCANTIL.dbo.MAPA_GESTAO5W2H WHERE criado_por = '${nome_logado}' AND status = 'ABERTO' `;

      const forms  = await this.databaseService.query(query);
      return forms
    } catch (error) {
      console.error('Erro ao inserir ação:', error);
      throw error;
    }
  }

  async update(id:number, status:string):Promise<any>{


    try {
      console.log(status)
      if(status !== 'ABERTO' && status !== 'FECHADO'){
        throw new BadRequestException('valores de atualização incorretos')
      } 

      const query = `
      UPDATE MERCANTIL.dbo.MAPA_GESTAO5W2H
      SET status = '${status}'
      WHERE id = '${id}'
    `;

      await this.databaseService.query(query);
      console.log('Ação atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar ação:', error);
      throw error;
    }
  }

}
