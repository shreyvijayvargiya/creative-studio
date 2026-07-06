import { Link, createFileRoute } from '@tanstack/react-router'

import {
  LegalPageContent,
  legalPageHead,
} from '#/components/landing/legal-page-content'

export const Route = createFileRoute('/privacy-policy')({
  head: () =>
    legalPageHead(
      'Privacy Policy | Finance CRM',
      'How Finance CRM collects, uses, and protects your data when you use our accounting workspace.',
      '/privacy-policy',
    ),
  component: PrivacyPolicyPage,
})

function PrivacyPolicyPage() {
  return (
    <LegalPageContent
      title="Privacy Policy"
      description="This policy explains what information we collect, how we use it, and the choices you have when using Finance CRM."
      lastUpdated="July 5, 2026"
      sections={[
        {
          title: '1. Who we are',
          content: (
            <p>
              Finance CRM provides accounting workflow software for budget planning, ATO-oriented
              PDF generation, e-signing, and document storage. This policy applies to our website,
              application, and related services.
            </p>
          ),
        },
        {
          title: '2. Information we collect',
          content: (
            <>
              <p>We may collect the following types of information:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Account details such as name, email address, and authentication provider data</li>
                <li>Workspace content including budgets, taxpayer details, and uploaded documents</li>
                <li>Usage data such as pages visited, features used, and device/browser information</li>
                <li>Payment and billing details when paid plans become available</li>
              </ul>
            </>
          ),
        },
        {
          title: '3. How we use your information',
          content: (
            <ul className="list-disc space-y-2 pl-5">
              <li>To provide, operate, and improve the Finance CRM platform</li>
              <li>To authenticate users and secure accounts</li>
              <li>To generate documents, store files, and enable e-signing workflows</li>
              <li>To communicate product updates, support responses, and service notices</li>
              <li>To comply with legal obligations and prevent abuse</li>
            </ul>
          ),
        },
        {
          title: '4. Third-party services',
          content: (
            <p>
              We use trusted infrastructure and service providers including Supabase (auth,
              database, storage), DocuSeal (e-signing), and optional Google Drive (per-user
              backup via OAuth). These providers process data according to their own privacy
              policies and our agreements with them.
            </p>
          ),
        },
        {
          title: '5. Data retention & security',
          content: (
            <p>
              We retain your data for as long as your account is active or as needed to provide
              services. We apply reasonable technical and organisational safeguards, including
              encrypted transport and access controls. No method of transmission over the internet
              is completely secure.
            </p>
          ),
        },
        {
          title: '6. Your rights',
          content: (
            <p>
              Depending on your location, you may have rights to access, correct, export, or
              delete your personal data. Contact us to make a request. You may also disconnect
              optional integrations such as Google Drive at any time from Settings.
            </p>
          ),
        },
        {
          title: '7. Contact',
          content: (
            <p>
              For privacy questions, contact us via the form on our{' '}
              <Link to="/about" className="text-blue-600 hover:underline dark:text-blue-400">
                About page
              </Link>
              .
            </p>
          ),
        },
      ]}
    />
  )
}
