export class CreateAcaoDto {
  operador: string;
  data_inicial: string;
  data_final: string;
  o_que_deve_ser_feito: string;
  por_que_precisa_ser_realizado: string;
  quem_será_responsável: string;
  onde_a_ação_será_realizada: string;
  quando_ela_será_iniciada: string;
  como_ela_deve_ser_realizada: string;
  quanto_custa: string;
  status?:string
}
