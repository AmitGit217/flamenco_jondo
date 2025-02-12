import { Global, Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';

@Global()
@Injectable()
export class StorageService {
  private readonly s3: AWS.S3;
  private readonly bucketName: string;

  constructor() {
    this.s3 = new AWS.S3({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000', // Endpoint URL from env vars
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin', // Access Key from env vars
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin', // Secret Key from env vars
      s3ForcePathStyle: true, // Needed for MinIO or S3 compatible storage
      signatureVersion: process.env.S3_SIGNATURE_VERSION || 'v4', // Signature version from env vars
    });
    this.bucketName = process.env.BUCKET_NAME;
  }

  async uploadFile(
    key: string,
    body: Buffer | ReadableStream | string,
  ): Promise<string> {
    // Check if the bucket exists
    try {
      await this.s3.headBucket({ Bucket: this.bucketName }).promise();
    } catch (error: any) {
      if (error.statusCode === 404) {
        // If the bucket does not exist, create it
        await this.createBucket(this.bucketName);
      } else {
        throw new Error(`Error checking if bucket exists: ${error.message}`);
      }
    }

    // Upload the file
    const file = this.s3
      .upload({
        Bucket: this.bucketName,
        Key: key,
        Body: body,
      })
      .promise();

    return (await file).Location;
  }

  async getFile(key: string): Promise<AWS.S3.GetObjectOutput> {
    return this.s3
      .getObject({
        Bucket: this.bucketName,
        Key: key,
      })
      .promise();
  }

  async deleteFile(key: string): Promise<AWS.S3.DeleteObjectOutput> {
    return this.s3
      .deleteObject({
        Bucket: this.bucketName,
        Key: key,
      })
      .promise();
  }

  async createBucket(bucketName: string): Promise<AWS.S3.CreateBucketOutput> {
    return this.s3.createBucket({ Bucket: bucketName }).promise();
  }

  async listBuckets(): Promise<AWS.S3.ListBucketsOutput> {
    return this.s3.listBuckets().promise();
  }
}
