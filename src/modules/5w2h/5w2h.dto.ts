export class CreateAcaoDto {
  operador: string;
  data_inicial: string;
  data_final: string;
  o_que_deve_ser_feito: string;
  por_que_precisa_ser_realizado: string;
  quem_sera_responsavel: string;
  onde_a_acao_sera_realizada: string;
  quando_ela_sera_iniciada: string;
  como_ela_deve_ser_realizada: string;
  quanto_custa: string;
  status?:string
}
