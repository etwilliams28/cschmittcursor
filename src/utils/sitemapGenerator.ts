import { supabase } from '../lib/supabase';

export interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority: number;
}

export const generateSitemap = async (baseUrl: string): Promise<string> => {
  const urls: SitemapUrl[] = [
    // Static pages
    {
      loc: `${baseUrl}/`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 1.0
    },
    {
      loc: `${baseUrl}/sheds`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'weekly',
      priority: 0.9
    },
    {
      loc: `${baseUrl}/blog`,
      lastmod: new Date().toISOString().split('T')[0],
      changefreq: 'daily',
      priority: 0.8
    }
  ];

  try {
    // Add blog posts
    const { data: blogPosts } = await supabase
      .from('blog_posts')
      .select('slug, updated_at')
      .eq('is_published', true);

    if (blogPosts) {
      blogPosts.forEach(post => {
        urls.push({
          loc: `${baseUrl}/blog/${post.slug}`,
          lastmod: new Date(post.updated_at || post.updated_at).toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.6
        });
      });
    }

    // Add featured projects (optional - for SEO)
    const { data: featuredProjects } = await supabase
      .from('past_projects')
      .select('id, updated_at')
      .eq('is_featured', true);

    if (featuredProjects) {
      featuredProjects.forEach(project => {
        urls.push({
          loc: `${baseUrl}/projects/${project.id}`,
          lastmod: new Date(project.updated_at).toISOString().split('T')[0],
          changefreq: 'monthly',
          priority: 0.5
        });
      });
    }
  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  // Generate XML
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(url => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  return xml;
};

export const downloadSitemap = async (baseUrl: string) => {
  const xml = await generateSitemap(baseUrl);
  const blob = new Blob([xml], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'sitemap.xml';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
