import fs from 'fs';
import path from 'path';
import * as pdfParse from 'pdf-parse';

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
    // Read LinkedIn PDF
    let linkedin = '';
    try {
      const pdfPath = path.join(dataDir, 'linkedin.pdf');
      const dataBuffer = fs.readFileSync(pdfPath);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const pdfData = await (pdfParse as any)(dataBuffer);
      linkedin = pdfData.text;
    } catch (error) {
      console.warn('LinkedIn PDF not found or could not be read:', error);
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

