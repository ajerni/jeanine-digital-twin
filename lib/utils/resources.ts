import fs from 'fs';
import path from 'path';

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

  const dataDir = path.join(process.cwd(), 'lib', 'data');

  try {
    // Read LinkedIn data - try text file first, then fallback
    let linkedin = '';
    try {
      // Try to read linkedin.txt if it exists
      const linkedinTxtPath = path.join(dataDir, 'linkedin.txt');
      if (fs.existsSync(linkedinTxtPath)) {
        linkedin = fs.readFileSync(linkedinTxtPath, 'utf-8');
      } else {
        // Fallback message if no LinkedIn data available
        console.warn('LinkedIn text file not found');
        linkedin = 'LinkedIn profile information not available in this format.';
      }
    } catch (error) {
      console.warn('LinkedIn data could not be read:', error);
      linkedin = 'LinkedIn profile not available';
    }

    // Read text files
    const summary = fs.readFileSync(path.join(dataDir, 'summary.txt'), 'utf-8');
    const style = fs.readFileSync(path.join(dataDir, 'style.txt'), 'utf-8');

    // Read JSON file
    const factsData = fs.readFileSync(path.join(dataDir, 'facts.json'), 'utf-8');
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

