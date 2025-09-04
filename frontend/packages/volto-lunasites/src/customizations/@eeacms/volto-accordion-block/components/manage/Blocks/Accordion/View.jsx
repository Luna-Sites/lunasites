import React from 'react';
import {
  getPanels,
  accordionBlockHasValue as originalAccordionBlockHasValue,
  Icon,
} from '@eeacms/volto-accordion-block/components/manage/Blocks/Accordion/util';
import { Accordion } from 'semantic-ui-react';
import { withBlockExtensions } from '@plone/volto/helpers';
import { useLocation, useHistory } from 'react-router-dom';
import { useSelector } from 'react-redux';
import cx from 'classnames';
import { RenderBlocks } from '@plone/volto/components';
import AnimateHeight from 'react-animate-height';
import config from '@plone/volto/registry';
import '@eeacms/volto-accordion-block/components/manage/Blocks/Accordion/editor.less';
import AccordionFilter from '@eeacms/volto-accordion-block/components/manage/Blocks/Accordion/AccordionFilter';
import './title-styles.less';
import {
  getBlocksFieldname,
  getBlocksLayoutFieldname,
  blockHasValue,
} from '@plone/volto/helpers';
import { map } from 'lodash';

// Custom accordionBlockHasValue that handles both old and new data structures
const accordionBlockHasValue = (content) => {
  // Handle new panels structure
  if (!content) return false;

  // Check if it has a title
  if (content.hasOwnProperty('panel_title') && content?.panel_title?.length > 0)
    return true;
  if (content.hasOwnProperty('title') && content?.title?.length > 0)
    return true;

  // For old structure, use original function if blocks_layout exists
  if (content.blocks_layout?.items) {
    return originalAccordionBlockHasValue(content);
  }

  // For new structure, check if there are any blocks with content
  const blocksFieldname = getBlocksFieldname(content);
  const blocksLayoutFieldname = getBlocksLayoutFieldname(content);

  if (content[blocksLayoutFieldname]?.items) {
    const blockValue = map(content[blocksLayoutFieldname].items, (block) => {
      const blockData = content[blocksFieldname]?.[block];
      return blockHasValue(blockData);
    });
    return blockValue.some((item) => item === true);
  }

  return false;
};

const useQuery = (location) => {
  const { search } = location;
  return React.useMemo(() => new URLSearchParams(search), [search]);
};

