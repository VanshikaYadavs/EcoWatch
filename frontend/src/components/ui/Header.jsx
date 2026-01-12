import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  
  // Force English as default if language is not explicitly set
  React.useEffect(() => {
    if (i18n.language !== 'en' && i18n.language !== 'hi' && i18n.language !== 'mr' && i18n.language !== 'gu' && i18n.language !== 'pa') {
      i18n.changeLanguage('en');
    }
  }, [i18n]);
  
  const [lang, setLang] = useState(i18n.language || 'en');

  const changeLang = (e) => {
    const l = e.target.value;
    setLang(l);
    i18n.changeLanguage(l);
    try { localStorage.setItem('i18nextLng', l); } catch (e) {}
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="h-16 px-4 md:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Icon name="Waves" size={22} color="#FFFFFF" />
          </div>
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">{t('app.title')}</div>
            <div className="caption text-muted-foreground">{t('app.subtitle')}</div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <select
            aria-label="Select language"
            value={lang}
            onChange={changeLang}
            className="input caption">
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
            <option value="gu">ગુજરાતી</option>
            <option value="pa">ਪੰਜਾਬੀ</option>
          </select>

          <Button
            variant="outline"
            iconName="LogIn"
            iconPosition="left"
            onClick={() => navigate('/login')}
          >
            {t('login')}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
