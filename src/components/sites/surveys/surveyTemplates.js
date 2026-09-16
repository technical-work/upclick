export const SURVEY_TEMPLATES = [
  {
    id: 'tpl_customer_satisfaction',
    name: 'Customer Satisfaction Survey (CSAT & NPS)',
    description: 'Measure customer happiness, loyalty, and net promoter score with a multi-step survey.',
    category: 'Feedback',
    icon: '⭐',
    slides: [
      {
        id: 'slide_1',
        title: 'Overall Experience',
        subtitle: 'How would you rate your overall satisfaction with our service?',
        elements: [
          {
            id: 'q_nps',
            type: 'nps',
            label: 'How likely are you to recommend UpKlick to a friend or colleague? (0 = Not likely, 10 = Extremely likely)',
            required: true
          },
          {
            id: 'q_rating',
            type: 'rating',
            label: 'How would you rate the quality of our customer support?',
            maxRating: 5,
            required: true
          }
        ],
        buttonText: 'Next'
      },
      {
        id: 'slide_2',
        title: 'Detailed Feedback',
        subtitle: 'Tell us a bit more about your experience.',
        elements: [
          {
            id: 'q_features',
            type: 'checkbox',
            label: 'Which features do you find most valuable?',
            options: ['Visual Page Builder', 'CRM & Outreach', 'Surveys & Forms', 'Store & Checkout', 'Automations & AI'],
            required: false
          },
          {
            id: 'q_improvements',
            type: 'textarea',
            label: 'What could we improve to make your experience better?',
            placeholder: 'Share any ideas or suggestions...',
            required: false
          }
        ],
        buttonText: 'Next'
      },
      {
        id: 'slide_3',
        title: 'Contact Details',
        subtitle: 'Leave your email if you’d like us to follow up with you.',
        elements: [
          {
            id: 'q_name',
            type: 'full_name',
            label: 'Your Name (Optional)',
            placeholder: 'John Doe',
            required: false
          },
          {
            id: 'q_email',
            type: 'email',
            label: 'Email Address (Optional)',
            placeholder: 'john@example.com',
            required: false
          }
        ],
        buttonText: 'Submit Survey'
      }
    ],
    settings: {
      progressBar: true,
      autoAdvance: false,
      showBackButton: true,
      buttonColor: '#2563eb',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      borderRadius: '16px',
      successTitle: 'Thank You for Your Feedback! 🎉',
      successMessage: 'Your responses have been recorded and help us build a better experience for you.'
    }
  },
  {
    id: 'tpl_lead_qualification',
    name: 'B2B Lead Qualification & Discovery',
    description: 'Qualify high-value prospects, determine budget, company size, and urgency before booking a call.',
    category: 'Sales',
    icon: '🎯',
    slides: [
      {
        id: 'slide_1',
        title: 'Company Information',
        subtitle: 'Tell us a bit about your business to get started.',
        elements: [
          {
            id: 'q_company_size',
            type: 'radio',
            label: 'What is the size of your company?',
            options: ['1-10 employees', '11-50 employees', '51-200 employees', '201+ employees'],
            required: true
          },
          {
            id: 'q_industry',
            type: 'dropdown',
            label: 'What industry does your business operate in?',
            options: ['Technology & SaaS', 'E-commerce & Retail', 'Consulting & Agency', 'Healthcare & Medical', 'Real Estate', 'Other'],
            required: true
          }
        ],
        buttonText: 'Continue'
      },
      {
        id: 'slide_2',
        title: 'Goals & Budget',
        subtitle: 'What are you looking to achieve in the next 90 days?',
        elements: [
          {
            id: 'q_primary_goal',
            type: 'radio',
            label: 'What is your primary growth goal?',
            options: ['Generate more qualified leads', 'Automate customer outreach & emails', 'Launch high-converting landing pages', 'Scale existing marketing funnels'],
            required: true
          },
          {
            id: 'q_monthly_budget',
            type: 'radio',
            label: 'What is your estimated monthly marketing budget?',
            options: ['Under $1,000 / mo', '$1,000 - $5,000 / mo', '$5,000 - $15,000 / mo', '$15,000+ / mo'],
            required: true
          }
        ],
        buttonText: 'Continue'
      },
      {
        id: 'slide_3',
        title: 'Contact & Booking',
        subtitle: 'Where should we send your customized proposal and strategy report?',
        elements: [
          {
            id: 'q_full_name',
            type: 'full_name',
            label: 'Full Name',
            placeholder: 'Alex Morgan',
            required: true
          },
          {
            id: 'q_work_email',
            type: 'email',
            label: 'Work Email Address',
            placeholder: 'alex@company.com',
            required: true
          },
          {
            id: 'q_phone',
            type: 'phone',
            label: 'Phone / WhatsApp Number',
            placeholder: '+1 (555) 000-0000',
            required: true
          }
        ],
        buttonText: 'Submit & Get Proposal'
      }
    ],
    settings: {
      progressBar: true,
      autoAdvance: true,
      showBackButton: true,
      buttonColor: '#16a34a',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      borderRadius: '16px',
      successTitle: 'Application Received! 🚀',
      successMessage: 'Our strategy team has received your information and will reach out within 24 business hours.'
    }
  },
  {
    id: 'tpl_event_rsvp',
    name: 'Event RSVP & Workshop Registration',
    description: 'Capture attendee preferences, dietary requirements, and session choices for live events.',
    category: 'Events',
    icon: '🎟️',
    slides: [
      {
        id: 'slide_1',
        title: 'Attendee Information',
        subtitle: 'Please confirm your attendance and contact details.',
        elements: [
          {
            id: 'q_first_name',
            type: 'first_name',
            label: 'First Name',
            placeholder: 'First name',
            required: true
          },
          {
            id: 'q_last_name',
            type: 'last_name',
            label: 'Last Name',
            placeholder: 'Last name',
            required: true
          },
          {
            id: 'q_email',
            type: 'email',
            label: 'Email Address for Event Pass',
            placeholder: 'you@email.com',
            required: true
          }
        ],
        buttonText: 'Next: Preferences'
      },
      {
        id: 'slide_2',
        title: 'Session & Dietary Preferences',
        subtitle: 'Help us personalize your event experience.',
        elements: [
          {
            id: 'q_sessions',
            type: 'checkbox',
            label: 'Which breakout tracks do you plan to attend?',
            options: ['Keynote & AI Automation', 'Funnels & Conversion Rate Optimization', 'Scaling with Paid Ads', 'Networking & Mastermind'],
            required: true
          },
          {
            id: 'q_dietary',
            type: 'dropdown',
            label: 'Do you have any dietary preferences for the lunch buffet?',
            options: ['Standard / No Restrictions', 'Vegetarian', 'Vegan', 'Halal', 'Gluten-Free'],
            required: false
          }
        ],
        buttonText: 'Confirm Registration'
      }
    ],
    settings: {
      progressBar: true,
      autoAdvance: false,
      showBackButton: true,
      buttonColor: '#7c3aed',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      borderRadius: '16px',
      successTitle: 'You’re Registered! 🎟️',
      successMessage: 'Your event pass and agenda have been emailed to your address.'
    }
  },
  {
    id: 'tpl_product_market_research',
    name: 'Product & Market Research Survey',
    description: 'Gather insights on consumer buying habits, pain points, and willingness to pay.',
    category: 'Research',
    icon: '📊',
    slides: [
      {
        id: 'slide_1',
        title: 'Current Habits & Tools',
        subtitle: 'How do you currently solve your marketing and website needs?',
        elements: [
          {
            id: 'q_current_tools',
            type: 'checkbox',
            label: 'Which tools are you currently using?',
            options: ['WordPress', 'ClickFunnels', 'GoHighLevel', 'Shopify', 'Mailchimp / Klaviyo', 'Custom Code'],
            required: true
          },
          {
            id: 'q_biggest_pain',
            type: 'radio',
            label: 'What is your biggest frustration with current tools?',
            options: ['Too expensive monthly fees', 'Too complex and hard to use', 'Slow page loading speeds', 'Lack of Arabic / RTL support', 'Disconnected platforms'],
            required: true
          }
        ],
        buttonText: 'Next Step'
      },
      {
        id: 'slide_2',
        title: 'Feature Wishlist',
        subtitle: 'What matters most to you in an all-in-one platform?',
        elements: [
          {
            id: 'q_importance',
            type: 'rating',
            label: 'How important is integrated email & WhatsApp automation?',
            maxRating: 5,
            required: true
          },
          {
            id: 'q_pricing_expectation',
            type: 'radio',
            label: 'What monthly pricing would you consider a great value for an all-in-one suite?',
            options: ['$29 - $49 / month', '$49 - $99 / month', '$99 - $199 / month', '$199+ / month'],
            required: true
          }
        ],
        buttonText: 'Complete Survey'
      }
    ],
    settings: {
      progressBar: true,
      autoAdvance: false,
      showBackButton: true,
      buttonColor: '#0284c7',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      borderRadius: '16px',
      successTitle: 'Insight Submitted! 💡',
      successMessage: 'Thank you for contributing to our product roadmap research.'
    }
  }
];

