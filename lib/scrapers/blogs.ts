import axios from 'axios';
import cheerio from 'cheerio';
import { NormalizedEvent } from '../types/event';
import { logger } from '../utils/logger';

interface BlogPost {
  title: string;
  date: string;
  content: string;
  url: string;
  image?: string;
  location?: string;
}

export async function scrapeBlogEvents(blogUrl: string): Promise<NormalizedEvent[]> {
  try {
    const response = await axios.get(blogUrl);
    const $ = cheerio.load(response.data);
    
    // This selector would need to be customized per blog
    const posts: BlogPost[] = [];
    $('article').each((i, element) => {
      const post = {
        title: $(element).find('h2').text().trim(),
        date: $(element).find('.post-date').text().trim(),
        content: $(element).find('.post-content').text().trim(),
        url: $(element).find('a').attr('href') || blogUrl,
        image: $(element).find('img').attr('src'),
        location: $(element).find('.location').text().trim()
      };
      posts.push(post);
    });

    return posts.map(post => ({
      title: post.title,
      start: post.date, // Would need actual date parsing
      description: post.content,
      location: {
        address: post.location || '',
        coordinates: null // Could be extracted from content if available
      },
      imageUrl: post.image || '',
      sourceUrl: post.url
    }));
  } catch (error) {
    logger.error(`Failed to scrape blog at ${blogUrl}`, error);
    throw error;
  }
}