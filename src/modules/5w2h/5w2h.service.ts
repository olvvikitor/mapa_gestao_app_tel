import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/config/config.bd';
import { CreateAcaoDto } from './5w2h.dto';
import * as ExcelJS from 'exceljs'

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

  async update(id:number):Promise<any>{
    try {
      const query = `
      UPDATE MERCANTIL.dbo.MAPA_GESTAO5W2H
      SET status = 'FECHADO'
      WHERE id = '${id}'
    `;
      await this.databaseService.query(query);
      console.log('Ação atualizada com sucesso');
    } catch (error) {
      console.error('Erro ao atualizar ação:', error);
      throw error;
    }
  }
  async delete(id:number){
    try {
      const query = `
      DELETE MERCANTIL.dbo.MAPA_GESTAO5W2H
      WHERE id = '${id}'
    `;

      await this.databaseService.query(query);
      console.log('Deletado com sucesso');
    } catch (error) {
      console.error('Erro ao deletar ação:', error);
      throw error;
    }
  }
  async exporPlanosGerais(nome_logado:string):Promise<any>{
    const query = `
    SELECT * FROM MERCANTIL.dbo.MAPA_GESTAO5W2H WHERE criado_por = '${nome_logado}' AND status = 'ABERTO' `;
    const forms  = await this.databaseService.query(query);


    const workbook = new ExcelJS.Workbook()

    const worksheet = workbook.addWorksheet('PlanoGeral')

    worksheet.columns = [
      { header: 'Operador', key: 'operador', width: 20 },
      { header: 'Data Inicial', key: 'data_inicial', width: 15 },
      { header: 'Data Final', key: 'data_final', width: 15 },
      { header: 'O que deve ser feito', key: 'o_que_deve_ser_feito', width: 40 },
      { header: 'Por que precisa ser realizado', key: 'por_que_precisa_ser_realizado', width: 40 },
      { header: 'Quem será responsável', key: 'quem_sera_responsavel', width: 30 },
      { header: 'Onde a ação será realizada', key: 'onde_a_acao_sera_realizada', width: 40 },
      { header: 'Quando ela será iniciada', key: 'quando_ela_sera_iniciada', width: 15 },
      { header: 'Como ela deve ser realizada', key: 'como_ela_deve_ser_realizada', width: 40 },
      { header: 'Quanto custa', key: 'quanto_custa', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Criado por', key: 'criado_por', width: 20 }
  ];

  forms.forEach((row: any) => {
    worksheet.addRow(row);
});
    // Gerando o arquivo Excel como buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
    
  }
  async exportById(id:number):Promise<any>{
    const query = `
    SELECT * FROM MERCANTIL.dbo.MAPA_GESTAO5W2H WHERE id = '${id}'  AND status = 'ABERTO'`;
    const forms  = await this.databaseService.query(query);

    const workbook = new ExcelJS.Workbook()

    const worksheet = workbook.addWorksheet('PlanoIndividual')

    worksheet.columns = [
      { header: 'Operador', key: 'operador', width: 20 },
      { header: 'Data Inicial', key: 'data_inicial', width: 15 },
      { header: 'Data Final', key: 'data_final', width: 15 },
      { header: 'O que deve ser feito', key: 'o_que_deve_ser_feito', width: 40 },
      { header: 'Por que precisa ser realizado', key: 'por_que_precisa_ser_realizado', width: 40 },
      { header: 'Quem será responsável', key: 'quem_sera_responsavel', width: 30 },
      { header: 'Onde a ação será realizada', key: 'onde_a_acao_sera_realizada', width: 40 },
      { header: 'Quando ela será iniciada', key: 'quando_ela_sera_iniciada', width: 15 },
      { header: 'Como ela deve ser realizada', key: 'como_ela_deve_ser_realizada', width: 40 },
      { header: 'Quanto custa', key: 'quanto_custa', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Criado por', key: 'criado_por', width: 20 }
  ];

  forms.forEach((row: any) => {
    worksheet.addRow(row);
});
    // Gerando o arquivo Excel como buffer
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
    
  }


  
}
