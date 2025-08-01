import React from 'react';
import {
  getPanels,
  accordionBlockHasValue as originalAccordionBlockHasValue,
  Icon,
} from '@eeacms/volto-accordion-block/components/manage/Blocks/Accordion/util';
import { Accordion } from 'semantic-ui-react';
import { withBlockExtensions } from '@plone/volto/helpers';
import { useLocation, useHistory } from 'react-router-dom';
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
import { getInlineStyles } from 'lunasites-advanced-styling/StyleWrapper/StyleWrapperView';

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
          const active = isExclusive(id);

          // Extract panel styling - same logic as in CustomAccordionEdit
          const panelStyles = {
            backgroundColor: panel?.panel_backgroundColor,
            textColor: panel?.panel_textColor,
            titleColor: panel?.panel_titleColor,
          };

          // Create inline styles for the panel
          const panelInlineStyles = {
            ...(panelStyles.backgroundColor && {
              background: panelStyles.backgroundColor,
            }),
            ...(panelStyles.titleColor && {
              '--title-color': panelStyles.titleColor,
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
                ...getInlineStyles(panel, props, true),
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
                >
                  <Icon
                    options={titleIcons}
                    name={
                      active
                        ? titleIcons.opened[iconPosition]
                        : titleIcons.closed[iconPosition]
                    }
                  />
                  <span
                    style={{
                      ...(panelStyles.titleColor && {
                        color: panelStyles.titleColor,
                      }),
                    }}
                  >
                    {panel?.panel_title || panel?.title}
                  </span>
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
                      ...(panelStyles.backgroundColor && {
                        background: panelStyles.backgroundColor,
                      }),
                      ...(panelStyles.textColor && {
                        color: panelStyles.textColor,
                      }),
                      ...getInlineStyles(panel, props, true),
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
