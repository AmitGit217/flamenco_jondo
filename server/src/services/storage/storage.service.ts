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
    this.bucketName = process.env.S3_BUCKET_NAME;
  }

  async uploadFile(
    key: string,
    body: Buffer | ReadableStream | string,
  ): Promise<string> {
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

  async getFile(key: string): Promise<string> {
    try {
      // if key includes http, remove it
      key = this.extractRelativePath(key);
      console.log(key);
      const response = await this.s3
        .getObject({
          Bucket: this.bucketName,
          Key: key,
        })
        .promise();

      return response.Body?.toString('base64') || '';
    } catch (error) {
      console.error('Error getting file:', error);
      return '';
    }
  }

  async deleteFile(key: string): Promise<AWS.S3.DeleteObjectOutput> {
    if (key.includes('http')) {
      key = key.split('/').pop();
    }
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

  extractRelativePath = (url: string) => {
    try {
      const urlObj = new URL(url);
      let relativePath = urlObj.pathname.startsWith('/')
        ? urlObj.pathname.substring(1)
        : urlObj.pathname;

      // Remove bucket name if it's included in the path
      relativePath = relativePath.replace(`${this.bucketName}/`, '');

      // Decode any encoded characters (like %20 for spaces)
      return decodeURIComponent(relativePath);
    } catch {
      // Fallback if URL parsing fails
      return decodeURIComponent(url.replace(`${this.bucketName}/`, ''));
    }
  };
}
