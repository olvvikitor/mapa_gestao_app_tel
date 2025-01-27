import { Controller, Get, Inject, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "./auth/services/auth.guard";
import { DatabaseService } from "src/config/config.bd";

@UseGuards(AuthGuard)
@Controller('dashboard')
export class AppController{
    constructor(@Inject() private databaseService:DatabaseService){}

    @Get()
    async getOperadores(@Req() req: any){
        const supervisor = req.user.dados.SUPERVISOR
        const query = `SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE supervisor = 'LUIS CAVALCANTE COSTA'`;
        const operadores = await this.databaseService.query(query);
        return operadores; // Retorna os operadores encontrados na tabela
    }
}