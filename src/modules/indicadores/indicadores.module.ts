import { Module } from "@nestjs/common";
import { IndicadoresController } from "./indicadores.controller";
import { IndicadoresSupervisorService } from "./indicadores.supervisor.service";
import AuthModule from "../auth/auth.module";
import ConfigDatabaseModule from "src/config/config.module";
import { CoordenadorService } from "./indicadores.coordenador.service";

@Module({
  imports:[ConfigDatabaseModule, AuthModule],
    controllers:[IndicadoresController],
    providers:[IndicadoresSupervisorService, CoordenadorService],
    exports:[IndicadoresSupervisorService,CoordenadorService]
})
export class IndicadoresModule{}