import { Controller, Get, Inject, Req, UseGuards } from "@nestjs/common";
import { AuthGuard } from "./auth/services/auth.guard";
import { DatabaseService } from "src/config/config.bd";

@UseGuards(AuthGuard)
@Controller('dashboard')
export class AppController {
  constructor(@Inject() private databaseService: DatabaseService) {}

  private coordenadores = ['teste'];


  @Get('table')
  async getOperadores(@Req() req: any) {

    const login_auth = req.user.dados.LOGIN;

    if (this.isCoordenador(login_auth, this.coordenadores)) {
      const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT`;
      const operadores: any[] = await this.databaseService.query(query);
      return operadores; // Retorna os operadores encontrados na tabela

    } else {
      const nome_supervisor = req.user.dados.NOME
      const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT WHERE supervisor = 'LUIS CAVALCANTE COSTA'`;
      const operadores = await this.databaseService.query(query);
      return operadores; // Retorna os operadores encontrados na tabela
    }
  }
  @Get('indicadores-geral')
  async getIndicadoresGeral(@Req() req: any) {

    const login_auth = req.user.dados.LOGIN;

    if (this.isCoordenador(login_auth, this.coordenadores)) {
      const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT`;
      const operadores: any[] = await this.databaseService.query(query);
      const tma = await this.mediaTma(operadores, 'tma')
      const csat = await this.mediaIndicadores(operadores, 'csat')
      const notaQualidade = await this.mediaIndicadores(operadores, 'nota_qualidade')
      const notaVenda = await this.mediaIndicadores(operadores, 'nota_venda')
      const somaVendas = await this.somaVendas(operadores, 'qtd_vendas')
      return {data: {csat, tma, notaQualidade, notaVenda,somaVendas}}

    } else {
      const nome_supervisor = req.user.dados.NOME
      const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT WHERE supervisor = 'LUIS CAVALCANTE COSTA'`;
      const operadores = await this.databaseService.query(query);
      const tma = await this.mediaTma(operadores, 'tma')
      const csat = await this.mediaIndicadores(operadores, 'csat')
      const notaQualidade = await this.mediaIndicadores(operadores, 'nota_qualidade')
      const notaVenda = await this.mediaIndicadores(operadores, 'nota_venda')
      const somaVendas = await this.somaVendas(operadores, 'qtd_vendas')
      return {data: {csat, tma, notaQualidade, notaVenda,somaVendas}}    }
  }

