import { Global, Logger, Module } from '@nestjs/common';
import { S3Service } from './s3.service';

@Global()
@Module({
  providers: [S3Service, Logger],
  exports: [S3Service],
})
export class S3Module {}
