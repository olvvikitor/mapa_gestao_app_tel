import { Module } from "@nestjs/common";
import ConfigDatabaseModule from "src/config/config.module";
import AuthModule from "../auth/auth.module";
import { OperadorController } from "./operador.controller";
import { OperadorService } from "./operador.service";

@Module({
    imports:[ConfigDatabaseModule,AuthModule],
    controllers:[OperadorController],
    providers:[OperadorService],
    exports:[OperadorService]
})
export class OperadorModule{}