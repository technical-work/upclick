// Prebuilt Form Templates matching GoHighLevel / UpKlick standard structures

export const PREBUILT_FORM_TEMPLATES = [
  {
    id: 'tpl_contact_us',
    name: 'General Contact Form',
    nameAr: 'نموذج تواصل عام',
    category: 'Contact',
    description: 'Capture inbound inquiries with name, email, phone, subject and message.',
    icon: 'mail',
    fields: [
      {
        id: 'f_first_name',
        type: 'first_name',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: true,
        width: '50%'
      },
      {
        id: 'f_last_name',
        type: 'last_name',
        label: 'Last Name',
        placeholder: 'Enter your last name',
        required: false,
        width: '50%'
      },
      {
        id: 'f_phone',
        type: 'phone',
        label: 'Phone',
        placeholder: '+1 (555) 000-0000',
        required: true,
        width: '100%'
      },
      {
        id: 'f_email',
        type: 'email',
        label: 'Email',
        placeholder: 'your@email.com',
        required: true,
        width: '100%'
      },
      {
        id: 'f_consent_1',
        type: 'consent_checkbox',
        label: 'By checking this box, I consent to receive non-marketing text messages from [BUSINESS NAME] about [USE_CASE_FROM_CAMPAIGN_DESCRIPTION]. Message frequency varies, message & data rates may apply. Text HELP for assistance, reply STOP to opt out.',
        required: false,
        width: '100%'
      },
      {
        id: 'f_consent_2',
        type: 'consent_checkbox',
        label: 'By checking this box, I consent to receive marketing and promotional messages including special offers, discounts, new product updates among others, from [BUSINESS NAME] at the phone number provided. Frequency may vary. Message & data rates may apply. Text HELP for assistance, reply STOP to opt out.',
        required: false,
        width: '100%'
      },
      {
        id: 'f_submit',
        type: 'submit',
        label: 'Submit',
        buttonColor: '#2563eb',
        textColor: '#ffffff',
        width: '100%'
      }
    ],
    settings: {
      onSubmitType: 'message',
      messageHtml: '<div style="text-align:center; padding: 20px 0;"><div style="font-size: 40px; margin-bottom: 12px;">😀</div><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">We appreciate your feedback!</h3><p style="font-size: 14px; color: #64748b; margin: 0;">Thank you for taking the time to complete this form.</p></div>',
      redirectUrl: '',
      styling: {
        bg: '#ffffff',
        font: 'Inter',
        borderRadius: '12px',
        cardShadow: true,
        labelColor: '#1e293b'
      },
      showTermsLinks: true
    }
  },
  {
    id: 'tpl_lead_capture',
    name: 'Lead Magnet & Consultation',
    nameAr: 'نموذج جذب العملاء والاستشارة',
    category: 'Lead Gen',
    description: 'High converting form for downloading lead magnets, guides, or booking consultations.',
    icon: 'target',
    fields: [
      {
        id: 'f_full_name',
        type: 'full_name',
        label: 'Full Name',
        placeholder: 'John Doe',
        required: true,
        width: '100%'
      },
      {
        id: 'f_email',
        type: 'email',
        label: 'Business Email',
        placeholder: 'john@company.com',
        required: true,
        width: '100%'
      },
      {
        id: 'f_phone',
        type: 'phone',
        label: 'Phone Number',
        placeholder: '+1 (555) 123-4567',
        required: true,
        width: '100%'
      },
      {
        id: 'f_company',
        type: 'text',
        label: 'Company Name',
        placeholder: 'Acme Inc.',
        required: false,
        width: '100%'
      },
      {
        id: 'f_submit',
        type: 'submit',
        label: 'Claim Your Free Consultation',
        buttonColor: '#2563eb',
        textColor: '#ffffff',
        width: '100%'
      }
    ],
    settings: {
      onSubmitType: 'message',
      messageHtml: '<div style="text-align:center; padding: 20px 0;"><div style="font-size: 40px; margin-bottom: 12px;">🎉</div><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Success! Check your inbox</h3><p style="font-size: 14px; color: #64748b; margin: 0;">We have received your details and our team will be in touch shortly.</p></div>',
      redirectUrl: '',
      styling: {
        bg: '#ffffff',
        font: 'Inter',
        borderRadius: '12px',
        cardShadow: true,
        labelColor: '#1e293b'
      },
      showTermsLinks: true
    }
  },
  {
    id: 'tpl_event_reg',
    name: 'Event / Webinar Registration',
    nameAr: 'تسجيل الفعاليات والندوات',
    category: 'Events',
    description: 'Collect attendee details with custom choices and time slots.',
    icon: 'calendar',
    fields: [
      {
        id: 'f_first_name',
        type: 'first_name',
        label: 'First Name',
        placeholder: 'Jane',
        required: true,
        width: '50%'
      },
      {
        id: 'f_last_name',
        type: 'last_name',
        label: 'Last Name',
        placeholder: 'Smith',
        required: true,
        width: '50%'
      },
      {
        id: 'f_email',
        type: 'email',
        label: 'Email Address',
        placeholder: 'jane@example.com',
        required: true,
        width: '100%'
      },
      {
        id: 'f_date',
        type: 'date_of_birth',
        label: 'Preferred Date',
        placeholder: 'MM / DD / YYYY',
        required: false,
        width: '100%'
      },
      {
        id: 'f_submit',
        type: 'submit',
        label: 'Reserve My Seat Now',
        buttonColor: '#16a34a',
        textColor: '#ffffff',
        width: '100%'
      }
    ],
    settings: {
      onSubmitType: 'message',
      messageHtml: '<div style="text-align:center; padding: 20px 0;"><div style="font-size: 40px; margin-bottom: 12px;">🎟️</div><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">You are Registered!</h3><p style="font-size: 14px; color: #64748b; margin: 0;">We sent your calendar invite and access link to your email.</p></div>',
      redirectUrl: '',
      styling: {
        bg: '#ffffff',
        font: 'Inter',
        borderRadius: '12px',
        cardShadow: true,
        labelColor: '#1e293b'
      },
      showTermsLinks: true
    }
  },
  {
    id: 'tpl_feedback_survey',
    name: 'Customer Feedback & Review',
    nameAr: 'تقييم واستبيان رضا العملاء',
    category: 'Feedback',
    description: 'Gather ratings, reviews, and satisfaction feedback from clients.',
    icon: 'star',
    fields: [
      {
        id: 'f_name',
        type: 'full_name',
        label: 'Your Name',
        placeholder: 'Alex Johnson',
        required: true,
        width: '100%'
      },
      {
        id: 'f_email',
        type: 'email',
        label: 'Email',
        placeholder: 'alex@example.com',
        required: true,
        width: '100%'
      },
      {
        id: 'f_rating',
        type: 'dropdown',
        label: 'Overall Satisfaction',
        placeholder: 'Select a rating',
        required: true,
        options: ['⭐⭐⭐⭐⭐ Outstanding', '⭐⭐⭐⭐ Very Good', '⭐⭐⭐ Good', '⭐⭐ Fair', '⭐ Poor'],
        width: '100%'
      },
      {
        id: 'f_comments',
        type: 'textarea',
        label: 'What could we improve?',
        placeholder: 'Write your thoughts here...',
        required: false,
        width: '100%'
      },
      {
        id: 'f_submit',
        type: 'submit',
        label: 'Submit Feedback',
        buttonColor: '#2563eb',
        textColor: '#ffffff',
        width: '100%'
      }
    ],
    settings: {
      onSubmitType: 'message',
      messageHtml: '<div style="text-align:center; padding: 20px 0;"><div style="font-size: 40px; margin-bottom: 12px;">🌟</div><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">Thank You for Your Feedback!</h3><p style="font-size: 14px; color: #64748b; margin: 0;">Your input helps us improve every day.</p></div>',
      redirectUrl: '',
      styling: {
        bg: '#ffffff',
        font: 'Inter',
        borderRadius: '12px',
        cardShadow: true,
        labelColor: '#1e293b'
      },
      showTermsLinks: true
    }
  }
];

