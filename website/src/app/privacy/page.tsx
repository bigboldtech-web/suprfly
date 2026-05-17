import type { Metadata } from 'next';
import PageHero from '@/components/sections/PageHero';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Learn how Suprfly collects, uses, and protects your personal information.',
};

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        breadcrumb={[{ label: 'Home', href: '/' }, { label: 'Privacy Policy' }]}
        title="PRIVACY POLICY"
        subtitle="Last updated: March 1, 2026"
      />

      <section className="py-24 md:py-36">
        <div className="max-w-3xl mx-auto px-6 prose prose-invert prose-headings:font-[var(--font-display)] prose-headings:uppercase prose-headings:tracking-tight prose-p:text-[#a1a1aa] prose-li:text-[#a1a1aa] prose-a:text-[#f59e0b] prose-a:no-underline hover:prose-a:underline prose-strong:text-white">
          <p>
            Suprfly (&quot;we,&quot; &quot;us,&quot; or &quot;our&quot;) operates the suprfly.io
            website and the Suprfly Chrome extension (collectively, the
            &quot;Service&quot;). This Privacy Policy explains how we collect, use, store,
            and share your information when you use the Service.
          </p>

          <h2>1. Information We Collect</h2>
          <h3>Account Information</h3>
          <p>
            When you register, we collect your name, email address, and password.
            If you subscribe to a paid plan, our payment processor (Stripe)
            handles your billing details. We never store full credit card numbers
            on our servers.
          </p>
          <h3>Session Cookies</h3>
          <p>
            The Suprfly Chrome extension captures session cookies for LinkedIn
            and X so the Service can interact with those platforms on your behalf.
            These cookies are encrypted in transit (TLS 1.3) and at rest
            (AES-256). They are used exclusively to post comments and are never
            shared with third parties.
          </p>
          <h3>Usage Data</h3>
          <p>
            We collect anonymised analytics such as pages visited, feature usage,
            comment volumes, and engagement metrics. This data helps us improve
            the product and is not linked to your personal identity.
          </p>

          <h2>2. How We Use Your Information</h2>
          <ul>
            <li>To provide, maintain, and improve the Service</li>
            <li>To authenticate your account and connected social platforms</li>
            <li>To generate and post AI comments on your behalf</li>
            <li>To send transactional emails (account confirmations, password resets, billing receipts)</li>
            <li>To communicate product updates and, with your consent, marketing materials</li>
            <li>To detect, prevent, and address fraud, abuse, or technical issues</li>
          </ul>

          <h2>3. Data Storage and Security</h2>
          <p>
            Your data is stored on encrypted servers hosted by AWS in the United
            States. We implement industry-standard security measures including
            encryption at rest and in transit, role-based access control, regular
            vulnerability scanning, and annual penetration testing. Session cookies
            are encrypted with AES-256 and decrypted only at the moment of use.
          </p>

          <h2>4. Data Sharing</h2>
          <p>
            We do not sell, rent, or trade your personal information. We share
            data only with:
          </p>
          <ul>
            <li>
              <strong>Service providers</strong> (e.g., Stripe for payments, AWS
              for hosting) under strict contractual obligations
            </li>
            <li>
              <strong>Legal authorities</strong> when required by law or to
              protect our rights
            </li>
            <li>
              <strong>Business transfers</strong> in the event of a merger,
              acquisition, or sale of assets, with advance notice to users
            </li>
          </ul>

          <h2>5. Cookies and Tracking</h2>
          <p>
            The suprfly.io website uses first-party cookies for authentication
            and preferences. We use privacy-friendly analytics (no cross-site
            tracking). You can disable cookies in your browser settings, though
            some features may not function correctly.
          </p>

          <h2>6. Your Rights</h2>
          <h3>GDPR (European Economic Area)</h3>
          <p>
            If you reside in the EEA, you have the right to access, rectify,
            erase, restrict processing of, and port your personal data. You may
            also object to processing and withdraw consent at any time. To
            exercise these rights, email{' '}
            <a href="mailto:privacy@suprfly.io">privacy@suprfly.io</a>.
          </p>
          <h3>CCPA (California)</h3>
          <p>
            California residents have the right to know what personal information
            is collected, request deletion, and opt out of the sale of personal
            information. Suprfly does not sell personal information. To submit a
            request, email{' '}
            <a href="mailto:privacy@suprfly.io">privacy@suprfly.io</a>.
          </p>

          <h2>7. Children&apos;s Privacy</h2>
          <p>
            The Service is not directed to individuals under the age of 16. We do
            not knowingly collect personal information from children. If we
            discover that a child under 16 has provided us with personal data, we
            will delete it promptly.
          </p>

          <h2>8. Changes to This Policy</h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify
            you of material changes by email or through a prominent notice on the
            Service at least 30 days before the changes take effect. Your
            continued use of the Service after the effective date constitutes
            acceptance of the updated policy.
          </p>

          <h2>9. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy or your personal
            data, please contact us at{' '}
            <a href="mailto:privacy@suprfly.io">privacy@suprfly.io</a> or write
            to us at Suprfly, 548 Market St, Suite 40122, San Francisco, CA
            94104.
          </p>
        </div>
      </section>
    </>
  );
}
