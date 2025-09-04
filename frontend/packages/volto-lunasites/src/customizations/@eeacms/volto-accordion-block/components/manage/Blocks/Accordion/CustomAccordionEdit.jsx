import cx from 'classnames';
import React from 'react';
import AnimateHeight from 'react-animate-height';
import { Accordion, Input } from 'semantic-ui-react';
import { Icon } from '@eeacms/volto-accordion-block/components/manage/Blocks/Accordion/util';
import config from '@plone/volto/registry';
import { defineMessages, injectIntl } from 'react-intl';
import './title-styles.less';
import { useSelector } from 'react-redux';

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
    themeStyles,
    getColorValue,
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

  // Extract panel styling - combine theme styles with individual panel styles
  const panelStyles = {
    backgroundColor:
      panel?.panel_backgroundColor ||
      (themeStyles ? getColorValue(themeStyles.contentBg) : undefined),
    textColor:
      panel?.panel_textColor ||
      (themeStyles ? getColorValue(themeStyles.contentText) : undefined),
    titleColor:
      panel?.panel_titleColor ||
      (themeStyles ? getColorValue(themeStyles.titleText) : undefined),
    titleBg: themeStyles ? getColorValue(themeStyles.titleBg) : undefined,
    border: themeStyles ? themeStyles.border : undefined,
  };

  // Create inline styles for the panel
  const panelInlineStyles = {
    ...(panelStyles.backgroundColor && {
      background: panelStyles.backgroundColor,
    }),
    ...(themeStyles &&
      themeStyles.border !== 'none' && {
        border: themeStyles.border,
      }),
    borderRadius: '8px',
    marginBottom: '8px',
  };

  return (
    <Accordion
      className={
        data.styles ? data.styles.theme : accordionConfig?.defaults?.theme
      }
      style={{
        ...panelInlineStyles,
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
          })}
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
              transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
              transition: 'transform 0.3s ease',
              display: 'inline-block',
            }}
          >
            ▼
          </span>
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
              style={{
                color: panelStyles.titleColor,
                fontSize: '16px',
                fontWeight: '500',
                background: 'transparent',
                border: 'none',
                flex: 1,
              }}
            />
          ) : (
            <span
              style={{
                color: panelStyles.titleColor,
                fontSize: '16px',
                fontWeight: '500',
                flex: 1,
              }}
            >
              {panel?.panel_title || panel?.title}
            </span>
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
              background: panelStyles.backgroundColor,
              color: panelStyles.textColor,
              padding: '16px',
              ...(themeStyles &&
                themeStyles.border !== 'none' && {
                  borderTop: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '0 0 8px 8px',
                }),
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