export function createBlankForm(name = 'Form 1', ownerUid = '', authorName = 'User') {
  const formId = `form_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: formId,
    name: name.trim() || 'New Form',
    ownerUid,
    createdBy: authorName,
    status: 'draft',
    lastUpdated: new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    fields: [
      {
        id: 'f_first_name',
        type: 'first_name',
        label: 'First Name',
        placeholder: 'Enter your first name',
        required: false,
        width: '100%'
      },
      {
        id: 'f_last_name',
        type: 'last_name',
        label: 'Last Name',
        placeholder: 'Enter your last name',
        required: false,
        width: '100%'
      },
      {
        id: 'f_phone',
        type: 'phone',
        label: 'Phone',
        placeholder: '+1 (555) 000-0000',
        required: true,
        width: '100%'
      },
      {
        id: 'f_email',
        type: 'email',
        label: 'Email',
        placeholder: 'your@email.com',
        required: true,
        width: '100%'
      },
      {
        id: 'f_consent_1',
        type: 'consent_checkbox',
        label: 'By checking this box, I consent to receive non-marketing text messages from [BUSINESS NAME] about [USE_CASE_FROM_CAMPAIGN_DESCRIPTION]. Message frequency varies, message & data rates may apply. Text HELP for assistance, reply STOP to opt out.',
        required: false,
        width: '100%'
      },
      {
        id: 'f_consent_2',
        type: 'consent_checkbox',
        label: 'By checking this box, I consent to receive marketing and promotional messages including special offers, discounts, new product updates among others, from [BUSINESS NAME] at the phone number provided. Frequency may vary. Message & data rates may apply. Text HELP for assistance, reply STOP to opt out.',
        required: false,
        width: '100%'
      },
      {
        id: 'f_submit',
        type: 'submit',
        label: 'Submit',
        buttonColor: '#2563eb',
        textColor: '#ffffff',
        width: '100%'
      }
    ],
    settings: {
      onSubmitType: 'message',
      messageHtml: '<div style="text-align:center; padding: 20px 0;"><div style="font-size: 40px; margin-bottom: 12px;">😀</div><h3 style="font-size: 20px; font-weight: 700; color: #0f172a; margin: 0 0 8px 0;">We appreciate your feedback!</h3><p style="font-size: 14px; color: #64748b; margin: 0;">Thank you for taking the time to complete this form.</p></div>',
      redirectUrl: '',
      styling: {
        bg: '#ffffff',
        font: 'Inter',
        borderRadius: '12px',
        cardShadow: true,
        labelColor: '#1e293b'
      },
      showTermsLinks: true
    },
    submissions: [],
    analytics: {
      views: 0,
      submissions: 0
    },
    notifications: {
      notifyOwner: true,
      notificationEmail: '',
      subject: 'New Form Submission Received'
    }
  };
}

export function createFormFromTemplate(template, customName = '', ownerUid = '', authorName = 'User') {
  const formId = `form_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  return {
    id: formId,
    name: customName.trim() || template.name,
    ownerUid,
    createdBy: authorName,
    status: 'draft',
    lastUpdated: new Date().toLocaleString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    fields: JSON.parse(JSON.stringify(template.fields || [])),
    settings: JSON.parse(JSON.stringify(template.settings || {})),
    submissions: [],
    analytics: {
      views: 0,
      submissions: 0
    },
    notifications: {
      notifyOwner: true,
      notificationEmail: '',
      subject: `New Submission on ${customName || template.name}`
    }
  };
}
