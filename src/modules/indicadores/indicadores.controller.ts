import { Controller, Get, Inject, Param, Req, UseGuards } from "@nestjs/common";
import { DatabaseService } from "src/config/config.bd";
import { AuthGuard } from "../auth/services/auth.guard";
import { IndicadoresSupervisorService } from "./indicadores.supervisor.service";
import { CoordenadorService } from "./indicadores.coordenador.service";
import { OperadorService } from "../operador/operador.service";


@UseGuards(AuthGuard)
@Controller('api/indicadores')
export class IndicadoresController {
  constructor(@Inject() private databaseService: DatabaseService, 
  @Inject() private indicadoresSupervisorService: IndicadoresSupervisorService,
  @Inject() private coordenadorService:CoordenadorService,
  ) { }

  private autorizados = [
    'COORDENADOR MIS SR',
    'COORDENADOR DE QUALIDADE E PROCESSOS',
    'COORDENADOR DE QUALIDADE',
    'COORDENADOR DE QUALIDADE SR',
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



  @Get('table/:mes/:canal')
  async getTable(@Param('mes') mes: string, @Param('canal') canal: string, @Req() req: any) {
    const cargo = req.user.dados.FUNCAO
    const nome_logado = req.user.dados.NOME
    // const nome_logado = 'LUIS CAVALCANTE COSTA

    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getTable(mes, canal, nome_logado)
    }
    else {
      return await this.coordenadorService.getTable(mes, canal)
    }
  }

  @Get('/:mes/:canal')
  async getIndicadoresEquipe(@Param('mes') mes: string, @Param('canal') canal: string, @Req() req: any) {

    const cargo = req.user.dados.FUNCAO
    const nome_logado = req.user.dados.NOME
    // const nome_logado = 'LUIS CAVALCANTE COSTA

    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getIndicadoresEquipe(mes, canal, nome_logado)
    }
    else {
      return await this.coordenadorService.getIndicadoresEquipe(mes, canal)
    }

  }

  @Get('/quartil-tma/:mes/:canal')
  async getQuartilTma(@Param('mes') mes: string, @Param('canal') canal: string, @Req() req: any) {

    const nome_logado = req.user.dados.NOME
    const cargo = req.user.dados.FUNCAO;

    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getQuartilTma(mes, canal, nome_logado);
    }
    else{
      return await this.coordenadorService.getQuartilTma(mes, canal);
    }
  }

  @Get('/quartil-csat/:mes/:canal')
  async getQuartilCsat(@Param('mes') mes: string, @Param('canal') canal: string, @Req() req: any) {
    const nome_logado = req.user.dados.NOME
    const cargo = req.user.dados.FUNCAO;

    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getQuartilCsat(mes, canal, nome_logado);
    }
    else{
      return await this.coordenadorService.getQuartilCsat(mes, canal);

    }
  }

  @Get('/quartil-monitoria/:mes/:canal')
  async quartilNotaQualidade(@Param('mes') mes: string, @Param('canal') canal: string, @Req() req: any) {
    const nome_logado = req.user.dados.NOME
    const cargo = req.user.dados.FUNCAO;

    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getQuartilNotaQualide(mes, canal, nome_logado);
    }
    else{
      return await this.coordenadorService.getQuartilNotaQualide(mes, canal);

    }

  }

  @Get('/quartil-monitoria-vendas/:mes/:canal')
  async quartilMoitoriaVendas(@Param('mes') mes: string, @Param('canal') canal: string, @Req() req: any) {
    const nome_logado = req.user.dados.NOME
    const cargo = req.user.dados.FUNCAO;

    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getQuartilNotaVenda(mes, canal, nome_logado);
    }
    else{
      return await this.coordenadorService.getQuartilNotaVenda(mes, canal);

    }

  }

  @Get('/quartil-vendas/:mes/:canal')
  async quartilVendas(@Param('mes') mes: string, @Param('canal') canal: string, @Req() req: any) {
    const nome_logado = req.user.dados.NOME
    // const nome_logado = 'LUIS CAVALCANTE COSTA'
    const cargo = req.user.dados.FUNCAO;

    if (!this.isCoordenador(cargo, this.autorizados)) {
      return await this.indicadoresSupervisorService.getQuartilVenda(mes, canal, nome_logado);
    }

    else{
      return await this.coordenadorService.getQuartilVenda(mes, canal);
    }

  }

  // Método auxiliar para verificar se o usuário é coordenador
  private isCoordenador(funcaoLogada: string, autorizadas: string[]): boolean {
    return autorizadas.includes(funcaoLogada);
  }
}