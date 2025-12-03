import React from 'react';
import Link from 'next/link';

interface NavigationCardProps {
  title: string;
  description: string;
  href: string;
  icon: React.ReactNode;
}

interface AnnouncementProps {
  title: string;
  message: string;
  date: string;
  author: string;
}

const NavigationCard: React.FC<NavigationCardProps> = ({ title, description, href, icon }) => (
  <Link href={href} className="group">
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow duration-200 border border-gray-200">
      <div className="flex items-center space-x-4">
        <div className="text-[#0E5791] group-hover:text-blue-700 transition-colors">
          {icon}
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-[#0E5791] transition-colors">
            {title}
          </h3>
          <p className="text-gray-600 mt-1">{description}</p>
        </div>
        <div className="text-gray-400 group-hover:text-[#0E5791] transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </Link>
);

const AnnouncementItem: React.FC<AnnouncementProps> = ({ title, message, date, author }) => (
  <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
    <div className="flex items-start justify-between">
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-gray-600 mt-1 text-sm">{message}</p>
        <div className="flex items-center space-x-2 mt-2 text-xs text-gray-500">
          <span>By {author}</span>
          <span>•</span>
          <span>{date}</span>
        </div>
      </div>
      <div className="ml-4">
        <svg className="w-5 h-5 text-[#0E5791]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
        </svg>
      </div>
    </div>
  </div>
);

export default function Homepage() {
  const navigationSections = [
    {
      title: "Investment Teams",
      description: "Access sector-specific investment teams and research divisions",
      href: "/teams",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      )
    },
    {
      title: "Website Dashboard",
      description: "Administrative tools and platform management",
      href: "/admin-dashboard",
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      )
    },
    {
      title: "PDF Parser",
      description: "PDF parser for bank statements",
      href: "/pdf-parser", // Placeholder for future link
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>

      ) 
    },
    {
      title: "Google Drive",
      description: "Access shared documents and resources quickly",
      href: "https://uwin365.sharepoint.com/sites/jsosif/Shared%20Documents/Forms/AllItems.aspx", 
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
        </svg>
      )
    }
  ];

  const announcements: AnnouncementProps[] = [
    {
      title: "Example Announcement",
      message: "This is an example announcement.",
      date: "February 31st 3037",
      author: "JSOSIF C-Suite"
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-[#0E5791] text-white py-8 pt-[9rem]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome to the Homepage!</h1>
              <p className="text-blue-100 mt-2">
                This is the homepage for the JSOSIF website.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {navigationSections.map((section, index) => (
            <NavigationCard
              key={index}
              title={section.title}
              description={section.description}
              href={section.href}
              icon={section.icon}
            />
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Important Updates</h2>
          </div>
          
          <div className="space-y-4">
            {announcements.map((announcement, index) => (
              <AnnouncementItem
                key={index}
                title={announcement.title}
                message={announcement.message}
                date={announcement.date}
                author={announcement.author}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}