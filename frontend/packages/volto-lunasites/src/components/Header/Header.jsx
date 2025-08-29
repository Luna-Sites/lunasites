// SemanticUI-free pre-@plone/components
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { Container } from '@plone/components';
import MobileNavigation from '../MobileNavigation/MobileNavigation';
import { useIntl, defineMessages } from 'react-intl';
import config from '@plone/volto/registry';
import cx from 'classnames';
import IntranetSearchWidget from '../SearchWidget/IntranetSearchWidget';

import {
  Anontools,
  LanguageSelector,
  Logo,
  Navigation,
  SearchWidget,
  UniversalLink,
} from '@plone/volto/components';

const messages = defineMessages({
  siteLabel: {
    id: 'siteLabel',
    defaultMessage: ' ',
  },
});

const InternetHeader = ({ pathname, siteLabel, token, siteAction, toolsHeader, designSchemaData }) => {
  // Check if we should show tools wrapper - only show toolsHeader, not siteAction
  const hasTools = true;
  
  return (
    <>
      <div className="header">
        {hasTools && (
          <div className="tools-wrapper">
            <LanguageSelector />

            <div className="tools">
              {!token && !designSchemaData?.hide_login_button && <Anontools />}
              {toolsHeader &&
                toolsHeader.map((item) => (
                  <UniversalLink key={item['@id'] || item.href} href={item.href}>
                    {item.title}
                  </UniversalLink>
                ))}
            </div>
            {siteLabel && (
              <div className="intranet">
                <p>{siteLabel}</p>
              </div>
            )}
          </div>
        )}
        <div className="logo-nav-wrapper">
          <div className="logo">
            <Logo />
          </div>
          <Navigation pathname={pathname} />
          <MobileNavigation pathname={pathname} designSchemaData={designSchemaData} />
          <div className={cx("search-wrapper navigation-desktop", {
            "hidden": designSchemaData?.hide_search_button
          })}>
            <div className="search">
              <SearchWidget />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

const IntranetHeader = ({ pathname, siteLabel, token, siteAction, toolsHeader, designSchemaData }) => {
  // Check if we should show tools wrapper - only show toolsHeader, not siteAction
  const hasTools = true;
  
  return (
    <>
      <div className="header">
        {hasTools && (
          <div className="tools-wrapper">
            <LanguageSelector />

            <div className="tools">
              {!token && !designSchemaData?.hide_login_button && <Anontools />}
              {toolsHeader &&
                toolsHeader.map((item) => (
                  <UniversalLink key={item['@id'] || item.href} href={item.href}>
                    {item.title}
                  </UniversalLink>
                ))}
            </div>
            {siteLabel && (
              <div className="intranet">
                <p>{siteLabel}</p>
              </div>
            )}
          </div>
        )}
        <div className="logo-nav-wrapper">
          <div className="logo">
            <Logo />
          </div>
          <div className={cx("search-wrapper", {
            "hidden": designSchemaData?.hide_search_button
          })}>
            <div className="search">
              <IntranetSearchWidget />
            </div>
          </div>
          <Navigation pathname={pathname} />
          <MobileNavigation pathname={pathname} designSchemaData={designSchemaData} />
        </div>
      </div>
    </>
  );
};

const Header = (props) => {
  const { pathname } = props;
  let siteLabel = config.settings.siteLabel;
  const intranetHeader = config.settings.intranetHeader;
  const token = useSelector((state) => state.userSession.token);
  const siteAction = useSelector(
    (state) => state.content.data?.['@components']?.actions?.site_actions,
  );
  const toolsHeader = useSelector(
    (state) => state.content.data?.tools_header,
  );
  const designSchemaData = useSelector(
    (state) =>
      state?.designSchema?.data?.[
        'lunasites.behaviors.design_schema.IDesignSchema'
      ]?.data,
  );
  const lunaTheming = useSelector((state) => state.lunaTheming);
  const intl = useIntl();
  const translatedSiteLabel = intl.formatMessage(messages.siteLabel);

  siteLabel =
    siteLabel &&
    (translatedSiteLabel !== 'siteLabel' && translatedSiteLabel !== ' '
      ? translatedSiteLabel
      : siteLabel);

  return (
    <header
      className={cx('header-wrapper', { 'intranet-header': intranetHeader })}
    >
      <Container layout>
        {intranetHeader ? (
          <IntranetHeader
            pathname={pathname}
            siteLabel={siteLabel}
            token={token}
            siteAction={siteAction}
            toolsHeader={toolsHeader}
            designSchemaData={designSchemaData}
            lunaTheming={lunaTheming}
          />
        ) : (
          <InternetHeader
            pathname={pathname}
            siteLabel={siteLabel}
            token={token}
            siteAction={siteAction}
            toolsHeader={toolsHeader}
            designSchemaData={designSchemaData}
            lunaTheming={lunaTheming}
          />
        )}
      </Container>
    </header>
  );
};

Header.propTypes = {
  token: PropTypes.string,
  pathname: PropTypes.string.isRequired,
};

Header.defaultProps = {
  token: null,
};

export default Header;
