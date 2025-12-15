// Import data files directly at build time
import factsJson from '../data/facts.json';
import linkedinTxt from '../data/linkedin.txt';
import summaryTxt from '../data/summary.txt';
import styleTxt from '../data/style.txt';

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
    // Use imported data directly
    cachedResources = {
      linkedin: linkedinTxt as string,
      summary: summaryTxt as string,
      style: styleTxt as string,
      facts: factsJson as Record<string, unknown>,
    };

    console.log('Resources loaded successfully from imports');
    return cachedResources;
  } catch (error) {
    console.error('Error loading resources:', error);
    throw new Error('Failed to load resources');
  }
}

