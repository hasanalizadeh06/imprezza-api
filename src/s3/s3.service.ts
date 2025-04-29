import { Injectable, Logger } from '@nestjs/common';
import {
  DeleteObjectCommand,
  ObjectCannedACL,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { ConfigService } from '@nestjs/config/dist';

@Injectable()
export class S3Service {
  private readonly s3Client: S3Client;
  private readonly spacesEndpoint: string =
    this.config.get('SPACES_ENDPOINT') || '';
  private readonly spacesEndpointKey: string =
    this.config.get('SPACES_ENDPOINT_KEY') || '';
  private readonly spacesAccessKeyId: string =
    this.config.get('SPACES_ACCESS_KEY_ID') || '';
  private readonly spacesSecretAccessKey: string =
    this.config.get('SPACESS_SECRET_ACCESS_KEY') || '';
  private readonly bucketName: string = this.config.get('BUCKET_NAME') || '';

  constructor(
    private config: ConfigService,
    private readonly logger: Logger = new Logger(S3Service.name),
  ) {
    this.s3Client = new S3Client({
      endpoint: this.spacesEndpoint,
      region: 'fra1',
      credentials: {
        accessKeyId: this.spacesAccessKeyId,
        secretAccessKey: this.spacesSecretAccessKey,
      },
    });
  }

  async uploadFile(image: Express.Multer.File, path: string): Promise<string> {
    try {
      const buffer = image.buffer;
      const key = `${path}/${Date.now()}-${image.originalname}`;

      // Use existing uploadObject method
      return await this.uploadObject(key, buffer);
    } catch (error) {
      this.logger.error(`Failed to upload file: ${error.message}`, error.stack);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  async uploadObject(key: string, data: Buffer): Promise<string> {
    this.logger.log('uploadObject --> Start');
    const compressedData = data;

    const command: PutObjectCommand = new PutObjectCommand({
      Bucket: this.bucketName,
      Key: key,
      Body: compressedData,
      ACL: ObjectCannedACL.public_read,
    });
    await this.s3Client.send(command);
    this.logger.log('uploadObject --> Success');
    return `https://${this.bucketName}.${this.spacesEndpointKey}/${key}`;
  }

  async deleteObject(key: string): Promise<void> {
    this.logger.log('deleteObject --> Start');
    const command: DeleteObjectCommand = new DeleteObjectCommand({
      Bucket: this.bucketName,
      Key: key,
    });
    await this.s3Client.send(command);
    this.logger.log('deleteObject --> Success');
  }
}
