import React, { useState, useEffect } from 'react';
import {
  Modal,
  Form,
  Button,
  Input,
  TextArea,
  Header,
  Message,
  Dropdown,
} from 'semantic-ui-react';
import { defineMessages, injectIntl } from 'react-intl';
import Icon from '@plone/volto/components/theme/Icon/Icon';
import saveSVG from '@plone/volto/icons/save.svg';
import clearSVG from '@plone/volto/icons/clear.svg';

const messages = defineMessages({
  saveSectionTitle: {
    id: 'saveSectionTitle',
    defaultMessage: 'Save Section as Template',
  },
  sectionName: {
    id: 'sectionName',
    defaultMessage: 'Section Name',
  },
  sectionDescription: {
    id: 'sectionDescription',
    defaultMessage: 'Description (optional)',
  },
  sectionCategory: {
    id: 'sectionCategory',
    defaultMessage: 'Category',
  },
  save: {
    id: 'save',
    defaultMessage: 'Save',
  },
  cancel: {
    id: 'cancel',
    defaultMessage: 'Cancel',
  },
  nameRequired: {
    id: 'nameRequired',
    defaultMessage: 'Section name is required',
  },
  saveError: {
    id: 'saveError',
    defaultMessage: 'Error saving section. Please try again.',
  },
});

const SaveSectionModal = ({
  open,
  onClose,
  onSave,
  intl,
  loading = false,
  existingCategories = [],
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [error, setError] = useState('');
  const [categoryOptions, setCategoryOptions] = useState([]);

  // Update category options when existingCategories change
  useEffect(() => {
    const options = existingCategories.map((cat) => ({
      key: cat,
      value: cat,
      text: cat,
    }));
    setCategoryOptions(options);
  }, [existingCategories]);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setError(intl.formatMessage(messages.nameRequired));
      return;
    }

    const sectionData = {
      name: name.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
    };

    try {
      await onSave(sectionData);
      // Reset form
      setName('');
      setDescription('');
      setCategory('');
      setError('');
      onClose();
    } catch (err) {
      setError(intl.formatMessage(messages.saveError));
    }
  };

  const handleClose = () => {
    setName('');
    setDescription('');
    setCategory('');
    setError('');
    onClose();
  };

  const handleAddCategory = (e, { value }) => {
    // Add new category to options if it doesn't exist
    const newOption = { key: value, value: value, text: value };
    if (!categoryOptions.find((opt) => opt.value === value)) {
      setCategoryOptions([...categoryOptions, newOption]);
    }
    setCategory(value);
  };

  return (
    <Modal open={open} onClose={handleClose} size="small">
      <Header>
        <Icon name={saveSVG} size="24px" />
        {intl.formatMessage(messages.saveSectionTitle)}
      </Header>

      <Modal.Content>
        <Form>
          <Form.Field>
            <label>{intl.formatMessage(messages.sectionName)}</label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter section name"
              autoFocus
            />
          </Form.Field>

          <Form.Field>
            <label>{intl.formatMessage(messages.sectionCategory)}</label>
            <Dropdown
              placeholder="Select or type a category"
              search
              selection
              allowAdditions
              value={category}
              options={categoryOptions}
              onAddItem={handleAddCategory}
              onChange={(e, { value }) => setCategory(value)}
            />
          </Form.Field>

          <Form.Field>
            <label>{intl.formatMessage(messages.sectionDescription)}</label>
            <TextArea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter optional description"
              rows={3}
            />
          </Form.Field>

          {error && <Message error>{error}</Message>}
        </Form>
      </Modal.Content>

      <Modal.Actions>
        <Button basic onClick={handleClose} disabled={loading}>
          <Icon name={clearSVG} size="18px" />
          {intl.formatMessage(messages.cancel)}
        </Button>

        <Button
          primary
          onClick={handleSubmit}
          loading={loading}
          disabled={loading}
        >
          <Icon name={saveSVG} size="18px" />
          {intl.formatMessage(messages.save)}
        </Button>
      </Modal.Actions>
    </Modal>
  );
};

export default injectIntl(SaveSectionModal);
