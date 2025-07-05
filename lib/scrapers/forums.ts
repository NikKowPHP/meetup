import axios from 'axios';
import cheerio from 'cheerio';
import { NormalizedEvent } from '../types/event';
import { logger } from '../utils/logger';

interface ForumPost {
  title: string;
  date: string;
  content: string;
  url: string;
  author: string;
  location?: string;
}

export async function scrapeForumEvents(forumUrl: string): Promise<NormalizedEvent[]> {
  try {
    const response = await axios.get(forumUrl);
    const $ = cheerio.load(response.data);
    
    // These selectors would need to be customized per forum
    const posts: ForumPost[] = [];
    $('.forum-post').each((i, element) => {
      const post = {
        title: $(element).find('.post-title').text().trim(),
        date: $(element).find('.post-date').text().trim(),
        content: $(element).find('.post-content').text().trim(),
        url: $(element).find('a').attr('href') || forumUrl,
        author: $(element).find('.post-author').text().trim(),
        location: $(element).find('.location').text().trim()
      };
      posts.push(post);
    });

    return posts.filter(post => 
      // Simple heuristic to identify event posts
      post.title.toLowerCase().includes('event') ||
      post.content.toLowerCase().includes('event')
    ).map(post => ({
      title: post.title,
      start: post.date, // Would need actual date parsing
      description: post.content,
      location: {
        address: post.location || '',
        coordinates: null // Could be extracted from content if available
      },
      imageUrl: '', // Forums rarely have event images
      sourceUrl: post.url
    }));
  } catch (error) {
    logger.error(`Failed to scrape forum at ${forumUrl}`, error);
    throw error;
  }
}