import { supabase } from '../lib/supabase';

export const submitSitemapToSearchEngines = async (sitemapUrl: string) => {
  const searchEngines = [
    `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
    `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
  ];

  const results = await Promise.allSettled(
    searchEngines.map(url => fetch(url))
  );

  return results.map((result, index) => ({
    engine: index === 0 ? 'Google' : 'Bing',
    success: result.status === 'fulfilled',
    status: result.status === 'fulfilled' ? 'Submitted' : 'Failed'
  }));
};

export const getSitemapStats = async () => {
  try {
    const [blogPosts, projects, sheds] = await Promise.all([
      supabase.from('blog_posts').select('id').eq('is_published', true),
      supabase.from('past_projects').select('id').eq('is_featured', true),
      supabase.from('shed_listings').select('id').eq('is_active', true)
    ]);

    return {
      totalUrls: 3 + (blogPosts.data?.length || 0) + (projects.data?.length || 0) + (sheds.data?.length || 0),
      blogPosts: blogPosts.data?.length || 0,
      featuredProjects: projects.data?.length || 0,
      activeSheds: sheds.data?.length || 0
    };
  } catch (error) {
    console.error('Error getting sitemap stats:', error);
    return null;
  }
};
