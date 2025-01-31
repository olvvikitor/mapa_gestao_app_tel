import { Module } from "@nestjs/common";
import { DatabaseService } from "./config.bd";
import { ConfigService } from "@nestjs/config";
import { ProducaoDataBase } from "./producao.database";
import { TesteDatabase } from "./teste.database";

@Module({
    providers: [{
        provide: 'DatabaseService', useFactory: async (configService: ConfigService) => {
            const ambiente = configService.get<string>('ambiente');
            return ambiente === 'prod' ? new ProducaoDataBase(configService) : new TesteDatabase(configService)
        }, inject: [ConfigService]
    }],
    exports: ['DatabaseService']
})
export default class ConfigDatabaseModule { }