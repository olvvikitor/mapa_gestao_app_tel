import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/config/config.bd';
import { CreateAcaoDto } from './5w2h.dto';

@Injectable()
export class AcaoService {
  constructor(@Inject() private databaseService: DatabaseService) {}

  async createAcao(data: CreateAcaoDto, nome_logado:string): Promise<void> {
    data.status = 'ABERTO'
    console.log(data)

    try {
      const query = `
        INSERT INTO Acoes (
          operador, data_inicial, data_final, o_que_deve_ser_feito, 
          por_que_precisa_ser_realizado, quem_será_responsável, 
          onde_a_ação_será_realizada, quando_ela_será_iniciada, 
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
      console.log('Ação inserida com sucesso');
    } catch (error) {
      console.error('Erro ao inserir ação:', error);
      throw error;
    }
  }


  async getAll(nome_logado:string):Promise<any>{
    try {
      const query = `
        SELECT * FROM Acoes WHERE criado_por = '${nome_logado}' AND status = 'ABERTO' `;

      const forms  = await this.databaseService.query(query);
      return forms
      console.log('Ação inserida com sucesso');
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
      UPDATE Acoes
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