export function createBlankSurvey({ name, accountUid = '' }) {
  const surveyId = `survey_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: surveyId,
    name: name || 'Survey 0',
    ownerUid: accountUid,
    createdBy: accountUid,
    status: 'published',
    published: true,
    lastUpdated: new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    slides: [
      {
        id: 'slide_1',
        title: 'Slide 1',
        subtitle: 'Move your question to the 1st page using the elements on the left.',
        elements: [
          {
            id: 'q_full_name',
            type: 'full_name',
            label: 'Full Name',
            placeholder: 'Enter your full name',
            required: true,
            width: '100%'
          },
          {
            id: 'q_email',
            type: 'email',
            label: 'Email Address',
            placeholder: 'Enter your email address',
            required: true,
            width: '100%'
          }
        ],
        buttonText: 'Submit'
      }
    ],
    settings: {
      progressBar: true,
      autoAdvance: false,
      showBackButton: true,
      buttonColor: '#2563eb',
      buttonTextColor: '#ffffff',
      backgroundColor: '#ffffff',
      textColor: '#0f172a',
      borderRadius: '16px',
      maxWidth: '620px',
      successTitle: 'Thank you!',
      successMessage: 'Your response has been recorded successfully.'
    },
    submissions: [],
    analytics: {
      views: 0,
      completions: 0,
      submissions: 0,
      completionRate: 0
    }
  };
}

export function createSurveyFromTemplate(template, { name, accountUid = '' }) {
  const surveyId = `survey_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: surveyId,
    name: name || template.name,
    ownerUid: accountUid,
    createdBy: accountUid,
    status: 'published',
    published: true,
    lastUpdated: new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    slides: JSON.parse(JSON.stringify(template.slides || [])),
    settings: JSON.parse(JSON.stringify(template.settings || {})),
    submissions: [],
    analytics: {
      views: 0,
      completions: 0,
      submissions: 0,
      completionRate: 0
    }
  };
}
