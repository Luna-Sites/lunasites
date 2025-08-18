// Page template definitions with hierarchical structure

export const pageTemplates = {
  // SECTION BASED PAGES
  // Business - Section Based
  sectionBusinessHomepage: {
    id: 'sectionBusinessHomepage',
    title: 'Business Homepage',
    mainCategory: 'section-based',
    subCategory: 'business',
    contentType: 'Document',
    pageType: 'section-based',
    description: 'Professional homepage built with sections - hero, services, testimonials',
    thumbnail: 'https://placehold.co/400x300/094ce1/ffffff?text=Section+Business+Homepage',
    featured: true,
    template: () => ({
      title: 'Welcome to Our Business',
      description: 'Professional business homepage',
      blocks: {},
      blocks_layout: { items: [] }
    }),
  },

  sectionBusinessAbout: {
    id: 'sectionBusinessAbout',
    title: 'About Us (Sections)',
    mainCategory: 'section-based',
    subCategory: 'business',
    contentType: 'Document',
    pageType: 'section-based',
    description: 'About page with team section, mission section, values section',
    thumbnail: 'https://placehold.co/400x300/28a745/ffffff?text=Section+About',
    featured: false,
    template: () => ({
      title: 'About Our Company',
      description: 'Learn more about our company',
      blocks: {},
      blocks_layout: { items: [] }
    }),
  },

  // Portfolio - Section Based
  sectionPortfolioGallery: {
    id: 'sectionPortfolioGallery',
    title: 'Portfolio Gallery (Sections)',
    mainCategory: 'section-based',
    subCategory: 'portfolio',
    contentType: 'Document',
    pageType: 'section-based',
    description: 'Portfolio with project showcase sections and filter sections',
    thumbnail: 'https://placehold.co/400x300/6f42c1/ffffff?text=Section+Portfolio',
    featured: true,
    template: () => ({
      title: 'Our Portfolio',
      description: 'Showcase of our best work',
      blocks: {},
      blocks_layout: { items: [] }
    }),
  },

  // Blog - Section Based
  sectionBlogListing: {
    id: 'sectionBlogListing',
    title: 'Blog (Sections)',
    mainCategory: 'section-based',
    subCategory: 'blog',
    contentType: 'Document',
    pageType: 'section-based',
    description: 'Blog page with featured posts section, categories section',
    thumbnail: 'https://placehold.co/400x300/dc3545/ffffff?text=Section+Blog',
    featured: false,
    template: () => ({
      title: 'Our Blog',
      description: 'Latest news and articles',
      blocks: {},
      blocks_layout: { items: [] }
    }),
  },

  // LINEAR BLOCKS PAGES
  // Business - Linear Blocks
  linearBusinessHomepage: {
    id: 'linearBusinessHomepage',
    title: 'Business Homepage (Linear)',
    mainCategory: 'linear-blocks',
    subCategory: 'business',
    contentType: 'Document',
    pageType: 'linear-blocks',
    description: 'Traditional linear page with stacked content blocks',
    thumbnail: 'https://placehold.co/400x300/094ce1/ffffff?text=Linear+Business',
    featured: true,
    template: () => ({
      title: 'Business Homepage',
      description: 'Linear blocks business page',
      blocks: {},
      blocks_layout: { items: [] }
    }),
  },

  linearBlogPost: {
    id: 'linearBlogPost',
    title: 'Blog Post (Linear)',
    mainCategory: 'linear-blocks',
    subCategory: 'blog',
    contentType: 'News Item',
    pageType: 'linear-blocks',
    description: 'Standard blog post with linear content flow',
    thumbnail: 'https://placehold.co/400x300/dc3545/ffffff?text=Linear+Blog',
    featured: false,
    template: () => ({
      title: 'New Blog Post',
      description: 'Share your thoughts',
      blocks: {},
      blocks_layout: { items: [] }
    }),
  },

  // Portfolio - Linear Blocks
  linearPortfolioCase: {
    id: 'linearPortfolioCase',
    title: 'Case Study (Linear)',
    mainCategory: 'linear-blocks',
    subCategory: 'portfolio',
    contentType: 'Document',
    pageType: 'linear-blocks',
    description: 'Detailed case study with linear storytelling',
    thumbnail: 'https://placehold.co/400x300/6f42c1/ffffff?text=Linear+Case',
    featured: false,
    template: () => ({
      title: 'Project Case Study',
      description: 'Detailed project analysis',
      blocks: {},
      blocks_layout: { items: [] }
    }),
  },

  // Contact - Linear Blocks
  linearContactPage: {
    id: 'linearContactPage',
    title: 'Contact Page (Linear)',
    mainCategory: 'linear-blocks',
    subCategory: 'contact',
    contentType: 'Document',
    pageType: 'linear-blocks',
    description: 'Simple contact page with form and info blocks',
    thumbnail: 'https://placehold.co/400x300/ffc107/000000?text=Linear+Contact',
    featured: false,
    template: () => ({
      title: 'Contact Us',
      description: 'Get in touch',
      blocks: {},
      blocks_layout: { items: [] }
    }),
  },

  // FREE GRID PAGES - Coming Soon
  // No templates available yet
};

export const pageCategories = [
  { id: 'section-based', label: 'Section Based' },
  { id: 'linear-blocks', label: 'Linear Blocks' },
  { id: 'free-grid', label: 'Free Grid' },
];

export const subCategories = [
  { id: 'all', label: 'All Types' },
  { id: 'business', label: 'Business' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'blog', label: 'Blog' },
  { id: 'contact', label: 'Contact' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'events', label: 'Events' },
];

const getPagesByCategory = (mainCategory = 'all', subCategory = 'all') => {
  let pages = Object.values(pageTemplates);
  
  if (mainCategory !== 'all') {
    pages = pages.filter(page => page.mainCategory === mainCategory);
  }
  
  if (subCategory !== 'all') {
    pages = pages.filter(page => page.subCategory === subCategory);
  }
  
  return pages;
};

export { getPagesByCategory };