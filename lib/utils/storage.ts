import fs from 'fs';
import path from 'path';
import { S3Client, GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

// Configuration
const USE_S3 = process.env.AWS_S3_MEMORY_BUCKET ? true : false;
const S3_BUCKET = process.env.AWS_S3_MEMORY_BUCKET || '';
const MEMORY_DIR = process.env.MEMORY_DIR || path.join(process.cwd(), 'memory');

// Initialize S3 client if needed
let s3Client: S3Client | null = null;
if (USE_S3) {
  s3Client = new S3Client({
    region: process.env.AWS_DEFAULT_REGION || 'eu-central-1',
    credentials: {
      accessKeyId: process.env.AWS_IAM_ID_KEY || '',
      secretAccessKey: process.env.AWS_IAM_SECRET_KEY || '',
    },
  });
}

// S3 Functions
async function loadFromS3(sessionId: string): Promise<Message[]> {
  if (!s3Client) return [];
  
  try {
    const command = new GetObjectCommand({
      Bucket: S3_BUCKET,
      Key: `${sessionId}.json`,
    });
    
    const response = await s3Client.send(command);
    const data = await response.Body?.transformToString();
    
    if (data) {
      return JSON.parse(data);
    }
    return [];
  } catch (error: any) {
    if (error.name === 'NoSuchKey') {
      // File doesn't exist yet, that's ok
      return [];
    }
    console.error('Error loading from S3:', error);
    return [];
  }
}

async function saveToS3(sessionId: string, messages: Message[]): Promise<void> {
  if (!s3Client) throw new Error('S3 client not initialized');
  
  try {
    const command = new PutObjectCommand({
      Bucket: S3_BUCKET,
      Key: `${sessionId}.json`,
      Body: JSON.stringify(messages, null, 2),
      ContentType: 'application/json',
    });
    
    await s3Client.send(command);
  } catch (error) {
    console.error('Error saving to S3:', error);
    throw new Error('Failed to save conversation to S3');
  }
}

// Local File System Functions
function ensureMemoryDir() {
  if (!fs.existsSync(MEMORY_DIR)) {
    fs.mkdirSync(MEMORY_DIR, { recursive: true });
  }
}

function getMemoryPath(sessionId: string): string {
  return path.join(MEMORY_DIR, `${sessionId}.json`);
}

function loadFromLocal(sessionId: string): Message[] {
  try {
    ensureMemoryDir();
    const filePath = getMemoryPath(sessionId);
    
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
    
    return [];
  } catch (error) {
    console.error('Error loading from local:', error);
    return [];
  }
}

function saveToLocal(sessionId: string, messages: Message[]): void {
  try {
    ensureMemoryDir();
    const filePath = getMemoryPath(sessionId);
    fs.writeFileSync(filePath, JSON.stringify(messages, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error saving to local:', error);
    throw new Error('Failed to save conversation locally');
  }
}

// Public API - automatically chooses S3 or local based on environment
export async function loadConversation(sessionId: string): Promise<Message[]> {
  if (USE_S3) {
    console.log(`Loading conversation ${sessionId} from S3`);
    return await loadFromS3(sessionId);
  } else {
    console.log(`Loading conversation ${sessionId} from local file system`);
    return loadFromLocal(sessionId);
  }
}

export async function saveConversation(sessionId: string, messages: Message[]): Promise<void> {
  if (USE_S3) {
    console.log(`Saving conversation ${sessionId} to S3`);
    await saveToS3(sessionId, messages);
  } else {
    console.log(`Saving conversation ${sessionId} to local file system`);
    saveToLocal(sessionId, messages);
  }
}

