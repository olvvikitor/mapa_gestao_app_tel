import { Inject, Injectable } from "@nestjs/common";
import { DatabaseService } from "src/config/config.bd";

export interface Indicadores {
    csat: any,
    tma: any,
    notaQualidade: any,
    notaVenda: any,
    somaVendas: any
}


@Injectable()
export class IndicadoresSupervisorService {
    constructor(@Inject() private databaseService: DatabaseService) { }

    async getTable(mes: string, canal: string, nome_supervisor: string, classificacao: string): Promise<any[]> {
        const produto = await this.getProduto(nome_supervisor, mes)
        const tabela = produto === 'CHAT' ? 'dbo.MAPA_GESTAO_CHAT' : 'dbo.MAPA_GESTAO_VOZ';
        let query: string;
        if (canal === 'equipe') {
            query = `
            SELECT *
            FROM dbo.MAPA_GESTAO_CHAT 
            WHERE mes = '${mes}' AND supervisor = '${nome_supervisor}'
    
            UNION 
    
            SELECT *
            FROM dbo.MAPA_GESTAO_VOZ 
            WHERE mes = '${mes}' AND supervisor = '${nome_supervisor}'
            
        `;
        }
        else {
            query = `
            SELECT *
            FROM ${tabela} 
            WHERE mes = '${mes}'
        `;
        }

        const operadores: any[] = await this.databaseService.query(query);
        return await this.dividirEmQuartisTabela(operadores, classificacao);
    }
    async getTableSupervisoresQuartil(mes: string, canal: string, classificacao: string, nome_supervisor:string) {
        let query: string;
        const produto = await this.getProduto(nome_supervisor, mes)
        const tabela = produto === 'CHAT' ? 'dbo.MAPA_GESTAO_CHAT' : 'dbo.MAPA_GESTAO_VOZ';
    
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
                WHERE 
                    mes = '${mes}'
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
                WHERE 
                    mes = '${mes}'
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
                WHERE 
                    mes = '${mes}'
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


    async getIndicadoresEquipe(mes: string, canal: string, nome_supervisor: string): Promise<Indicadores> {
        const produto = await this.getProduto(nome_supervisor, mes)
        const tabela = produto === 'CHAT' ? 'dbo.MAPA_GESTAO_CHAT' : 'dbo.MAPA_GESTAO_VOZ';
        let query: string;
        if (canal === 'equipe') {
            query = `
            SELECT * FROM dbo.MAPA_GESTAO_CHAT
            WHERE supervisor = '${nome_supervisor}' AND mes = '${mes}'
            
            UNION 
                
            SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE supervisor = '${nome_supervisor}' AND mes = '${mes}'`;
            const operadores = await this.databaseService.query(query)
            return await this.getIndicadoresGeral(operadores);
        }
        query = `
        SELECT * FROM ${tabela}
        WHERE mes = '${mes}'
        `;

        const operadores = await this.databaseService.query(query)
        return await this.getIndicadoresGeral(operadores);

    }
    async getQuartilTma(mes: string, canal: string, nome_supervisor: string): Promise<any> {
        const produto = await this.getProduto(nome_supervisor, mes)
        const tabela = produto === 'CHAT' ? 'dbo.MAPA_GESTAO_CHAT' : 'dbo.MAPA_GESTAO_VOZ';
        if (canal === 'equipe') {

            const query = `
            SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE supervisor = '${nome_supervisor}' AND mes = '${mes}' 
            UNION
            SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE supervisor = '${nome_supervisor}'
            AND mes = '${mes}'
            ORDER BY tma ASC`;

            const operadores = await this.databaseService.query(query)
            return await this.dividirEmQuartis(operadores, 'tma')
        }

        const query = `
                
                    SELECT * FROM ${tabela} WHERE  mes = '${mes}'
                    ORDER BY tma ASC`;

        const operadores = await this.databaseService.query(query)
        return await this.dividirEmQuartis(operadores, 'tma')
    }

    async getQuartilCsat(mes: string, canal: string, nome_supervisor: string): Promise<any> {
        const produto = await this.getProduto(nome_supervisor, mes)
        const tabela = produto === 'CHAT' ? 'dbo.MAPA_GESTAO_CHAT' : 'dbo.MAPA_GESTAO_VOZ';
        if (canal === 'equipe') {
            const operadores =
                await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE supervisor = '${nome_supervisor}' AND mes = '${mes}'  
                    UNION
                    SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE supervisor = '${nome_supervisor}' AND mes = '${mes}'  ORDER BY csat ASC`)

            return await this.dividirEmQuartis(operadores, 'csat')
        }
        const operadores =
            await this.databaseService.query(` SELECT * FROM ${tabela} WHERE  mes = '${mes}'
                    ORDER BY csat ASC`)

        return await this.dividirEmQuartis(operadores, 'csat')
    }


    async getQuartilNotaQualide(mes: string, canal: string, nome_supervisor: string): Promise<any> {
        const produto = await this.getProduto(nome_supervisor, mes)
        const tabela = produto === 'CHAT' ? 'dbo.MAPA_GESTAO_CHAT' : 'dbo.MAPA_GESTAO_VOZ';
        if (canal === 'equipe') {
            const operadores =
                await this.databaseService.query(`SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE supervisor = '${nome_supervisor}' AND mes = '${mes}'
                          
                          UNION 
                          SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE supervisor = '${nome_supervisor}' AND mes = '${mes}' 
                          ORDER BY nota_qualidade ASC`)
            return await this.dividirEmQuartis(operadores, 'nota_qualidade')
        }
        const operadores =
            await this.databaseService.query(` SELECT * FROM ${tabela} WHERE  mes = '${mes}'
                    ORDER BY nota_qualidade ASC`)
        return await this.dividirEmQuartis(operadores, 'nota_qualidade')

    }
    async getQuartilNotaVenda(mes: string, canal: string, nome_supervisor: string): Promise<any> {
        const produto = await this.getProduto(nome_supervisor, mes)
        const tabela = produto === 'CHAT' ? 'dbo.MAPA_GESTAO_CHAT' : 'dbo.MAPA_GESTAO_VOZ';
        if (canal === 'equipe') {
            const operadores =
                await this.databaseService.query(`
                        SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE supervisor = '${nome_supervisor}' AND mes = '${mes}' 
                         UNION
                         SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE supervisor = '${nome_supervisor}' AND mes = '${mes}'  ORDER BY nota_venda ASC
                         `)
            return await this.dividirEmQuartis(operadores, 'nota_venda')
        }
        const operadores =
            await this.databaseService.query(`
                 SELECT * FROM ${tabela} WHERE  mes = '${mes}'
                    ORDER BY nota_venda ASC
                 `)
        return await this.dividirEmQuartis(operadores, 'nota_venda')

    }
    async getQuartilVenda(mes: string, canal: string, nome_supervisor: string): Promise<any> {
        const produto = await this.getProduto(nome_supervisor, mes)
        const tabela = produto === 'CHAT' ? 'dbo.MAPA_GESTAO_CHAT' : 'dbo.MAPA_GESTAO_VOZ';
        if (canal === 'equipe') {
            const operadores =
                await this.databaseService.query(`
                SELECT * FROM dbo.MAPA_GESTAO_CHAT WHERE supervisor = '${nome_supervisor}' AND mes = '${mes}'
                UNION 
                SELECT * FROM dbo.MAPA_GESTAO_VOZ WHERE supervisor = '${nome_supervisor}' AND mes = '${mes}'  ORDER BY qtd_vendas ASC`)
            return await this.dividirEmQuartis(operadores, 'qtd_vendas')

        }
        const operadores =
            await this.databaseService.query(`
            SELECT * FROM ${tabela} WHERE  mes = '${mes}'
                    ORDER BY qtd_vendas ASC`)
        return await this.dividirEmQuartis(operadores, 'qtd_vendas')


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
    async dividirEmQuartisTabela(operadores: any[], atributo: string): Promise<any> {
        let operadoresOrdenados;

        // Função para converter o formato "hh:mm:ss" para o número total de segundos
        const tempoParaSegundos = (tempo: string) => {
            const [horas, minutos, segundos] = tempo.split(':').map(Number);
            return horas * 3600 + minutos * 60 + segundos;
        };
    
        operadoresOrdenados = [...operadores].sort((a, b) => {
            const valorA = typeof a[atributo] === 'string' ? tempoParaSegundos(a[atributo]) : a[atributo];
            const valorB = typeof b[atributo] === 'string' ? tempoParaSegundos(b[atributo]) : b[atributo];
    
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
    
        // Filtra valores válidos (não nulos ou indefinidos)
        const valoresValidos = quartil
            .map(operador => operador[atributo])
            .filter(valor => valor !== null && valor !== undefined);
    
        // Se não houver valores válidos, retorna média 0
        if (valoresValidos.length === 0) {
            return { media: 0 };
        }
    
        // Calcula a soma dos valores válidos
        const soma = valoresValidos.reduce((acc, valor) => acc + valor, 0);
    
        // Calcula a média
        const media = soma / valoresValidos.length;
    
        // Retorna a média formatada para 2 casas decimais
        return { media: parseFloat(media.toFixed(2)) };
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
    private async getProduto(nome_logado: string, mes: string): Promise<any> {
        const produtos = await this.databaseService.query(`SELECT DISTINCT produto
FROM (
    SELECT produto FROM dbo.MAPA_GESTAO_CHAT WHERE supervisor = '${nome_logado}' AND mes = '${mes}'
    UNION 
    SELECT produto FROM dbo.MAPA_GESTAO_VOZ WHERE supervisor = '${nome_logado}' AND mes = '${mes}'
) AS uniao
`)
        const novo = produtos.map((prod: { produto: string }) => {
            if (typeof prod.produto === 'string') {
                const partes = prod.produto.split('-'); // Divide a string pelo "-"
                return partes.length > 1 ? partes[1].trim() : ''; // Retorna a segunda parte se existir
            }
            return ''; // Retorna string vazia caso não seja válido
        });
        return novo[0]
    }
}
