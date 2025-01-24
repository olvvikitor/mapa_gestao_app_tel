import { Module } from "@nestjs/common";
import { DatabaseService } from "./config.bd";

@Module({
    providers:[DatabaseService],
    exports:[DatabaseService]
})
export default class ConfigDatabaseModule{}