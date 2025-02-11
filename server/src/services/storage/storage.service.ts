import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { bucketName } from './static';

@Injectable()
export class StorageService {
  private readonly s3: AWS.S3;

  constructor() {
    this.s3 = new AWS.S3({
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000', // Endpoint URL from env vars
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin', // Access Key from env vars
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin', // Secret Key from env vars
      s3ForcePathStyle: true, // Needed for MinIO or S3 compatible storage
      signatureVersion: process.env.S3_SIGNATURE_VERSION || 'v4', // Signature version from env vars
    });
  }

  async uploadFile(bucketName: bucketName, key: string, body: Buffer | ReadableStream | string): Promise<AWS.S3.ManagedUpload.SendData> {
    // Check if the bucket exists
    try {
      await this.s3.headBucket({ Bucket: bucketName }).promise();
    } catch (error: any) {
      if (error.statusCode === 404) {
        // If the bucket does not exist, create it
        await this.createBucket(bucketName);
      } else {
        throw new Error(`Error checking if bucket exists: ${error.message}`);
      }
    }

    // Upload the file
    return this.s3
      .upload({
        Bucket: bucketName,
        Key: key,
        Body: body,
      })
      .promise();
  }

  async getFile(bucketName: bucketName, key: string): Promise<AWS.S3.GetObjectOutput> {
    return this.s3
      .getObject({
        Bucket: bucketName,
        Key: key,
      })
      .promise();
  }

  async deleteFile(bucketName: bucketName, key: string): Promise<AWS.S3.DeleteObjectOutput> {
    return this.s3
      .deleteObject({
        Bucket: bucketName,
        Key: key,
      })
      .promise();
  }

  async createBucket(bucketName: bucketName): Promise<AWS.S3.CreateBucketOutput> {
    return this.s3.createBucket({ Bucket: bucketName }).promise();
  }

  async listBuckets(): Promise<AWS.S3.ListBucketsOutput> {
    return this.s3.listBuckets().promise();
  }
}
