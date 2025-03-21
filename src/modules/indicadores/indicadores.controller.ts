import { Controller, Get, Inject, Param, Query, Req, UseGuards } from "@nestjs/common";
import { DatabaseService } from "src/config/config.bd";
import { AuthGuard } from "../auth/services/auth.guard";
import { IndicadoresSupervisorService } from "./indicadores.supervisor.service";
import { CoordenadorService } from "./indicadores.coordenador.service";
import { OperadorService } from "../operador/operador.service";
import { GeralService } from "./indicadores.geral.service";



@UseGuards(AuthGuard)
@Controller('api/indicadores')
export class IndicadoresController {
  constructor(@Inject() private databaseService: DatabaseService, 
  @Inject() private indicadoresSupervisorService: IndicadoresSupervisorService,
  @Inject() private coordenadorService:CoordenadorService,
  @Inject() private geralService:GeralService
  ) { }

  private autorizados = [
    'COORDENADOR MIS SR',
    'COORDENADOR DE QUALIDADE E PROCESSOS',
    'COORDENADOR DE QUALIDADE',
    'COORDENADOR DE QUALIDADE SR',
    'COORDENADOR DE OPERACOES - INTERINO',
    'ANALISTA DE MIS I',
    'ANALISTA DE MIS SR',
    'COORDENADOR DE OPERACOES',
    'SUPERVISOR(A) DE QUALIDADE - INTERINO',
    'SUPERVISOR(A) DE QUALIDADE',
    'SUPERVISOR(A) DE MONITORIA',
    'COORDENADOR DE PLANEJAMENTO',
    'GERENTE DE QUALIDADE',
    'GERENTE GERAL'
  ];


