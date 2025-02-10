import { Controller, Get, Param, Res } from '@nestjs/common';
import { Response } from 'express';
import { join } from 'path';

@Controller()
export class ClientController {
  @Get(':page')
  async servePage(@Res() res: Response, @Param('page') page: string) {
    const clientPath = join(__dirname, '..', '..', 'src', 'client', page, 'index.html');

    return res.sendFile(clientPath, (err) => {
      if (err) {
        if(err)
        return res.sendFile(join(__dirname, '..', '..', 'src', 'client', 'error', '404.html'));
      }
    });
  }

  @Get()
  async servePageLogin(@Res() res: Response) {
    const clientPath = join(__dirname, '..', '..', 'src', 'client', 'login', 'index.html');

    return res.sendFile(clientPath, (err) => {
      if (err) {
        return res.sendFile(join(__dirname, '..', '..', 'src', 'client', 'error', '404.html'));
      }
    });
  }
}
