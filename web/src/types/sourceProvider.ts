export type SourceProvider = {
  id: string
  name: string
  type: SourceType
}

export enum SourceType {
  Local = 'local',
  OneDrive = 'onedrive',
  CloudflareR2 = 'cloudflare-r2',
  DetaCollection = 'deta',
  AmazonS3 = 'amazon-s3',
  GoogleDrive = 'google-drive',
}
