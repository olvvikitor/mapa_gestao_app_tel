import { Inject, Injectable } from "@nestjs/common";
import { retry } from "rxjs";
import { DatabaseService } from "src/config/config.bd";
import * as ExcelJS from 'exceljs'

export interface Indicadores {
    csat: any,
    tma: any,
    notaQualidade: any,
    notaVenda: any,
    somaVendas: any
}


@Injectable()
export class CoordenadorService {
    constructor(@Inject() private databaseService: DatabaseService) { }


    async getTable(mes: string, canal: string, supervisor: string, classificacao: string, coordenador:string): Promise<any[]> {
        const nomeAjustado = coordenador.split(' ')

        if (canal === 'CHAT') {
            let query: string;

            if (supervisor === '' || supervisor === `null` || supervisor === `undefined` || supervisor === `GERAL`) {
                query = `SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}'
                `;
            }

            else {
                query = `SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE mes = '${mes}' AND supervisor = '${supervisor}'`;
            }
            const operadores: any[] = await this.databaseService.query(query);
            return await this.dividirEmQuartisTabela(operadores, classificacao)
        }
        else {
            let query: string
            if (supervisor === '' || supervisor === `null` || supervisor === `undefined` || supervisor === `GERAL`) {
                query = `SELECT * FROM dbo.MAPA_GESTAO_VOZ  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}'`;
            }
            else {
                query = `SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE mes = '${mes}' AND supervisor = '${supervisor}' `;
            }
            const operadores: any[] = await this.databaseService.query(query);
            return await this.dividirEmQuartisTabela(operadores, classificacao)
        }
    }

    async getTableSupervisoresQuartil(mes: string, canal: string, classificacao: string,coordenador:string) {
        const nomeAjustado = coordenador.split(' ')

        let query: string;
    
        // Definir a tabela correta com base no canal
        const tabela = canal === 'CHAT' ? 'dbo.MAPA_GESTAO_CHAT' : 'dbo.MAPA_GESTAO_VOZ';
    
        if (classificacao === 'tma') {
            // Consulta para TMA (converter HH:MM:SS para segundos e calcular a média)
            query = `
                SELECT 
                    supervisor, 
                    -- Converter a média de segundos para HH:MM:SS
                    CONVERT(VARCHAR, DATEADD(SECOND, AVG(
                        CAST(SUBSTRING(${classificacao}, 1, 2) AS INT) * 3600 +  -- Horas para segundos
                        CAST(SUBSTRING(${classificacao}, 4, 2) AS INT) * 60 +    -- Minutos para segundos
                        CAST(SUBSTRING(${classificacao}, 7, 2) AS INT)           -- Segundos
                    ), 0), 108) AS media_${classificacao}
                FROM 
                    ${tabela}
                 WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}'
                    AND ${classificacao} IS NOT NULL  -- Ignorar valores NULL

                GROUP BY 
                    supervisor
                ORDER BY 
                    media_${classificacao} ASC;
            `;
        } else if (classificacao === 'qtd_vendas') {
            // Consulta para quantidade de vendas (somar)
            query = `
                SELECT 
                    supervisor, 
                    SUM(${classificacao}) AS media_${classificacao}
                FROM 
                    ${tabela}
                WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}'
                GROUP BY 
                    supervisor
                ORDER BY 
                    media_${classificacao} DESC;
            `;
        } else {
            // Consulta para outras classificações (calcular média)
            query = `
                SELECT 
                    supervisor, 
                    AVG(${classificacao}) AS media_${classificacao}
                FROM 
                    ${tabela}
                 WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}'
                GROUP BY 
                    supervisor
                ORDER BY 
                    media_${classificacao} DESC;
            `;
        }
    
        // Executar a consulta
        const operadores: any[] = await this.databaseService.query(query);
    
        // Dividir os operadores em quartis
        return await this.dividirEmQuartisTabela(operadores, classificacao);
    }

