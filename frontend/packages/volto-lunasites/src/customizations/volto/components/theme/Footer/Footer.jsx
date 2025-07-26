import { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import RenderBlocks from '@plone/volto/components/theme/View/RenderBlocks';
import BlocksForm from '@plone/volto/components/manage/Blocks/Block/BlocksForm';
import { getFooterInherit } from '@plone-collective/volto-footer/actions';
import EditBlockWrapper from '@plone/volto/components/manage/Blocks/Block/EditBlockWrapper';
import { setFormData } from '@plone/volto/actions/form/form';
import './footer.less';

const Footer = () => {
  const dispatch = useDispatch();
  const pathname = useSelector((state) => state.router.location?.pathname);
  const content = useSelector((state) => state.content.data);
  const footerInherit = useSelector(
    (state) =>
      state?.footerInherit?.data?.['collective.volto.footer.editable']?.data
        ?.footer,
  );
  const [selectedBlock, setSelectedBlock] = useState(null);
  const [footerState, setFooterState] = useState(null);
  const blockState = {};

  const isEditable = content?.footer;

  const mode = pathname?.endsWith('/edit') ? 'edit' : 'view';

  useEffect(() => {
    if (pathname) {
      dispatch(getFooterInherit(pathname));
      setSelectedBlock(null);
      setFooterState(null);
    }
  }, [dispatch, pathname, mode]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const getFooterData = useCallback(() => {
    if (footerInherit) {
      return footerInherit;
    }
    return { blocks: {}, blocks_layout: { items: [] } };
  });

  useEffect(() => {
    if (!footerState && footerInherit) {
      setFooterState(getFooterData());
    }
  }, [content, footerInherit, mode, footerState, getFooterData]);

  const handleUpdateFooter = (newData) => {
    if (isEditable) {
      const updatedFooter = {
        ...(footerState || {}),
        ...newData,
      };
      setFooterState(updatedFooter);
      dispatch(
        setFormData({
          ...content,
          footer: updatedFooter,
        }),
      );
    }
  };

  if (mode === 'edit' && isEditable) {
    if (!footerState) return null;

    return (
      <footer className="editable ui vertical padded center aligned segment">
        <div className="blocks-container">
          <BlocksForm
            properties={footerState}
            manage={false}
            selectedBlock={selectedBlock}
            title={''}
            isMainForm={false}
            onSelectBlock={(s) => {
              setSelectedBlock(s);
            }}
            onChangeFormData={(newFormData) => {
              handleUpdateFooter({
                ...footerState,
                ...newFormData,
              });
            }}
            onChangeField={(id, value) => {
              if (['blocks', 'blocks_layout'].indexOf(id) > -1) {
                blockState[id] = value;
                handleUpdateFooter({
                  ...footerState,
                  ...blockState,
                });
              } else {
                handleUpdateFooter({
                  ...footerState,
                  ...{
                    blocks: {
                      [id]: value,
                    },
                  },
                });
              }
            }}
            pathname={pathname}
          >
            {({ draginfo }, editBlock, blockProps) => (
              <EditBlockWrapper
                draginfo={draginfo}
                blockProps={blockProps}
                disabled={false}
              >
                {editBlock}
              </EditBlockWrapper>
            )}
          </BlocksForm>
        </div>
      </footer>
    );
  }

  const footerData = getFooterData();

  if (!footerData?.blocks || Object.keys(footerData.blocks).length === 0) {
    return null;
  }

  return (
    <footer className="ui vertical  center aligned segment">
      <div className="blocks-container">
        <RenderBlocks content={footerData} />
      </div>
    </footer>
  );
};

export default Footer;
