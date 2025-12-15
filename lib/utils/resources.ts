import { readFileSync } from 'fs';
import { join } from 'path';

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

  const dataDir = join(process.cwd(), 'lib', 'data');

  try {
    // Read LinkedIn data (optional - won't crash if missing)
    let linkedin = 'LinkedIn profile information not available.';
    try {
      linkedin = readFileSync(join(dataDir, 'linkedin.txt'), 'utf-8');
    } catch (error) {
      console.warn('LinkedIn data not found, using fallback');
    }

    // Read required text files
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

    return cachedResources;
  } catch (error) {
    console.error('Error loading resources:', error);
    throw new Error('Failed to load resources');
  }
}