    async dividirEmQuartisTabela(operadores: any[], atributo: string): Promise<any> {
        let operadoresOrdenados;

        // Função para converter o formato "hh:mm:ss" para o número total de segundos
        const tempoParaSegundos = (tempo: string) => {
            const [horas, minutos, segundos] = tempo.split(':').map(Number);
            return horas * 3600 + minutos * 60 + segundos;
        };
    
        operadoresOrdenados = [...operadores].sort((a, b) => {
            const valorA = a[atributo] === null || a[atributo] === undefined 
                ? Number.MAX_SAFE_INTEGER // Garante que null fique no final
                : (typeof a[atributo] === 'string' ? tempoParaSegundos(a[atributo]) : a[atributo]);
        
            const valorB = b[atributo] === null || b[atributo] === undefined 
                ? Number.MAX_SAFE_INTEGER 
                : (typeof b[atributo] === 'string' ? tempoParaSegundos(b[atributo]) : b[atributo]);
        
            // Se um deles for null, garante que ele fique no final
            if (a[atributo] === null && b[atributo] !== null) return 1;
            if (a[atributo] !== null && b[atributo] === null) return -1;
        
            if (atributo === 'tma') {
                return valorA - valorB; // Ordem crescente para tma
            } else {
                return valorB - valorA; // Ordem decrescente para outros atributos
            }
        });
        

    

        const totalOperadores = operadoresOrdenados.length;
        const baseTamanho = Math.floor(totalOperadores / 4); // Tamanho base para cada quartil
        const sobra = totalOperadores % 4; // Elementos que não se dividem igualmente

        // Inicializando os quartis
        const quartis: any[][] = [];
        let inicio = 0;

        // Distribuir os operadores pelos quartis, adicionando 1 operador extra nos ultimos "sobra" quartis
        for (let i = 0; i < 4; i++) {
            const tamanhoAtual = baseTamanho + (i >= (4 - sobra) ? 1 : 0);
            quartis.push(operadoresOrdenados.slice(inicio, inicio + tamanhoAtual));
            inicio += tamanhoAtual;
        }
        return quartis
    }

    async getIndicadoresEquipe(mes: string, canal: string, supervisor: string | undefined,coordenador:string): Promise<Indicadores> {
        const nomeAjustado = coordenador.split(' ')

        if (canal === 'CHAT') {
            if (supervisor === 'GERAL' || supervisor === 'undefined' || supervisor === undefined || supervisor === '') {
                const operadores = await this.databaseService.query(`
                    SELECT * FROM dbo.MAPA_GESTAO_CHAT  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}'`)

                return await this.getIndicadoresGeral(operadores);
            }
            else {
                const operadores = await this.databaseService.query(`
                    SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE mes = '${mes}'
                    AND supervisor = '${supervisor}'`)

                return await this.getIndicadoresGeral(operadores);
            }
        }
        else {
            if (supervisor === 'GERAL' || supervisor === 'undefined' || supervisor === undefined || supervisor === '') {
                const operadores = await this.databaseService.query(`
                    SELECT * FROM dbo.MAPA_GESTAO_VOZ  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}'`)
                return await this.getIndicadoresGeral(operadores);
            }
            else {
                const operadores = await this.databaseService.query(`
                SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE mes = '${mes}'
                AND supervisor = '${supervisor}'`)
                return await this.getIndicadoresGeral(operadores);
            }
        }
    }
    async getQuartilTma(mes: string, canal: string, supervisor: string | undefined,coordenador:string): Promise<any> {
        const nomeAjustado = coordenador.split(' ')

        //Se ele for do segmento chat
        if (canal === 'CHAT') {

            //se ele quiser ver o resultado geral
            if (supervisor === 'GERAL' || supervisor === 'undefined' || supervisor === undefined || supervisor === '') {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_CHAT  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}' ORDER BY tma ASC`)
                const quartil = await this.dividirEmQuartis(operadores, 'tma')
                return quartil
            }

            //se ele quiser ver o resultado por supervisor
            else {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE mes = '${mes}' AND supervisor = '${supervisor}' ORDER BY tma ASC`)
                const quartil = await this.dividirEmQuartis(operadores, 'tma')
                return quartil
            }
        }

        //se for do segumento Voz
        else {

            //se ele quiser ver o resultado geral
            if (supervisor === 'GERAL' || supervisor === 'undefined' || supervisor === undefined || supervisor === '') {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_VOZ  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}' ORDER BY tma ASC`)
                return await this.dividirEmQuartis(operadores, 'tma')
            }

