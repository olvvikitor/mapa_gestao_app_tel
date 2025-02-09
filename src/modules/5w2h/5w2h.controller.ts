import { BadRequestException, Body, Controller, Get, Param, Post, Put, Req } from '@nestjs/common';
import { CreateAcaoDto } from './5w2h.dto';
import { AcaoService } from './5w2h.service';

@Controller('5w2h')
export class AcaoController{

  constructor (private acaoService: AcaoService) {
    
  }

  @Post('create')
  async create(@Body() data: CreateAcaoDto, @Req() req:any){
    // const nome_logado = req.user.dados.NOME
    console.log(data)
    const nome_logado = 'JOAO'
    await this.acaoService.createAcao(data, nome_logado)
  }
  @Get('getAll')
  async getAll(@Req() req: any){
    // const nome_logado = req.user.dados.NOME
    const nome_logado = 'JOAO'
    return await this.acaoService.getAll(nome_logado)
  }
  @Put('update/:id')
  async updateStatusAcao(@Param('id') id:string, @Body() data : {status: string}){
    const id_parsed = parseInt(id)

    await this.acaoService.update(id_parsed, data.status)
  }
}