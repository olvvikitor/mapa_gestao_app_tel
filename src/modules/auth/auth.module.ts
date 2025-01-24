import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import AuthController from "./controller/auth.controller";
import { AuthGuard } from "./services/auth.guard";

@Module({
    imports:[HttpModule],
    controllers:[AuthController],
    providers:[AuthGuard],
    exports:[AuthGuard]
})
export default class AuthModule{}
