'use client';

import React from 'react';
import Image from 'next/image';
import { User } from 'lucide-react';
import { useAuthContext } from '@/context/AuthContext';

interface UserProfileCardProps {
  isOpen: boolean;
}

const UserProfileCard: React.FC<UserProfileCardProps> = ({ isOpen }) => {
  const { user } = useAuthContext();

  if (!user) return null;

  const firstName = user.user_metadata?.first_name || '';
  const lastName = user.user_metadata?.last_name || '';
  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User';
  const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase() || 'U';

  return (
    <div className={`flex items-center gap-3 p-2 rounded-md ${!isOpen ? 'md:justify-center' : ''}`}>
      {avatarUrl ? (
        <Image
          src={avatarUrl}
          alt={fullName}
          width={36}
          height={36}
          className="rounded-full object-cover flex-shrink-0"
        />
      ) : (
        <div className="w-9 h-9 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center flex-shrink-0">
          <span className="text-sm font-medium text-zinc-600 dark:text-zinc-300">
            {initials}
          </span>
        </div>
      )}
      {isOpen && (
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
            {fullName}
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
            {user.email}
          </span>
        </div>
      )}
    </div>
  );
};

export default UserProfileCard;
