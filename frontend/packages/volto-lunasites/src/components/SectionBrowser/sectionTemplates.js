import { v4 as uuid } from 'uuid';

export const sectionTemplates = {
  blankSection: {
    id: 'blankSection',
    title: 'Blank Section',
    category: 'all',
    description: 'Empty section where you can add any blocks you want',
    thumbnail: '/static/section-thumbnails/blank.png',
    template: () => {
      const sectionId = uuid();

      return {
        blocks: {
          [sectionId]: {
            '@type': 'customSection',
            blocks: {},
            blocks_layout: {
              items: [],
            },
            styles: {},
            title: '',
          },
        },
        blocks_layout: {
          items: [sectionId],
        },
      };
    },
  },
  intro: {
    id: 'intro',
    title: 'Intro Section',
    category: 'content',
    description:
      'A simple introduction with heading, text, and call-to-action button',
    thumbnail: '/static/section-thumbnails/intro.png',
    template: () => {
      const titleId = uuid();
      const textId = uuid();
      const buttonId = uuid();

      return {
        blocks: {
          [textId]: {
            styles: {},
            theme: 'default',
            '@type': 'slate',
            value: [
              {
                type: 'p',
                children: [
                  {
                    text: 'TEST SLATE',
                  },
                ],
              },
            ],
            plaintext: 'TEST SLATE',
          },
        },
        blocks_layout: {
          items: [textId],
        },
      };
    },
  },

  heroWithImage: {
    id: 'heroWithImage',
    title: 'Hero with Image',
    category: 'hero',
    description: 'Large hero section with text and background image',
    thumbnail: '/static/section-thumbnails/hero-image.png',
    template: () => {
      const gridId = uuid();
      const imageId = uuid();
      const textId = uuid();

      return {
        blocks: {
          [gridId]: {
            styles: {},
            theme: 'default',
            '@type': 'gridBlock',
            blocks: {
              [imageId]: {
                align: 'center',
                size: 'l',
                '@type': 'image',
                url: '../resolveuid/a58ccead718140c1baa98d43595fc3e6',
                credit: {},
                description: '',
                title: 'Plone Foundation Logo',
                image_field: 'image',
              },
              [textId]: {
                '@type': 'slate',
                value: [
                  {
                    type: 'p',
                    children: [
                      {
                        text: 'DOES THIS WORK',
                      },
                    ],
                  },
                ],
                plaintext: 'DOES THIS WORK',
              },
            },
            blocks_layout: {
              items: [imageId, textId],
            },
          },
        },
        blocks_layout: {
          items: [gridId],
        },
      };
    },
  },

  // twoColumnGrid: {
  //   id: 'twoColumnGrid',
  //   title: 'Two Column Grid',
  //   category: 'layout',
  //   description: 'Two-column layout with images and text',
  //   thumbnail: '/static/section-thumbnails/two-column.png',
  //   template: () => {
  //     const gridId = generateId();
  //     const leftColId = generateId();
  //     const rightColId = generateId();
  //     const leftImageId = generateId();
  //     const leftTextId = generateId();
  //     const rightImageId = generateId();
  //     const rightTextId = generateId();

  //     return {
  //       blocks: {
  //         [gridId]: {
  //           '@type': 'gridBlock',
  //           data: {
  //             columns: 2,
  //             alignment: 'center',
  //           },
  //           innerBlocks: {
  //             [leftColId]: {
  //               '@type': 'gridColumn',
  //               innerBlocks: {
  //                 [leftImageId]: {
  //                   '@type': 'image',
  //                   data: {
  //                     url: '/static/placeholder-1.jpg',
  //                     alt: 'Feature 1',
  //                   },
  //                 },
  //                 [leftTextId]: {
  //                   '@type': 'slate',
  //                   value: [
  //                     {
  //                       type: 'h3',
  //                       children: [{ text: 'Amazing Feature 1' }],
  //                     },
  //                     {
  //                       type: 'p',
  //                       children: [
  //                         {
  //                           text: 'Describe your first amazing feature here with compelling details.',
  //                         },
  //                       ],
  //                     },
  //                   ],
  //                   plaintext:
  //                     'Amazing Feature 1\nDescribe your first amazing feature here with compelling details.',
  //                 },
  //               },
  //               innerBlocks_layout: {
  //                 items: [leftImageId, leftTextId],
  //               },
  //             },
  //             [rightColId]: {
  //               '@type': 'gridColumn',
  //               innerBlocks: {
  //                 [rightImageId]: {
  //                   '@type': 'image',
  //                   data: {
  //                     url: '/static/placeholder-2.jpg',
  //                     alt: 'Feature 2',
  //                   },
  //                 },
  //                 [rightTextId]: {
  //                   '@type': 'slate',
  //                   value: [
  //                     {
  //                       type: 'h3',
  //                       children: [{ text: 'Amazing Feature 2' }],
  //                     },
  //                     {
  //                       type: 'p',
  //                       children: [
  //                         {
  //                           text: 'Describe your second amazing feature here with compelling details.',
  //                         },
  //                       ],
  //                     },
  //                   ],
  //                   plaintext:
  //                     'Amazing Feature 2\nDescribe your second amazing feature here with compelling details.',
  //                 },
  //               },
  //               innerBlocks_layout: {
  //                 items: [rightImageId, rightTextId],
  //               },
  //             },
  //           },
  //           innerBlocks_layout: {
  //             items: [leftColId, rightColId],
  //           },
  //         },
  //       },
  //       blocks_layout: {
  //         items: [gridId],
  //       },
  //     };
  //   },
  // },

  // testimonial: {
  //   id: 'testimonial',
  //   title: 'Testimonial',
  //   category: 'content',
  //   description: 'Customer testimonial with quote and attribution',
  //   thumbnail: '/static/section-thumbnails/testimonial.png',
  //   template: () => {
  //     const containerId = generateId();
  //     const quoteId = generateId();
  //     const authorId = generateId();

  //     return {
  //       blocks: {
  //         [containerId]: {
  //           '@type': 'container',
  //           data: {
  //             backgroundColor: '#f8f9fa',
  //             padding: 'large',
  //             textAlign: 'center',
  //           },
  //           innerBlocks: {
  //             [quoteId]: {
  //               '@type': 'slate',
  //               value: [
  //                 {
  //                   type: 'blockquote',
  //                   children: [
  //                     {
  //                       text: '"This service has completely transformed how we do business. Highly recommended!"',
  //                     },
  //                   ],
  //                 },
  //               ],
  //               plaintext:
  //                 '"This service has completely transformed how we do business. Highly recommended!"',
  //             },
  //             [authorId]: {
  //               '@type': 'slate',
  //               value: [
  //                 {
  //                   type: 'p',
  //                   children: [{ text: '— Sarah Johnson, CEO of TechCorp' }],
  //                 },
  //               ],
  //               plaintext: '— Sarah Johnson, CEO of TechCorp',
  //             },
  //           },
  //           innerBlocks_layout: {
  //             items: [quoteId, authorId],
  //           },
  //         },
  //       },
  //       blocks_layout: {
  //         items: [containerId],
  //       },
  //     };
  //   },
  // },

  // contactForm: {
  //   id: 'contactForm',
  //   title: 'Contact Form',
  //   category: 'forms',
  //   description: 'Contact section with form and information',
  //   thumbnail: '/static/section-thumbnails/contact.png',
  //   template: () => {
  //     const headingId = generateId();
  //     const formId = generateId();

  //     return {
  //       blocks: {
  //         [headingId]: {
  //           '@type': 'slate',
  //           value: [
  //             {
  //               type: 'h2',
  //               children: [{ text: 'Get In Touch' }],
  //             },
  //             {
  //               type: 'p',
  //               children: [
  //                 {
  //                   text: "Ready to get started? Send us a message and we'll get back to you soon.",
  //                 },
  //               ],
  //             },
  //           ],
  //           plaintext:
  //             "Get In Touch\nReady to get started? Send us a message and we'll get back to you soon.",
  //         },
  //         [formId]: {
  //           '@type': 'form',
  //           data: {
  //             fields: [
  //               {
  //                 id: 'name',
  //                 label: 'Name',
  //                 type: 'text',
  //                 required: true,
  //               },
  //               {
  //                 id: 'email',
  //                 label: 'Email',
  //                 type: 'email',
  //                 required: true,
  //               },
  //               {
  //                 id: 'message',
  //                 label: 'Message',
  //                 type: 'textarea',
  //                 required: true,
  //               },
  //             ],
  //             submitLabel: 'Send Message',
  //           },
  //         },
  //       },
  //       blocks_layout: {
  //         items: [headingId, formId],
  //       },
  //     };
  //   },
  // },
};

export const sectionCategories = [
  { id: 'all', label: 'All Sections' },
  { id: 'hero', label: 'Hero Sections' },
  { id: 'content', label: 'Content' },
  { id: 'layout', label: 'Layout' },
  { id: 'forms', label: 'Forms' },
];

const getSectionsByCategory = (category = 'all') => {
  if (category === 'all') {
    return Object.values(sectionTemplates);
  }
  return Object.values(sectionTemplates).filter(
    (section) => section.category === category,
  );
};

export { getSectionsByCategory };
