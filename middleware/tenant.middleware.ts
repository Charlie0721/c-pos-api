// src/middlewares/tenant.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';
import { tenantStorage } from './async-local-storage/async-local-storage';

@Injectable()
export class TenantMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) {
      throw new Error('Falta el tenant ID en el header X-Tenant-ID');
    }

    // Ejemplo: podrías tener una lógica que mapea tenantId -> database y schema
    const tenantInfo = {
      database: process.env.DB_NAME, // si es una sola DB
      schema: tenantId,
    };

    tenantStorage.run(new Map([['tenant', tenantInfo]]), () => {
      next();
    });
  }
}
