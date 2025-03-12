import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, Inject, Post, Req, UseGuards } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { AuthGuard } from "../services/auth.guard";
import { DatabaseService } from "src/config/config.bd";

//Tipagem da requisição de login
export interface LoginDto{
    site:string
    login:string
    senha:string
}

//Rota para autenticação
@Controller('auth')
export default class AuthController{

    constructor(private httpService:HttpService,@Inject() private databaseService: DatabaseService){}

    //retorna o token para futuras requisições
    //token recuperado do mitra
    @Post()
    async login(@Body() data : LoginDto){
        try {
            const url:string = 'https://mitra.tel.inf.br/services/auth_ldap/authLdap';
            const response = await firstValueFrom( this.httpService.post(url,data))
            return {Bearer: response.data.token}
        } catch (error) {
            console.error('Erro ao fazer a requisição HTTP:', error);
            throw error
        }
    }

    @UseGuards(AuthGuard)
    @Get('token')
    async getToken(@Req() request: any){
        const nome_logado = request.user.dados.NOME
        const cargo = request.user.dados.FUNCAO
        const pagina_acessada = request.headers.referer; // Captura a URL acessada
gir ad
        const query = `INSERT INTO MERCANTIL.dbo.ACESSOS (
          nome_logado, cargo, pagina_acessada) VALUES('${nome_logado}', '${cargo}','${pagina_acessada}')`

        await this.databaseService.query(query)

        return await request.user
    }

}