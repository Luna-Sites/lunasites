// SemanticUI-free pre-@plone/components

import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector, shallowEqual } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { doesNodeContainClick } from 'semantic-ui-react/dist/commonjs/lib';
import { useIntl, defineMessages, injectIntl } from 'react-intl';
import cx from 'classnames';
import { getBaseUrl, hasApiExpander } from '@plone/volto/helpers';
import config from '@plone/volto/registry';

import { getNavigation } from '@plone/volto/actions';
import NavItem from '@plone/volto/components/theme/Navigation/NavItem';

const messages = defineMessages({
  closeMenu: {
    id: 'Close menu',
    defaultMessage: 'Close menu',
  },
  openFatMenu: {
    id: 'Open menu',
    defaultMessage: 'Open menu',
  },
});

const Navigation = ({ pathname }) => {
  const [desktopMenuOpen, setDesktopMenuOpen] = useState(null);
  const [currentOpenIndex, setCurrentOpenIndex] = useState(null);
  const navigation = useRef(null);
  const dispatch = useDispatch();
  const intl = useIntl();
  const enableFatMenu = config.settings.enableFatMenu;

  const lang = useSelector((state) => state.intl.locale);
  const token = useSelector((state) => state.userSession.token, shallowEqual);
  const items = useSelector((state) => state.navigation.items, shallowEqual);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (navigation.current && doesNodeContainClick(navigation.current, e))
        return;
      closeMenu();
    };

    document.addEventListener('mousedown', handleClickOutside, false);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, false);
    };
  }, []);

  useEffect(() => {
    if (!hasApiExpander('navigation', getBaseUrl(pathname))) {
      dispatch(getNavigation(getBaseUrl(pathname), config.settings.navDepth));
    }
  }, [pathname, token, dispatch]);

  const isActive = (url) => {
    return (url === '' && pathname === '/') || (url !== '' && pathname === url);
  };

  const toggleMenu = (index) => {
    if (desktopMenuOpen === index) {
      setDesktopMenuOpen(null);
      setCurrentOpenIndex(null);
    } else {
      setDesktopMenuOpen(index);
      setCurrentOpenIndex(index);
    }
  };

  const closeMenu = () => {
    setDesktopMenuOpen(null);
    setCurrentOpenIndex(null);
  };

  const handleItemClick = (item, index, e) => {
    // If item has children, toggle dropdown
    if (item.items && item.items.length > 0) {
      e.preventDefault();
      toggleMenu(index);
    } else {
      // If no children, navigate directly
      closeMenu();
    }
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27) {
        closeMenu();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  return (
    <nav
      id="navigation"
      aria-label="navigation"
      className="navigation"
      ref={navigation}
    >
      <div className={'computer large screen widescreen only'}>
        <ul className="desktop-menu">
          {items.filter((item) => item.url !== '' && item.url !== '/').map((item, index) => (
            <li key={item.url}>
              {enableFatMenu ? (
                <>
                  {item.items && item.items.length > 0 ? (
                    <button
                      onClick={(e) => handleItemClick(item, index, e)}
                      className={cx('item', 'has-dropdown', {
                        active: desktopMenuOpen === index,
                        current: pathname === item.url,
                      })}
                      aria-label={intl.formatMessage(messages.openFatMenu)}
                      aria-expanded={desktopMenuOpen === index ? true : false}
                    >
                      <span className="item-text">{item.title}</span>
                      <span className={cx('dropdown-arrow', {
                        'arrow-open': desktopMenuOpen === index
                      })}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M7 10L12 15L17 10H7Z"/>
                        </svg>
                      </span>
                    </button>
                  ) : (
                    <NavLink
                      to={item.url === '' ? '/' : item.url}
                      onClick={() => closeMenu()}
                      className={cx('item', 'nav-link', {
                        active: pathname === item.url,
                      })}
                    >
                      {item.title}
                    </NavLink>
                  )}

                  {item.items && item.items.length > 0 && (
                    <div className="submenu-wrapper">
                      <div
                        className={cx('submenu', {
                          active: desktopMenuOpen === index,
                        })}
                      >
                      <div className="submenu-inner">
                        <NavLink
                          to={item.url === '' ? '/' : item.url}
                          onClick={() => {
                            setDesktopMenuOpen(null);
                            setCurrentOpenIndex(null);
                          }}
                          className="submenu-header"
                        >
                          <h2>{item.nav_title ?? item.title}</h2>
                        </NavLink>
                        <ul>
                          {item.items &&
                            item.items.length > 0 &&
                            item.items.map((subitem) => (
                              <li className="subitem-wrapper" key={subitem.url}>
                                <NavLink
                                  to={subitem.url}
                                  onClick={() => {
                                    setDesktopMenuOpen(null);
                                    setCurrentOpenIndex(null);
                                  }}
                                  className={cx({
                                    current: isActive(subitem.url),
                                  })}
                                >
                                  <span className="left-arrow">&#8212;</span>
                                  <span>
                                    {subitem.nav_title || subitem.title}
                                  </span>
                                </NavLink>
                                <div className="sub-submenu">
                                  <ul>
                                    {subitem.items &&
                                      subitem.items.length > 0 &&
                                      subitem.items.map((subsubitem) => (
                                        <li
                                          className="subsubitem-wrapper"
                                          key={subsubitem.url}
                                        >
                                          <NavLink
                                            to={subsubitem.url}
                                            onClick={() => {
                                              setDesktopMenuOpen(null);
                                              setCurrentOpenIndex(null);
                                            }}
                                            className={cx({
                                              current: isActive(subsubitem.url),
                                            })}
                                          >
                                            <span className="left-arrow">
                                              &#8212;
                                            </span>
                                            <span>
                                              {subsubitem.nav_title ||
                                                subsubitem.title}
                                            </span>
                                          </NavLink>
                                        </li>
                                      ))}
                                  </ul>
                                </div>
                              </li>
                            ))}
                        </ul>
                      </div>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <NavItem item={item} lang={lang} key={item.url} />
              )}
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
};

Navigation.propTypes = {
  pathname: PropTypes.string.isRequired,
};

Navigation.defaultProps = {
  token: null,
};

export default injectIntl(Navigation);
