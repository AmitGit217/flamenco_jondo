import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  InternalServerErrorException,
} from '@nestjs/common';
import { PrismaClient, Prisma } from '@common/index';
import { prismaQueryErrors } from './static';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super();
    // return this.createProxy(this);
  }

  public async onModuleInit() {
    await this.$connect();
  }

  public async onModuleDestroy() {
    await this.$disconnect();
  }

  private createProxy(target: any): any {
    return new Proxy(target, {
      get: (obj, prop) => {
        const originalMethod = obj[prop];
        if (typeof originalMethod === 'object' && originalMethod !== null) {
          return this.createProxy(originalMethod);
        }
        if (typeof originalMethod === 'function') {
          return async (...args: any[]) => {
            try {
              return await originalMethod.apply(obj, args);
            } catch (error) {
              this.handleError(error);
            }
          };
        }
        return originalMethod;
      },
    });
  }

  private handleError(error: any) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      const errorMessageTemplate = prismaQueryErrors[error.code];

      if (errorMessageTemplate) {
        const formattedMessage = errorMessageTemplate.replace(
          /{(\w+)}/g,
          (_, key) => error.meta?.[key] || key,
        );

        throw new InternalServerErrorException(
          `Prisma Error [${error.code}]: ${formattedMessage}`,
        );
      } else {
        throw new InternalServerErrorException(
          'An unexpected error occurred: ---->  ' + error,
        );
      }
    } else {
      throw new InternalServerErrorException(
        'An unexpected error occurred: ---->  ' + error,
      );
    }
  }
}
