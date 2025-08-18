import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { useHistory } from 'react-router-dom';
import filter from 'lodash/filter';
import find from 'lodash/find';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import { FormattedMessage } from 'react-intl';
import { flattenToAppURL } from '@plone/volto/helpers/Url/Url';
import langmap from '@plone/volto/helpers/LanguageMap/LanguageMap';
import { toBackendLang } from '@plone/volto/helpers/Utils/Utils';
import config from '@plone/volto/registry';

// Import our PageTemplateBrowser
import PageTemplateBrowser from '../../../../../components/PageTemplateBrowser/PageTemplateBrowser';

const Types = ({ types, pathname, content, currentLanguage }) => {
  const { settings } = config;
  const history = useHistory();
  const [showPageBrowser, setShowPageBrowser] = useState(false);

  // Create portal element
  const [portalElement, setPortalElement] = useState(null);

  useEffect(() => {
    const element = document.createElement('div');
    element.id = 'page-template-modal-portal';
    document.body.appendChild(element);
    setPortalElement(element);

    return () => {
      if (element && element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }, []);

  // Debug logging
  console.log('Types component rendered!', { 
    types, 
    typesLength: types?.length, 
    pathname, 
    content,
    showPageBrowser 
  });

  const handleCreatePage = (pageTemplate) => {
    // Extract current path for navigation
    const currentPath = pathname
      .replace(/\/contents$/, '')
      .replace(/\/$/, '');
    
    // Build the route URL for creating the page
    const addContentTypeRoute = `${currentPath}/add?type=${pageTemplate.contentType}`;
    
    // Navigate to the add page
    history.push(addContentTypeRoute);
  };

  const handleOpenPageBrowser = (e) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Button clicked! Current state:', showPageBrowser);
    setShowPageBrowser(true);
    console.log('State set to true');
  };

  return (types && types.length > 0) ||
    (settings.isMultilingual && content['@components'] && content['@components'].translations) ? (
    <>
      <div className="menu-more pastanaga-menu">
        {types && types.length > 0 && (
          <>
            <header>
              <FormattedMessage id="Add Content" defaultMessage="Add Content…" />
            </header>
            <div className="pastanaga-menu-list">
              <ul>
                {/* Add the new "Browse Page Templates" option */}
                <li>
                  <button
                    type="button"
                    onClick={handleOpenPageBrowser}
                    id="toolbar-browse-page-templates"
                    className="item featured-item"
                    style={{
                      background: showPageBrowser ? 'red' : 'linear-gradient(135deg, #094ce1 0%, #073bb8 100%)',
                      color: 'white',
                      fontWeight: '600',
                      borderRadius: '4px',
                      margin: '4px 0',
                      padding: '8px 12px',
                      border: 'none',
                      cursor: 'pointer',
                      width: '100%',
                      textAlign: 'left'
                    }}
                  >
                    🎨 Browse Page Templates {showPageBrowser ? '(OPEN)' : ''}
                  </button>
                </li>
                
                {/* Separator */}
                <li style={{ borderTop: '1px solid #eee', margin: '8px 0', padding: '4px 0' }}>
                  <small style={{ color: '#666', fontSize: '0.8em', padding: '0 12px' }}>
                    <FormattedMessage 
                      id="Or create blank content:" 
                      defaultMessage="Or create blank content:" 
                    />
                  </small>
                </li>

                {/* Original content type links */}
                {map(filter(types), (item) => {
                  // Strip the type for the item we want to add
                  const contentTypeToAdd = item['@id'].split('@types/')[1];
                  // If we are in the root or in /contents, we need to strip the preceeding / and /contents
                  const currentPath = pathname
                    .replace(/\/contents$/, '')
                    .replace(/\/$/, '');
                  // Finally build the route URL
                  const addContentTypeRoute = `${currentPath}/add?type=${contentTypeToAdd}`;
                  return (
                    <li key={item['@id']}>
                      <a
                        href={addContentTypeRoute}
                        id={`toolbar-add-${item['@id']
                          .split('@types/')[1]
                          .toLowerCase()
                          .replace(' ', '-')}`}
                        className="item"
                        key={item.title}
                        style={{ opacity: '0.7' }}
                      >
{item.title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            </div>
          </>
        )}
        
        {/* Multilingual translations section - keep original functionality */}
        {settings.isMultilingual && content['@components'].translations && (
          <>
            <header>
              <FormattedMessage
                id="Add Translation"
                defaultMessage="Add Translation"
              />
            </header>
            <div className="pastanaga-menu-list">
              <ul>
                {map(
                  filter(
                    settings.supportedLanguages,
                    (item) =>
                      !find(
                        content['@components'].translations.items,
                        (trans) => trans.language === item,
                      ),
                  ),
                  (item) => (
                    <li key={item}>
                      <a
                        href={`${pathname}/@add-translation`}
                        className="item"
                      >
                        {langmap[item].nativeName}{' '}
                        {item !== currentLanguage &&
                          `(${langmap[item].englishName})`}
                      </a>
                    </li>
                  ),
                )}
              </ul>
            </div>
          </>
        )}
      </div>

      {/* Debug state indicator */}
      <div style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: showPageBrowser ? 'red' : 'green',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        zIndex: 9999999
      }}>
        Modal State: {showPageBrowser ? 'OPEN' : 'CLOSED'}
      </div>

      {/* Page Template Browser Modal using Portal */}
      {showPageBrowser && portalElement && ReactDOM.createPortal(
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundColor: 'rgba(0,0,0,0.8)',
          zIndex: 2147483647,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          pointerEvents: 'all'
        }}>
          <div style={{
            background: 'white',
            padding: '20px',
            borderRadius: '8px',
            maxWidth: '500px',
            outline: 'none',
            position: 'relative',
            pointerEvents: 'all'
          }}>
            <h2>Test Modal Works with Portal!</h2>
            <p>showPageBrowser: {showPageBrowser.toString()}</p>
            <button onClick={() => setShowPageBrowser(false)}>
              Close
            </button>
          </div>
        </div>,
        portalElement
      )}
    </>
  ) : null;
};

Types.propTypes = {
  types: PropTypes.arrayOf(
    PropTypes.shape({
      '@id': PropTypes.string,
      addable: PropTypes.bool,
      title: PropTypes.string,
    }),
  ).isRequired,
  pathname: PropTypes.string.isRequired,
  content: PropTypes.objectOf(PropTypes.any).isRequired,
  currentLanguage: PropTypes.string,
};

Types.defaultProps = {
  currentLanguage: 'en',
  types: [],
  content: {},
};

export default connect((state) => ({
  currentLanguage: toBackendLang(state.intl.locale),
}))(Types);