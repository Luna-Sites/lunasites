/**
 * Custom sections actions.
 * @module actions/customSections
 */

export const SAVE_CUSTOM_SECTION = 'SAVE_CUSTOM_SECTION';
export const GET_CUSTOM_SECTIONS = 'GET_CUSTOM_SECTIONS';
export const DELETE_CUSTOM_SECTION = 'DELETE_CUSTOM_SECTION';

/**
 * Save custom section function.
 * @function saveCustomSection
 * @param {Object} sectionData Section data to save.
 * @returns {Object} Save custom section action.
 */
export function saveCustomSection(sectionData) {
  return {
    type: SAVE_CUSTOM_SECTION,
    request: {
      op: 'post',
      path: '/@custom-sections',
      data: sectionData,
    },
  };
}

/**
 * Get custom sections function.
 * @function getCustomSections
 * @returns {Object} Get custom sections action.
 */
export function getCustomSections() {
  return {
    type: GET_CUSTOM_SECTIONS,
    request: {
      op: 'get',
      path: '/@custom-sections',
    },
  };
}

/**
 * Delete custom section function.
 * @function deleteCustomSection
 * @param {string} sectionId Section ID to delete.
 * @returns {Object} Delete custom section action.
 */
export function deleteCustomSection(sectionId) {
  return {
    type: DELETE_CUSTOM_SECTION,
    request: {
      op: 'del',
      path: `/@custom-sections/${sectionId}`,
    },
  };
}