  @Get('/quartil-tma')
  async getQuartilTma(@Req() req: any) {
    const nome_logado = req.user.dados.LOGIN;

    if (this.isCoordenador(nome_logado, this.coordenadores)) {
      const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT ORDER BY tma ASC`;
      const operadores = await this.databaseService.query(query);
      const quartil = await this.dividirEmQuartis(operadores, 'tma');
      return quartil
    } else {
        const nome_supervisor = req.user.dados.NOME
        const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT WHERE supervisor = 'LUIS CAVALCANTE COSTA'`;
        const operadores = await this.databaseService.query(query);
        const quartil = await this.dividirEmQuartis(operadores, 'tma');
        return quartil
    }
  }
  @Get('/quartil-csat')
  async getQuartilCsat(@Req() req: any) {
    const nome_logado = req.user.dados.LOGIN;

    if (this.isCoordenador(nome_logado, this.coordenadores)) {
      const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT ORDER BY tma ASC`;
      const operadores = await this.databaseService.query(query);
      const quartil = await this.dividirEmQuartis(operadores, 'csat');
      return quartil
    } else {
        const nome_supervisor = req.user.dados.NOME
        const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT WHERE supervisor = 'LUIS CAVALCANTE COSTA'`;
        const operadores = await this.databaseService.query(query);
        const quartil = await this.dividirEmQuartis(operadores, 'csat');
        return quartil
    }
  }
  @Get('/quartil-monitoria')
  async quartilNotaQualidade(@Req() req: any) {
    const nome_logado = req.user.dados.LOGIN;

    if (this.isCoordenador(nome_logado, this.coordenadores)) {
      const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT ORDER BY tma ASC`;
      const operadores = await this.databaseService.query(query);
      const quartil = await this.dividirEmQuartis(operadores, 'nota_qualidade');
      return quartil
    } else {
        const nome_supervisor = req.user.dados.NOME
        const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT WHERE supervisor = 'LUIS CAVALCANTE COSTA'`;
        const operadores = await this.databaseService.query(query);
        const quartil = await this.dividirEmQuartis(operadores, 'nota_qualidade');
        return quartil
    }
  }
  @Get('/quartil-monitoria-vendas')
  async quartilMoitoriaVendas(@Req() req: any) {
    const nome_logado = req.user.dados.LOGIN;

    if (this.isCoordenador(nome_logado, this.coordenadores)) {
      const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT ORDER BY tma ASC`;
      const operadores = await this.databaseService.query(query);
      const quartil = await this.dividirEmQuartis(operadores, 'nota_venda');
      return quartil
    } else {
        const nome_supervisor = req.user.dados.NOME
        const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT WHERE supervisor = 'LUIS CAVALCANTE COSTA'`;
        const operadores = await this.databaseService.query(query);
        const quartil = await this.dividirEmQuartis(operadores, 'nota_venda');
        return quartil
    }
  }
  @Get('/quartil-vendas')
  async quartilVendas(@Req() req: any) {
    const nome_logado = req.user.dados.LOGIN;

    if (this.isCoordenador(nome_logado, this.coordenadores)) {
      const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT ORDER BY tma ASC`;
      const operadores = await this.databaseService.query(query);
      const quartil = await this.dividirEmQuartis(operadores, 'qtd_vendas');
      return quartil
    } else {
        const nome_supervisor = req.user.dados.NOME
        const query = `SELECT * FROM TESTES.dbo.MAPA_GESTAO_CHAT WHERE supervisor = 'LUIS CAVALCANTE COSTA'`;
        const operadores = await this.databaseService.query(query);
        const quartil = await this.dividirEmQuartis(operadores, 'qtd_vendas');
        return quartil
    }
  }


  async dividirEmQuartis(operadores: any[], atributo: string): Promise<any> {
    // Ordena os operadores com base no atributo passado, do maior para o menor
    const operadoresOrdenados = [...operadores].sort((a, b) => b[atributo] - a[atributo]);
  
    const totalOperadores = operadoresOrdenados.length;
    const baseTamanho = Math.floor(totalOperadores / 4); // Tamanho base para cada quartil
    const sobra = totalOperadores % 4; // Elementos que não se dividem igualmente
  
    // Inicializando os quartis
    const quartis: any[][] = [];
    let inicio = 0;
  
    // Distribuir os operadores pelos quartis, adicionando 1 operador extra nos ultimos "sobra" quartis
    for (let i = 0; i < 4; i++) {
      const tamanhoAtual = baseTamanho + (i >= (4-sobra) ? 1 : 0);
      quartis.push(operadoresOrdenados.slice(inicio, inicio + tamanhoAtual));
      inicio += tamanhoAtual;
    }
  
    const primeiro_quartil = quartis[0];
    const segundo_quartil = quartis[1];
    const terceiro_quartil = quartis[2];
    const quarto_quartil = quartis[3];
  
    if (atributo === 'qtd_vendas') {
      const obj = {
        primeiro: await this.somaVendas(primeiro_quartil, atributo),
        segundo: await this.somaVendas(segundo_quartil, atributo),
        terceiro:  await this.somaVendas(terceiro_quartil, atributo),
        quarto: await this.somaVendas(quarto_quartil, atributo),
      };
      return obj;
    }
    else if( atributo === 'tma'){
        const obj = {
            primeiro: await this.mediaTma(primeiro_quartil, atributo),
            segundo: await this.mediaTma(segundo_quartil, atributo),
            terceiro: await this.mediaTma(terceiro_quartil, atributo),
            quarto:  await this.mediaTma(quarto_quartil, atributo),
          };
          return obj;
    }
    else{
        const obj = {
            primeiro: await this.mediaIndicadores(primeiro_quartil, atributo),
            segundo:  await this.mediaIndicadores(segundo_quartil, atributo),
            terceiro: await this.mediaIndicadores(terceiro_quartil, atributo),
            quarto: await this.mediaIndicadores(quarto_quartil, atributo),
          };
          return obj;
    }

  }
  
  async mediaIndicadores(quartil: any[], atributo: string): Promise<{ media: number }> {

    
    // Verifica se 'quartil' é um array
    if (!Array.isArray(quartil)) {
      throw new Error("O quartil não é um array.");
    }
  
    // Calcula a soma de todos os valores do atributo no quartil
    const soma = quartil.reduce((acc, operador) => acc + (operador[atributo] || 0), 0);
  
    // Calcula a média
    const media = quartil.length > 0 ? soma / quartil.length : 0;
  
    // Retorna a média do atributo no quartil
    return { media: parseFloat(media.toFixed(2)) }; // Formata a média para 2 casas decimais
  }
  async mediaTma(quartil: any[], atributo: string): Promise<{ media: string }> {    
    // Verifica se 'quartil' é um array
    if (!Array.isArray(quartil)) {
      throw new Error("O quartil não é um array.");
    }
  
    // Função para converter tempo 'hh:mm:ss' para segundos
    const timeToSeconds = (time: string): number => {
      const [hours, minutes, seconds] = time.split(':').map(Number);
      console.log(hours, minutes, seconds)
      return hours * 3600 + minutes * 60 + seconds;
    };
  
    // Função para converter segundos de volta para 'hh:mm:ss'
    const secondsToTime = (seconds: number): string => {
      const hours = Math.floor(seconds / 3600);
      const minutes = Math.floor((seconds % 3600) / 60);
      const secs = seconds % 60;
  
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
  
    // Filtra os itens válidos (não nulos ou vazios)
    const validTimes = quartil.filter(operador => operador[atributo]);
  
    // Calcula a soma de todos os tempos em segundos
    const somaSegundos = validTimes.reduce((acc, operador) => acc + timeToSeconds(operador[atributo]), 0);

    // Calcula a média dos tempos em segundos
    const mediaSegundos = validTimes.length > 0
      ? somaSegundos / validTimes.length
      : 0;
  
    // Converte a média de segundos para o formato 'hh:mm:ss'
    const mediaFormatada = secondsToTime(mediaSegundos);
  
    // Retorna a média do atributo no formato 'hh:mm:ss'
    return { media: mediaFormatada.split('.')[0] };
  }
  
  async somaVendas(quartil: any[], atributo: string): Promise<{ soma: number }> {
    
    // Verifica se 'quartil' é um array e contém objetos com o atributo esperado
    if (!Array.isArray(quartil)) {
      throw new Error("O quartil não é um array.");
    }
  
    // Calcula a soma de todos os valores do atributo no quartil
    const soma = quartil.reduce((acc, operador) => acc + (operador[atributo] || 0), 0);
  
    // Retorna a soma do atributo no quartil
    return { soma };
  }
  
  
  
  // Método auxiliar para verificar se o usuário é coordenador
  private isCoordenador(nome_logado: string, coordenadores: string[]): boolean {
    return coordenadores.includes(nome_logado);
  }
}