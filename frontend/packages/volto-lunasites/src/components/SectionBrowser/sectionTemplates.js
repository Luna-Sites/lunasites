import { v4 as uuid } from 'uuid';

export const sectionTemplates = {
  blankSection: {
    id: 'blankSection',
    title: 'Blank Section',
    category: 'Templates',
    description: 'New section with a text block',
    thumbnail: '/static/section-thumbnails/blank.png',
    template: () => {
      const slateId = uuid();

      return {
        blocks: {
          [slateId]: {
            '@type': 'slate',
            value: [
              {
                type: 'p',
                children: [
                  {
                    text: 'Start typing...',
                  },
                ],
              },
            ],
            plaintext: 'Start typing...',
          },
        },
        blocks_layout: {
          items: [slateId],
        },
      };
    },
  },
};

// Dynamic categories based on saved sections
export const getSectionCategories = (customSectionsData = {}) => {
  const categories = customSectionsData.categories || [];
  // Always include Templates category for the blank template
  const allCategories = ['Templates', ...categories.filter(cat => cat !== 'Templates')];
  return allCategories.map(category => ({ id: category, label: category }));
};

const getSectionsByCategory = (category, customSections = []) => {
  // For Templates category, show the blank template + any saved templates
  if (category === 'Templates') {
    const blankTemplate = Object.values(sectionTemplates);
    const templatesFromSaved = customSections.filter((section) => section.category === 'Templates');
    return [...blankTemplate, ...templatesFromSaved];
  }
  
  // For other categories, show only saved sections
  return customSections.filter((section) => section.category === category);
};

export { getSectionsByCategory };