            //se ele quiser ver o resultado por supervisor
            else {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE mes = '${mes}' ORDER BY tma ASC`)
                return await this.dividirEmQuartis(operadores, 'tma')
            }
        }
    }
    async getQuartilCsat(mes: string, canal: string, supervisor: string | undefined,coordenador:string): Promise<any> {
        const nomeAjustado = coordenador.split(' ')

        if (canal === 'CHAT') {
            if (supervisor === 'GERAL' || supervisor === 'undefined' || supervisor === undefined || supervisor === '') {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_CHAT  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}' ORDER BY csat ASC`)
                return await this.dividirEmQuartis(operadores, 'csat')
            }
            else {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE mes = '${mes}' AND supervisor = '${supervisor}' ORDER BY csat ASC`)
                return await this.dividirEmQuartis(operadores, 'csat')
            }

        }
        else {
            if (supervisor === 'GERAL' || supervisor === 'undefined' || supervisor === undefined || supervisor === '') {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_VOZ  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}' ORDER BY csat ASC`)
                return await this.dividirEmQuartis(operadores, 'csat')
            }
            const operadores =
                await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE mes = '${mes}' AND supervisor = '${supervisor}' ORDER BY csat ASC`)
            return await this.dividirEmQuartis(operadores, 'csat')
        }
    }
    async getQuartilNotaQualide(mes: string, canal: string, supervisor: string | undefined,coordenador:string): Promise<any> {
        const nomeAjustado = coordenador.split(' ')

        if (canal === 'CHAT') {
            if (supervisor === 'GERAL' || supervisor === 'undefined' || supervisor === undefined || supervisor === '') {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_CHAT  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}'  ORDER BY nota_qualidade ASC`)
                return await this.dividirEmQuartis(operadores, 'nota_qualidade')
            }
            else {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE mes = '${mes}' AND supervisor = '${supervisor}' ORDER BY nota_qualidade ASC`)
                return await this.dividirEmQuartis(operadores, 'nota_qualidade')
            }

        }
        else {
            if (supervisor === 'GERAL' || supervisor === 'undefined' || supervisor === undefined || supervisor === '') {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_VOZ  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}'  ORDER BY nota_qualidade ASC`)
                return await this.dividirEmQuartis(operadores, 'nota_qualidade')
            }
            const operadores =
                await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE mes = '${mes}' AND supervisor = '${supervisor}' ORDER BY nota_qualidade ASC`)
            return await this.dividirEmQuartis(operadores, 'nota_qualidade')
        }
    }
    async getQuartilNotaVenda(mes: string, canal: string, supervisor: string | undefined,coordenador:string): Promise<any> {
        const nomeAjustado = coordenador.split(' ')

        if (canal === 'CHAT') {
            if (supervisor === 'GERAL' || supervisor === 'undefined' || supervisor === undefined || supervisor === '') {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_CHAT  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}'  ORDER BY nota_venda ASC`)
                return await this.dividirEmQuartis(operadores, 'nota_venda')
            }
            else {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE mes = '${mes}' AND supervisor = '${supervisor}' ORDER BY nota_venda ASC`)
                return await this.dividirEmQuartis(operadores, 'nota_venda')
            }

        }
        else {
            if (supervisor === 'GERAL' || supervisor === 'undefined' || supervisor === undefined || supervisor === '') {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_VOZ  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}'  ORDER BY nota_venda ASC`)
                return await this.dividirEmQuartis(operadores, 'nota_venda')
            }
            const operadores =
                await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE mes = '${mes}' AND supervisor = '${supervisor}' ORDER BY nota_venda ASC`)
            return await this.dividirEmQuartis(operadores, 'nota_venda')
        }
    }
    async getQuartilVenda(mes: string, canal: string, supervisor: string | undefined,coordenador:string): Promise<any> {
              const nomeAjustado = coordenador.split(' ')
        if (canal === 'CHAT') {
            if (supervisor === 'GERAL' || supervisor === 'undefined' || supervisor === undefined || supervisor === '') {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_CHAT  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}' ORDER BY qtd_vendas ASC`)
                return await this.dividirEmQuartis(operadores, 'qtd_vendas')
            }
            else {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE mes = '${mes}' AND supervisor = '${supervisor}' ORDER BY qtd_vendas ASC`)
                return await this.dividirEmQuartis(operadores, 'qtd_vendas')
            }

        }
        else {
            if (supervisor === 'GERAL' || supervisor === 'undefined' || supervisor === undefined || supervisor === '') {
                const operadores =
                    await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_VOZ  WHERE mes = '${mes}' 
                AND coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[1]}'
                OR coordenador LIKE '${nomeAjustado[0]+' '+ nomeAjustado[nomeAjustado.length - 1]}'  ORDER BY qtd_vendas ASC`)
                return await this.dividirEmQuartis(operadores, 'qtd_vendas')
            }
            const operadores =
                await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE mes = '${mes}' AND supervisor = '${supervisor}' ORDER BY qtd_vendas ASC`)
            return await this.dividirEmQuartis(operadores, 'qtd_vendas')
        }
    }


    async getIndicadoresGeral(operadores: any[]): Promise<Indicadores> {
        const tma = await this.mediaTma(operadores, 'tma')
        const csat = await this.mediaIndicadores(operadores, 'csat')
        const notaQualidade = await this.mediaIndicadores(operadores, 'nota_qualidade')
        const notaVenda = await this.mediaIndicadores(operadores, 'nota_venda')
        const somaVendas = await this.somaVendas(operadores, 'qtd_vendas')

        const indicadores: Indicadores = {
            csat,
            tma,
            notaQualidade,
            notaVenda,
            somaVendas
        }
        return indicadores
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
            const tamanhoAtual = baseTamanho + (i >= (4 - sobra) ? 1 : 0);
            quartis.push(operadoresOrdenados.slice(inicio, inicio + tamanhoAtual));
            inicio += tamanhoAtual;
        }

        const primeiro_quartil = quartis[0];
        const segundo_quartil = quartis[1];
        const terceiro_quartil = quartis[2];
        const quarto_quartil = quartis[3];

        if (atributo === 'qtd_vendas') {
            const obj = {
                primeiro: { soma: await this.somaVendas(primeiro_quartil, atributo), operadores: primeiro_quartil },
                segundo: { soma: await this.somaVendas(segundo_quartil, atributo), operadores: segundo_quartil },
                terceiro: { soma: await this.somaVendas(terceiro_quartil, atributo), operadores: terceiro_quartil },
                quarto: { soma: await this.somaVendas(quarto_quartil, atributo), operadores: quarto_quartil },
            };
            return obj;
        }
        else if (atributo === 'tma') {
            const obj = {
                primeiro: await this.mediaTma(primeiro_quartil, atributo),
                segundo: await this.mediaTma(segundo_quartil, atributo),
                terceiro: await this.mediaTma(terceiro_quartil, atributo),
                quarto: await this.mediaTma(quarto_quartil, atributo),
            };
            return obj;
        }
        else {
            const obj = {
                primeiro: await this.mediaIndicadores(primeiro_quartil, atributo),
                segundo: await this.mediaIndicadores(segundo_quartil, atributo),
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

        const soma = quartil.reduce((acc, operador) => {
            const valor = parseFloat(operador[atributo]);
            return !isNaN(valor) && valor !== null ? acc + valor : acc;
        }, 0);

        const count = quartil.filter(operador => {
            const valor = parseFloat(operador[atributo]);
            return !isNaN(valor) && valor !== null;
        }).length;

        const media = count > 0 ? soma / count : 0;


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
        return soma;
    }
}
