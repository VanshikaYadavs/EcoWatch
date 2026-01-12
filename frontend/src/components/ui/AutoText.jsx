import React from 'react';
import { useAutoTranslate } from '../../utils/useAutoTranslate';

/**
 * AutoText - Renders manual i18n translation when available, otherwise falls back to API translation.
 * Props:
 * - i18nKey: translation key to resolve
 * - defaultText: English/default text to display immediately and use for API translation when key is missing
 */
const AutoText = ({ i18nKey, defaultText }) => {
  const text = useAutoTranslate(i18nKey, defaultText, true);
  return <>{text}</>;
};

export default AutoText;
