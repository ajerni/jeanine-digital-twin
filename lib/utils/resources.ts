import { readFileSync } from 'fs';
import { join, resolve } from 'path';

// Cache for loaded resources
let cachedResources: {
  linkedin: string;
  summary: string;
  style: string;
  facts: Record<string, unknown>;
} | null = null;

export async function loadResources() {
  // Return cached resources if available
  if (cachedResources) {
    return cachedResources;
  }

  try {
    // Try multiple path resolutions for compatibility with different environments
    let dataDir: string;
    
    // First try: relative to current working directory (works in dev and most builds)
    dataDir = join(process.cwd(), 'lib', 'data');
    
    // Check if path exists, if not try alternative
    try {
      readFileSync(join(dataDir, 'facts.json'), 'utf-8');
    } catch {
      // Second try: relative path from this module (for bundled serverless functions)
      dataDir = resolve(__dirname, '..', 'data');
    }

    console.log('Loading resources from:', dataDir);

    // Read LinkedIn data
    let linkedin = '';
    try {
      const linkedinTxtPath = join(dataDir, 'linkedin.txt');
      linkedin = readFileSync(linkedinTxtPath, 'utf-8');
    } catch (error) {
      console.warn('LinkedIn data could not be read:', error);
      linkedin = 'LinkedIn profile not available';
    }

    // Read text files
    const summary = readFileSync(join(dataDir, 'summary.txt'), 'utf-8');
    const style = readFileSync(join(dataDir, 'style.txt'), 'utf-8');

    // Read JSON file
    const factsData = readFileSync(join(dataDir, 'facts.json'), 'utf-8');
    const facts = JSON.parse(factsData);

    // Cache the resources
    cachedResources = {
      linkedin,
      summary,
      style,
      facts,
    };

    console.log('Resources loaded successfully');
    return cachedResources;
  } catch (error) {
    console.error('Error loading resources:', error);
    console.error('Tried paths:', [
      join(process.cwd(), 'lib', 'data'),
      resolve(__dirname, '..', 'data')
    ]);
    throw new Error('Failed to load resources');
  }
}

