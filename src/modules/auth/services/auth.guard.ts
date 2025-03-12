import {
    CanActivate,
    ExecutionContext,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { Request } from 'express';
  
  @Injectable()
  export class AuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}
  
    async canActivate(context: ExecutionContext): Promise<boolean> {
      const request = context.switchToHttp().getRequest<Request>();
      const token = this.extractTokenFromHeader(request);
  
      if (!token) {
        throw new UnauthorizedException('Token não encontrado no cabeçalho.');
      }
  
      try {
        // Decodifica o token sem verificar a assinatura
        const payload = this.jwtService.decode(token);
  
        if (!payload) {
          throw new UnauthorizedException('Token inválido.');
        }
        // Armazena o payload no objeto da requisição
        request['user'] = payload;
        
      } catch (err) {
        throw new UnauthorizedException('Erro ao processar o token.');
      }
  
      return true; // Permite o acesso se o token for válido
    }
  
    private extractTokenFromHeader(request: Request): string | undefined {
      const authHeader = request.headers.authorization;
      if (!authHeader) {
        return undefined;
      }
  
      // Remove o prefixo "Bearer " do cabeçalho
      const [type, token] = authHeader.split(' ');
      return type === 'Bearer:' ? token : undefined;
    }
  }
  