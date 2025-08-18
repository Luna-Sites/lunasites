import React, { useCallback, useState } from 'react';
import PropTypes from 'prop-types';
import { useIntl } from 'react-intl';

// Component imports
import { Button, Tabs, CloseIcon } from '@plone/components';
import {
  Tab,
  TabList,
  TabPanel,
  Modal,
  ModalOverlay,
} from 'react-aria-components';
import Icon from '@plone/volto/components/theme/Icon/Icon';

// Local component imports
import PageTemplateCard from './PageTemplateCard';
import { pageCategories, subCategories, getPagesByCategory } from './pageTemplates';

// Icons
import plusSVG from '@plone/volto/icons/circle-plus.svg';

// Styles
import './PageTemplateStyles.less';

const PageTemplateBrowser = React.memo(
  ({
    open,
    onClose,
    onCreatePage,
    // Additional props for compatibility
    currentPath = '/',
  }) => {
    const intl = useIntl();
    const [selectedMainCategory, setSelectedMainCategory] = useState('section-based');
    const [selectedSubCategory, setSelectedSubCategory] = useState('all');

    console.log('PageTemplateBrowser render:', { selectedMainCategory, selectedSubCategory });

    const handleCreatePage = useCallback(
      (pageTemplate) => {
        // Call the parent callback with the selected template
        if (onCreatePage) {
          onCreatePage(pageTemplate);
        }
        onClose();
      },
      [onCreatePage, onClose],
    );

    return (
      <ModalOverlay
        isOpen={open}
        onOpenChange={(isOpen) => {
          if (!isOpen) {
            onClose();
          }
        }}
        isDismissable={true}
        isKeyboardDismissDisabled={false}
        className="modal-overlay"
      >
        <Modal className="page-template-browser-modal">
          <div className="modal-header">
            <h2 className="modal-title">
              <Icon name={plusSVG} size="24px" />
              <span>Create New Page</span>
            </h2>
            <Button
              className="close-button"
              aria-label="Close"
              onClick={onClose}
              isQuiet
            >
              <Icon name={CloseIcon} size="32px" />
            </Button>
          </div>

          <div className="modal-content">
            <div className="layout-container">
              {/* Sidebar with Main Categories */}
              <div className="categories-sidebar">
                <div className="categories-list">
                  {pageCategories.map((category) => (
                    <div 
                      key={category.id}
                      className={`category-item ${selectedMainCategory === category.id ? 'active' : ''}`}
                      onClick={() => setSelectedMainCategory(category.id)}
                    >
                      <h3>{category.label}</h3>
                    </div>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div className="content-area">
                {/* Category Explanation - Always visible */}
                <div className="category-explanation" style={{
                  margin: '210px 0 20px 0'
                }}>
                  <h3>
                    {selectedMainCategory === 'section-based' ? 'Section Based Pages' :
                     selectedMainCategory === 'linear-blocks' ? 'Linear Blocks Pages' :
                     selectedMainCategory === 'free-grid' ? 'Free Grid Pages' : 'Section Based Pages'}
                  </h3>
                  <p>
                    {selectedMainCategory === 'section-based' ? 'Build pages with reusable sections - hero, testimonials, services. Perfect for landing pages and structured content.' :
                     selectedMainCategory === 'linear-blocks' ? 'Traditional vertical layout with stacked content blocks. Classic format for blog posts, articles, and simple pages.' :
                     selectedMainCategory === 'free-grid' ? 'Flexible drag & drop layout like Wix. Position elements anywhere on the page for creative and unique designs. Coming soon!' : 'Build pages with reusable sections - hero, testimonials, services. Perfect for landing pages and structured content.'}
                  </p>
                </div>

                {/* Sub Category Tabs - Always visible */}
                <div className="sub-category-filter">
                  <label>Content type:</label>
                  <div className="sub-category-tabs">
                    {subCategories.map((subCat) => (
                      <button
                        key={subCat.id}
                        className={`sub-tab ${selectedSubCategory === subCat.id ? 'active' : ''}`}
                        onClick={() => setSelectedSubCategory(subCat.id)}
                      >
                        {subCat.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Pages Grid */}
                <div className="pages-grid">
                  {getPagesByCategory(selectedMainCategory, selectedSubCategory).map((pageTemplate) => (
                    <PageTemplateCard
                      key={pageTemplate.id}
                      pageTemplate={pageTemplate}
                      onSelect={handleCreatePage}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </Modal>
      </ModalOverlay>
    );
  },
);

PageTemplateBrowser.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onCreatePage: PropTypes.func.isRequired,
  currentPath: PropTypes.string,
};

PageTemplateBrowser.defaultProps = {
  currentPath: '/',
};

export default PageTemplateBrowser;