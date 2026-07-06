import { Link, createFileRoute } from '@tanstack/react-router'

import {
  LegalPageContent,
  legalPageHead,
} from '#/components/landing/legal-page-content'

export const Route = createFileRoute('/terms-of-service')({
  head: () =>
    legalPageHead(
      'Terms of Service | Finance CRM',
      'Terms governing your use of Finance CRM accounting software, documents, and workspace features.',
      '/terms-of-service',
    ),
  component: TermsOfServicePage,
})

function TermsOfServicePage() {
  return (
    <LegalPageContent
      title="Terms of Service"
      description="By using Finance CRM, you agree to these terms. Please read them carefully before using the platform."
      lastUpdated="July 5, 2026"
      sections={[
        {
          title: '1. Acceptance of terms',
          content: (
            <p>
              By creating an account or using Finance CRM, you agree to be bound by these Terms
              of Service and our Privacy Policy. If you do not agree, do not use the service.
            </p>
          ),
        },
        {
          title: '2. The service',
          content: (
            <p>
              Finance CRM provides tools for budget planning, ATO-oriented PDF generation,
              embedded e-signing, and document management for accounting professionals and
              their clients. Features may change over time as we improve the product.
            </p>
          ),
        },
        {
          title: '3. Accounts & eligibility',
          content: (
            <ul className="list-disc space-y-2 pl-5">
              <li>You must provide accurate registration information</li>
              <li>You are responsible for maintaining the security of your account credentials</li>
              <li>You must be legally able to enter into a binding agreement in your jurisdiction</li>
              <li>You may not use the service for unlawful, fraudulent, or abusive purposes</li>
            </ul>
          ),
        },
        {
          title: '4. Your content',
          content: (
            <p>
              You retain ownership of documents, budgets, and other content you upload or create.
              You grant us a limited licence to host, process, and display that content solely to
              operate the service — including generating PDFs, storing files, and facilitating
              e-signing.
            </p>
          ),
        },
        {
          title: '5. Acceptable use',
          content: (
            <ul className="list-disc space-y-2 pl-5">
              <li>Do not attempt to access another user&apos;s workspace without authorisation</li>
              <li>Do not interfere with platform security or performance</li>
              <li>Do not upload malware or unlawful material</li>
              <li>Comply with applicable tax, privacy, and professional obligations in your practice</li>
            </ul>
          ),
        },
        {
          title: '6. Subscriptions & payments',
          content: (
            <p>
              Free and paid tiers may be offered. When payment features launch, pricing and
              billing terms will be presented at checkout. We may change pricing with reasonable
              notice for future billing periods.
            </p>
          ),
        },
        {
          title: '7. Disclaimers',
          content: (
            <p>
              Finance CRM is provided &quot;as is&quot; without warranties of any kind. We do not
              provide tax, legal, or accounting advice. You are responsible for verifying that
              outputs meet your professional and regulatory requirements before filing or
              sharing with clients.
            </p>
          ),
        },
        {
          title: '8. Limitation of liability',
          content: (
            <p>
              To the maximum extent permitted by law, Finance CRM and its operators shall not be
              liable for indirect, incidental, special, or consequential damages arising from your
              use of the service.
            </p>
          ),
        },
        {
          title: '9. Termination',
          content: (
            <p>
              You may stop using the service at any time. We may suspend or terminate access if
              you violate these terms or if required for security or legal reasons.
            </p>
          ),
        },
        {
          title: '10. Changes & contact',
          content: (
            <p>
              We may update these terms from time to time. Continued use after changes constitutes
              acceptance.               Questions? Reach us via the{' '}
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
