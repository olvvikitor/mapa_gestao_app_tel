import { Controller, Get, Inject, Param, Query, Req, UseGuards } from "@nestjs/common";
import { OperadorService } from "./operador.service";
import { AuthGuard } from "../auth/services/auth.guard";
import { query } from "express";

@UseGuards(AuthGuard)
@Controller('api/operadores')
export class OperadorController {
    constructor(private operadorService: OperadorService) {
    }
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

    @Get()
    async getNameOperador(@Req() req: any) {

        const nome_logado = req.user.dados.NOME;
        const cargo = req.user.dados.FUNCAO

        if (!this.isCoordenador(cargo, this.autorizados)) {
            return await this.operadorService.getNameOperadorBySupervisor(nome_logado)
        }

        else{
            return await this.operadorService.getAllNameOperador()
        }
        
    }
    @Get('supervisores/')
    async getNameSupervisor(@Req() req: any, @Query('canal') canal:string, @Query('mes') mes:string, @Query('equipe') equipe:string) {
        return await this.operadorService.getAllNameSupervisor(canal, mes)
    }

    // Método auxiliar para verificar se o usuário é coordenador
    private isCoordenador(funcaoLogada: string, autorizadas: string[]): boolean {
        return autorizadas.includes(funcaoLogada);
    }
}