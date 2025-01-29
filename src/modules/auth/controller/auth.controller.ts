import { HttpService } from "@nestjs/axios";
import { Body, Controller, Get, Post, Req, UseGuards } from "@nestjs/common";
import { firstValueFrom } from "rxjs";
import { AuthGuard } from "../services/auth.guard";

//Tipagem da requisição de login
export interface LoginDto{
    site:string
    login:string
    senha:string
}

//Rota para autenticação
@Controller('auth')
export default class AuthController{

    constructor(private httpService:HttpService){}

    //retorna o token para futuras requisições
    //token recuperado do mitra
    @Post()
    async login(@Body() data : LoginDto){
        try {
            const url:string = 'https://mitra.tel.inf.br/services/auth_ldap/authLdap';
            console.log(data)
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
        return await request.user
    }

}