const View = (props) => {
  const { data, className } = props;
  const location = useLocation();
  const history = useHistory();
  const lunaTheming = useSelector((state) => state.lunaTheming);

  // Handle both old data structure (data.data) and new structure (data.panels)
  const panels = data.panels
    ? data.panels.map((panel, index) => [
        panel['@id'] || `panel-${index}`,
        panel,
      ])
    : getPanels(data.data);

  // Debug logging for data structure

  const metadata = props.metadata || props.properties;
  const diffView =
    location?.pathname.slice(
      location?.pathname.lastIndexOf('/'),
      location?.pathname.length,
    ) === '/diff';

  const [activeIndex, setActiveIndex] = React.useState([]);
  const [activePanel, setActivePanel] = React.useState([]);
  const [filterValue, setFilterValue] = React.useState('');
  const [itemToScroll, setItemToScroll] = React.useState('');
  const accordionConfig = config.blocks.blocksConfig.accordion;
  const { titleIcons } = accordionConfig;
  const iconOnRight = data.right_arrows;
  const iconPosition = iconOnRight ? 'rightPosition' : 'leftPosition';

  // Get accordion theme variations
  const accordionVariations = {
    primary_accordion: {
      titleBg: 'primary_color',
      titleText: 'tertiary_color',
      contentBg: 'background_color',
      contentText: 'neutral_color',
      border: 'none',
    },
    neutral_accordion: {
      titleBg: 'neutral_color',
      titleText: 'tertiary_color',
      contentBg: 'background_color',
      contentText: 'neutral_color',
      border: '1px solid #e1e5e9',
    },
    minimal_accordion: {
      titleBg: 'transparent',
      titleText: 'neutral_color',
      contentBg: 'background_color',
      contentText: 'neutral_color',
      border: '1px solid #f1f3f5',
    },
    inverted_accordion: {
      titleBg: 'neutral_color',
      titleText: 'background_color',
      contentBg: 'transparent',
      contentText: 'neutral_color',
      border: 'none',
    },
    secondary_accent_accordion: {
      titleBg: 'secondary_color',
      titleText: 'tertiary_color',
      contentBg: 'background_color',
      contentText: 'neutral_color',
      border: 'none',
    },
    soft_bordered_accordion: {
      titleBg: 'background_color',
      titleText: 'neutral_color',
      contentBg: 'tertiary_color',
      contentText: 'neutral_color',
      border: '1px solid #e1e5e9',
    },
  };

  const currentTheme = data.accordion_theme || 'primary_accordion';
  const themeStyles =
    accordionVariations[currentTheme] || accordionVariations.primary_accordion;
  const colors = lunaTheming?.data?.colors || {};

  const getColorValue = (colorKey) => {
    if (colorKey === 'transparent') return 'transparent';
    return colors[colorKey] || '#666666';
  };

  const query = useQuery(location);
  const activePanels = query.get('activeAccordion')?.split(',');
  const [firstIdFromPanels] = panels[0] || [];

  const activePanelsRef = React.useRef(activePanels);
  const firstIdFromPanelsRef = React.useRef(firstIdFromPanels);

  const addQueryParam = (key, value) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.set(key, value);
    history.push({
      hash: location.hash,
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };

  const removeQueryParam = (key) => {
    const searchParams = new URLSearchParams(location.search);
    searchParams.delete(key);
    history.push({
      pathname: location.pathname,
      search: searchParams.toString(),
    });
  };

  const isExclusive = (currentPanelId) => {
    return activePanel?.includes?.(currentPanelId);
  };

  const handleClick = (e, itemProps) => {
    const { index, id } = itemProps;
    const newIndex =
      activeIndex.indexOf(index) === -1
        ? data.non_exclusive
          ? [...activeIndex, index]
          : [index]
        : activeIndex.filter((item) => item !== index);

    const newPanel =
      activePanel.indexOf(id) === -1
        ? data.non_exclusive
          ? [...activePanel, id]
          : [id]
        : activePanel.filter((item) => item !== id);

    handleActiveIndex(newIndex, newPanel);
  };

  const handleActiveIndex = (index, id) => {
    setActiveIndex(index);
    setActivePanel(id);
    if (id.length > 0) {
      addQueryParam('activeAccordion', id.join(','));
    } else {
      removeQueryParam('activeAccordion');
    }
  };

  const handleFilteredValueChange = (value) => {
    setFilterValue(value);
  };

  const scrollToElement = () => {
    if (!!activePanels && !!activePanels[0]?.length) {
      let element = document.getElementById(
        activePanels[activePanels.length - 1],
      );
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    !!activePanelsRef.current &&
      setItemToScroll(
        activePanelsRef.current[activePanelsRef.current?.length - 1],
      );
  }, []);

  React.useEffect(() => {
    if (data.collapsed) {
      setActivePanel(activePanelsRef.current || []);
    } else {
      if (!!activePanelsRef.current && !!activePanelsRef.current[0]?.length) {
        setActivePanel(activePanelsRef.current || []);
      } else {
        setActivePanel([
          firstIdFromPanelsRef.current,
          ...(activePanelsRef.current || []),
        ]);
      }
    }
  }, [data.collapsed]);

  return (
    <div className={cx('accordion-block', className)}>
      {data.headline && <h2 className="headline">{data.headline}</h2>}
      {data.filtering && (
        <AccordionFilter
          config={accordionConfig}
          data={data}
          filterValue={filterValue}
          handleFilteredValueChange={handleFilteredValueChange}
        />
      )}
      {panels
        .filter(
          (panel) =>
            !data.filtering ||
            filterValue === '' ||
            (filterValue !== '' &&
              panel[1]?.panel_title
                ?.toLowerCase()
                .includes(filterValue.toLowerCase())) ||
            (filterValue !== '' &&
              panel[1]?.title
                ?.toLowerCase()
                .includes(filterValue.toLowerCase())),
        )
        .map(([id, panel], index) => {
          const active = activeIndex.includes(index) || isExclusive(id);

          // Extract panel styling - combine theme styles with individual panel styles
          const panelStyles = {
            backgroundColor:
              panel?.panel_backgroundColor ||
              getColorValue(themeStyles.contentBg),
            textColor:
              panel?.panel_textColor || getColorValue(themeStyles.contentText),
            titleColor:
              panel?.panel_titleColor || getColorValue(themeStyles.titleText),
            titleBg: getColorValue(themeStyles.titleBg),
          };

          // Create inline styles for the panel
          const panelInlineStyles = {
            ...(themeStyles && themeStyles.border !== 'none' && {
              borderRadius: '8px',
              marginBottom: '8px',
            }),
          };

          return accordionBlockHasValue(panel) ? (
            <Accordion
              key={id}
              id={id}
              exclusive={!data.exclusive}
              className={
                data.styles
                  ? data.styles.theme
                  : accordionConfig?.defaults?.theme
              }
              style={{
                ...panelInlineStyles,
              }}
              {...accordionConfig.options}
            >
              <React.Fragment>
                <Accordion.Title
                  as={data.title_size}
                  active={active}
                  aria-expanded={active}
                  className={cx('accordion-title', {
                    'align-arrow-left': !iconOnRight,
                    'align-arrow-right': iconOnRight,
                  })}
                  index={index}
                  onClick={(e) => handleClick(e, { index, id })}
                  onKeyDown={(e) => {
                    if (e.keyCode === 13 || e.keyCode === 32) {
                      e.preventDefault();
                      handleClick(e, { index, id });
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  style={{
                    color: panelStyles.titleColor,
                    backgroundColor: panelStyles.titleBg,
                    padding: '12px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: themeStyles && themeStyles.border !== 'none' ? '8px 8px 0 0' : '8px',
                    ...(themeStyles && themeStyles.border !== 'none' && {
                      border: themeStyles.border,
                      borderBottom: 'none',
                    }),
                  }}
                >
                  <span 
                    style={{ 
                      fontSize: '14px', 
                      color: panelStyles.titleColor,
                      marginRight: iconOnRight ? '0' : '8px',
                      marginLeft: iconOnRight ? '8px' : '0',
                      transform: active ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease',
                      display: 'inline-block',
                    }}
                  >
                    ▼
                  </span>
                  <span>{panel?.panel_title || panel?.title}</span>
                </Accordion.Title>
                <AnimateHeight
                  animateOpacity
                  duration={500}
                  height={active || diffView ? 'auto' : 0}
                  onTransitionEnd={() => {
                    if (!!activePanels && id === itemToScroll) {
                      scrollToElement();
                      setItemToScroll('');
                    }
                  }}
                >
                  <Accordion.Content
                    active={diffView ? true : active}
                    style={{
                      background: panelStyles.backgroundColor,
                      color: panelStyles.textColor,
                      padding: '16px',
                      ...(themeStyles && themeStyles.border !== 'none' && {
                        border: themeStyles.border,
                        borderTop: '1px solid rgba(255,255,255,0.1)',
                        borderRadius: '0 0 8px 8px',
                      }),
                    }}
                  >
                    <RenderBlocks
                      {...props}
                      metadata={metadata}
                      content={panel}
                    />
                  </Accordion.Content>
                </AnimateHeight>
              </React.Fragment>
            </Accordion>
          ) : (
            ''
          );
        })}
    </div>
  );
};

export default withBlockExtensions(View);