  @Get('table/')
  async getTable(
   @Query('mes') mes: string,
   @Query('canal') canal: string,
   @Query('supervisor') supervisor:string,@Query('classificadoPor') classificacao :string , @Req() req: any) {

    const cargo:string = 'COORDENADOR DE OPERACOES - INTERINO'
    const nome_logado = 'PAULO JOSE SOUZA AGUIAR BARBOSA OLIVEIRA'


    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getTable(mes, canal, nome_logado, classificacao)
    }
    else {
      if(cargo === 'COORDENADOR DE OPERACOES' || cargo ==='COORDENADOR DE OPERACOES - INTERINO'){
        return await this.coordenadorService.getTable(mes, canal,supervisor,classificacao,nome_logado)
      }
      return await this.geralService.getTable(mes, canal,supervisor,classificacao)
    }
  }
  @Get('table/supervisores')
  async getTableSupervisores(
   @Query('mes') mes: string,
   @Query('canal') canal: string
   ,@Query('classificadoPor') classificacao :string , @Req() req: any) {
    const cargo:string = 'COORDENADOR DE OPERACOES - INTERINO'
    const nome_logado = 'PAULO JOSE SOUZA AGUIAR BARBOSA OLIVEIRA'
    // const nome_logado = 'LUIS CAVALCANTE COSTA'


    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getTableSupervisoresQuartil(mes, canal,classificacao,nome_logado)
    }
    else{
      if(cargo === 'COORDENADOR DE OPERACOES' || cargo==='COORDENADOR DE OPERACOES - INTERINO'){

      return await this.coordenadorService.getTableSupervisoresQuartil(mes, canal,classificacao,nome_logado)
    }

    return await this.geralService.getTableSupervisoresQuartil(mes, canal,classificacao)
      
    }
  
  }

  @Get('/')
  async getIndicadoresEquipe(
    @Query('mes') mes: string, @Query('canal') canal: string,
    @Query('supervisor') supervisor:string|undefined,
    @Req() req: any) {

      const cargo:string = 'COORDENADOR DE OPERACOES - INTERINO'
      const nome_logado = 'PAULO JOSE SOUZA AGUIAR BARBOSA OLIVEIRA'
    // const nome_logado = 'LUIS CAVALCANTE COSTA'

    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getIndicadoresEquipe(mes, canal, nome_logado)
    }
    else {
      if(cargo === 'COORDENADOR DE OPERACOES' || cargo==='COORDENADOR DE OPERACOES - INTERINO'){
        return await this.coordenadorService.getIndicadoresEquipe(mes, canal, supervisor, nome_logado)
      }
      return await this.geralService.getIndicadoresEquipe(mes, canal, supervisor)
    }

  }

  @Get('/quartil-tma/')
  async getQuartilTma(@Query('mes') mes: string, @Query('canal') canal: string, @Query('supervisor') supervisor:string | undefined, @Req() req: any) {

    const nome_logado = 'PAULO JOSE SOUZA AGUIAR BARBOSA OLIVEIRA'
    const cargo:string = 'COORDENADOR DE OPERACOES - INTERINO'
    // const nome_logado = 'LUIS CAVALCANTE COSTA'


    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getQuartilTma(mes, canal, nome_logado);
    }
    else{
      if(cargo === 'COORDENADOR DE OPERACOES' || cargo==='COORDENADOR DE OPERACOES - INTERINO'){
        return await this.coordenadorService.getQuartilTma(mes, canal, supervisor,nome_logado); 
      }
      return await this.geralService.getQuartilTma(mes, canal, supervisor); 

    }
  }

  @Get('/quartil-csat/')
  async getQuartilCsat(@Query('mes') mes: string, @Query('canal') canal: string, @Query('supervisor') supervisor:string | undefined, @Req() req: any) {
    const nome_logado = 'PAULO JOSE SOUZA AGUIAR BARBOSA OLIVEIRA'
    const cargo:string = 'COORDENADOR DE OPERACOES - INTERINO'
    // const nome_logado = 'LUIS CAVALCANTE COSTA'


    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getQuartilCsat(mes, canal, nome_logado);
    }
    else{
      if(cargo === 'COORDENADOR DE OPERACOES' || cargo==='COORDENADOR DE OPERACOES - INTERINO'){
        return await this.coordenadorService.getQuartilCsat(mes, canal, supervisor, nome_logado);
      }
      return await this.geralService.getQuartilCsat(mes, canal, supervisor);

    }
  }

  @Get('/quartil-monitoria/')
  async quartilNotaQualidade(@Query('mes') mes: string, @Query('canal') canal: string, @Query('supervisor') supervisor:string | undefined, @Req() req: any) {
    const nome_logado = 'PAULO JOSE SOUZA AGUIAR BARBOSA OLIVEIRA'
    const cargo:string = 'COORDENADOR DE OPERACOES - INTERINO'
    // const nome_logado = 'LUIS CAVALCANTE COSTA'


    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getQuartilNotaQualide(mes, canal, nome_logado);
    }
    else{
      if(cargo === 'COORDENADOR DE OPERACOES' || cargo==='COORDENADOR DE OPERACOES - INTERINO'){
        return await this.coordenadorService.getQuartilNotaQualide(mes, canal,supervisor,nome_logado);
      }
      return await this.geralService.getQuartilNotaQualide(mes, canal,supervisor);

    }

  }

  @Get('/quartil-monitoria-vendas/')
  async quartilMoitoriaVendas(@Query('mes') mes: string, @Query('canal') canal: string, @Query('supervisor') supervisor:string | undefined, @Req() req: any) {
    const nome_logado = 'PAULO JOSE SOUZA AGUIAR BARBOSA OLIVEIRA'
    const cargo:string = 'COORDENADOR DE OPERACOES - INTERINO'
    // const nome_logado = 'LUIS CAVALCANTE COSTA'


    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getQuartilNotaVenda(mes, canal, nome_logado);
    }
    else{
      if(cargo === 'COORDENADOR DE OPERACOES' || cargo==='COORDENADOR DE OPERACOES - INTERINO'){
        return await this.coordenadorService.getQuartilNotaVenda(mes, canal,supervisor,nome_logado);
      }
      return await this.geralService.getQuartilNotaVenda(mes, canal,supervisor);

    }

  }

  @Get('/quartil-vendas/')
  async quartilVendas(@Query('mes') mes: string, @Query('canal') canal: string, @Query('supervisor') supervisor:string | undefined, @Req() req: any) {
    const nome_logado = 'PAULO JOSE SOUZA AGUIAR BARBOSA OLIVEIRA'
    // const nome_logado = 'LUIS CAVALCANTE COSTA'
    const cargo:string = 'COORDENADOR DE OPERACOES - INTERINO'

    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getQuartilVenda(mes, canal, nome_logado);
    }

    else{
      if(cargo === 'COORDENADOR DE OPERACOES' || cargo==='COORDENADOR DE OPERACOES - INTERINO'){
        return await this.coordenadorService.getQuartilVenda(mes, canal,supervisor,nome_logado);
      }
      return await this.geralService.getQuartilVenda(mes, canal,supervisor);

    }

  }

  // Método auxiliar para verificar se o usuário é coordenador
  private isCoordenador(funcaoLogada: string, autorizadas: string[]): boolean {
    return autorizadas.includes(funcaoLogada);
  }
}