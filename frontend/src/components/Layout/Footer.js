import React from 'react';
import { Link } from 'react-router-dom';
import {
  SparklesIcon,
  HeartIcon,
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                AI CV Builder
              </span>
            </div>
            <p className="text-gray-600 mb-4 max-w-md">
              Create professional CVs and cover letters tailored to specific job offers 
              with the power of AI. Build once, customize for every opportunity.
            </p>
            <div className="flex items-center space-x-1 text-sm text-gray-500">
              <span>Made with</span>
              <HeartIcon className="w-4 h-4 text-red-500" />
              <span>for job seekers everywhere</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  to="/dashboard"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  to="/cv-builder"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  CV Builder
                </Link>
              </li>
              <li>
                <Link
                  to="/profile"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Profile
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-4">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="#help"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="#contact"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#privacy"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#terms"
                  className="text-sm text-gray-600 hover:text-primary-600 transition-colors duration-200"
                >
                  Terms of Service
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-gray-500">
              © {currentYear} AI CV Builder. All rights reserved.
            </p>
            <div className="flex items-center space-x-6 mt-4 md:mt-0">
              <a
                href="#github"
                className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-200"
              >
                GitHub
              </a>
              <a
                href="#twitter"
                className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-200"
              >
                Twitter
              </a>
              <a
                href="#linkedin"
                className="text-sm text-gray-500 hover:text-primary-600 transition-colors duration-200"
              >
                LinkedIn
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
