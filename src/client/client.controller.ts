import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller('mapa')
export class ClientController {
  @Get(':page')
  async servePage(@Res() res: Response, @Param('page') page: string) {
    // Caminho para o diretório específico do cliente
    const clientPath = join(__dirname,'..','..', 'src', 'client', page);

    
    // Se a pasta existir, serve o index.html dessa pasta
    try {
      return res.sendFile(join(clientPath, 'index.html'));
    } catch (error) {
      return res.status(404).send('Página não encontrada');
    }
  }
}
