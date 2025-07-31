import cx from 'classnames';
import React from 'react';
import AnimateHeight from 'react-animate-height';
import { Accordion, Input } from 'semantic-ui-react';
import { Icon } from '@eeacms/volto-accordion-block/components/manage/Blocks/Accordion/util';
import config from '@plone/volto/registry';
import { defineMessages, injectIntl } from 'react-intl';
import './title-styles.less';
import { getInlineStyles } from 'lunasites-advanced-styling/StyleWrapper/StyleWrapperView';

const messages = defineMessages({
  EnterTitle: {
    id: 'Enter Title',
    defaultMessage: 'Enter Title',
  },
});

const CustomAccordionEdit = (props) => {
  const {
    children,
    handleTitleChange,
    handleTitleClick,
    uid,
    panel,
    data,
    index,
    intl,
  } = props;
  const [activeIndex, setActiveIndex] = React.useState([0]);
  const accordionConfig = config.blocks.blocksConfig.accordion;
  const { titleIcons } = accordionConfig;
  const isActive = activeIndex.includes(index);
  const iconOnRight = data.right_arrows;
  const iconPosition = iconOnRight ? 'rightPosition' : 'leftPosition';

  const handleClick = (e, itemProps) => {
    const { index } = itemProps;
    if (data.non_exclusive) {
      const newIndex =
        activeIndex.indexOf(index) === -1
          ? [...activeIndex, index]
          : activeIndex.filter((item) => item !== index);

      setActiveIndex(newIndex);
    } else {
      const newIndex =
        activeIndex.indexOf(index) === -1
          ? [index]
          : activeIndex.filter((item) => item !== index);

      setActiveIndex(newIndex);
    }
  };

  React.useEffect(() => {
    return data.collapsed ? setActiveIndex([]) : setActiveIndex([0]);
  }, [data.collapsed]);

  // Extract panel styling - same logic as in View
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

  return (
    <Accordion
      className={
        data.styles ? data.styles.theme : accordionConfig?.defaults?.theme
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
          active={isActive}
          index={index}
          onClick={handleClick}
          className={cx('accordion-title', {
            'align-arrow-left': !iconOnRight,
            'align-arrow-right': iconOnRight,
            'custom-title-color': panelStyles.titleColor,
          })}
        >
          <Icon
            options={titleIcons}
            name={
              isActive
                ? titleIcons.opened[iconPosition]
                : titleIcons.closed[iconPosition]
            }
          />
          {!data.readOnlyTitles ? (
            <Input
              fluid
              className="input-accordion-title"
              transparent
              placeholder={intl.formatMessage(messages.EnterTitle)}
              value={panel?.panel_title || panel?.title || ''}
              onClick={(e) => {
                handleTitleClick();
                e.stopPropagation();
              }}
              onChange={(e) => handleTitleChange(e, [uid, panel])}
            />
          ) : (
            <span>{panel?.panel_title || panel?.title}</span>
          )}
        </Accordion.Title>
        <AnimateHeight
          animateOpacity
          duration={500}
          height={isActive ? 'auto' : 0}
        >
          <Accordion.Content
            active={isActive}
            style={{
              ...(panelStyles.backgroundColor && {
                background: panelStyles.backgroundColor,
              }),
              ...(panelStyles.textColor && { color: panelStyles.textColor }),
              ...getInlineStyles(panel, props, true),
            }}
          >
            {children}
          </Accordion.Content>
        </AnimateHeight>
      </React.Fragment>
    </Accordion>
  );
};

export default injectIntl(CustomAccordionEdit);
