import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  SparklesIcon,
  DocumentTextIcon,
  BoltIcon,
  ShieldCheckIcon,
  ClockIcon,
  ArrowRightIcon,
  CheckIcon,
} from '@heroicons/react/24/outline';
import Button from '../components/UI/Button';

const HomePage = () => {
  const features = [
    {
      icon: SparklesIcon,
      title: 'AI-Powered Generation',
      description: 'Upload your existing CV or paste text, and our AI will create a comprehensive profile.',
    },
    {
      icon: BoltIcon,
      title: 'Job-Specific Tailoring',
      description: 'Generate CVs and cover letters specifically tailored to each job offer you apply for.',
    },
    {
      icon: DocumentTextIcon,
      title: 'Professional Templates',
      description: 'Choose from modern, professional CV templates designed to impress recruiters.',
    },
    {
      icon: ClockIcon,
      title: 'Save Time',
      description: 'Create multiple tailored applications in minutes instead of hours.',
    },
    {
      icon: ShieldCheckIcon,
      title: 'Privacy First',
      description: 'Your data is secure. Job-specific documents are generated but not stored.',
    },
    {
      icon: CheckIcon,
      title: 'One-Click Download',
      description: 'Download your tailored CVs and cover letters instantly as PDF files.',
    },
  ];

  const steps = [
    {
      number: '01',
      title: 'Upload or Create',
      description: 'Upload your existing CV (PDF/DOCX) or paste your information to create a master CV.',
    },
    {
      number: '02',
      title: 'Add Job Offer',
      description: 'Paste the job description or upload the job offer document you want to apply for.',
    },
    {
      number: '03',
      title: 'AI Magic',
      description: 'Our AI analyzes the job requirements and tailors your CV and cover letter accordingly.',
    },
    {
      number: '04',
      title: 'Download & Apply',
      description: 'Download your optimized CV and cover letter, then submit your application.',
    },
  ];

  return (
    <div className="min-h-screen">      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-blue-50 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Create{' '}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-blue-700">
                  Job-Specific CVs
                </span>
                {' '}with AI
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                Upload your CV once, then generate tailored CVs and cover letters for every job application. 
                Our AI understands job requirements and optimizes your profile accordingly.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/register">
                <Button size="lg" icon={SparklesIcon}>
                  Start Building for Free
                </Button>
              </Link>
              <Button variant="outline" size="lg">
                Watch Demo
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-8 text-sm text-gray-500"
            >
              No credit card required • Free forever • Privacy guaranteed
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Why Choose AI CV Builder?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Leverage the power of artificial intelligence to create compelling, 
              job-specific applications that stand out from the crowd.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="card hover:shadow-lg transition-shadow duration-300"
              >                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Get started in just four simple steps. Our AI does the heavy lifting 
              while you focus on landing your dream job.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.number}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="relative">
                  <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-xl font-bold mx-auto mb-4">
                    {step.number}
                  </div>
                  {index < steps.length - 1 && (
                    <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-300 -translate-y-0.5"></div>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-gray-600">
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Ready to Land Your Dream Job?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of job seekers who have improved their application success rate 
              with AI-powered CV tailoring.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button 
                  variant="secondary" 
                  size="lg" 
                  icon={ArrowRightIcon}
                  iconPosition="right"
                >
                  Get Started Now
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
