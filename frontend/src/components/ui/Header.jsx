import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const Header = () => {
  const navigate = useNavigate();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border">
      <div className="h-16 px-4 md:px-6 lg:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
            <Icon name="Waves" size={22} color="#FFFFFF" />
          </div>
          <div>
            <div className="text-base md:text-lg font-semibold text-foreground">EchoWatch</div>
            <div className="caption text-muted-foreground">Environmental Monitoring System</div>
          </div>
        </div>

        <Button
          variant="outline"
          iconName="LogIn"
          iconPosition="left"
          onClick={() => navigate('/login')}
        >
          Login
        </Button>
      </div>
    </header>
  );
};

export default Header;
