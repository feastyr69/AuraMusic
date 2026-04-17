import React from "react";
import { Link } from "react-router-dom";

const LAST_UPDATED = "April 17, 2026";

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-lg font-semibold text-white mb-3 font-display">{title}</h2>
    <div className="text-zinc-400 leading-relaxed space-y-3 text-sm">{children}</div>
  </section>
);

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen" style={{ background: "#020203" }}>
      {/* Subtle top glow */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: "50%",
          transform: "translateX(-50%)",
          width: "600px",
          height: "300px",
          background: "radial-gradient(ellipse at 50% 0%, rgba(212,165,116,0.12) 0%, transparent 70%)",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      <div className="relative z-10 max-w-3xl mx-auto px-6 py-16">
        {/* Back link */}
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-[#d4a574] transition-colors mb-12"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          Back to Aura Music
        </Link>

        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 10,
                background: "linear-gradient(135deg, #d4a574 0%, #b8956a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17v-6H7l5-9v6h4l-5 9z" />
              </svg>
            </div>
            <span className="text-[#d4a574] font-semibold tracking-wide text-sm font-display">AURA MUSIC</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-display">Privacy Policy</h1>
          <p className="text-zinc-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 40 }} />

        <Section title="1. Introduction">
          <p>
            Welcome to Aura Music ("we," "our," or "us"). This Privacy Policy explains how we collect, use,
            disclose, and safeguard your information when you use our music jam session platform available at{" "}
            <a href="https://auramusic.app" className="text-[#d4a574] hover:underline">
              auramusic.app
            </a>{" "}
            (the "Service").
          </p>
          <p>
            By accessing or using the Service, you agree to the collection and use of information in accordance
            with this policy. If you do not agree, please do not use the Service.
          </p>
        </Section>

        <Section title="2. Information We Collect">
          <p>We may collect the following types of information:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <span className="text-zinc-300">Account Information:</span> When you sign in with Google, we
              receive your name, email address, and profile picture from your Google account.
            </li>
            <li>
              <span className="text-zinc-300">Usage Data:</span> Information about how you interact with the
              Service, including jam sessions joined or created, songs queued, and chat messages.
            </li>
            <li>
              <span className="text-zinc-300">Technical Data:</span> IP address, browser type, operating
              system, and other device identifiers collected automatically.
            </li>
            <li>
              <span className="text-zinc-300">Cookies &amp; Session Data:</span> We use cookies and similar
              technologies to maintain your session and preferences.
            </li>
          </ul>
        </Section>

        <Section title="3. How We Use Your Information">
          <p>We use the information we collect to:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Provide, operate, and maintain the Service</li>
            <li>Authenticate you and manage your account</li>
            <li>Enable real-time jam session functionality</li>
            <li>Improve and personalize the user experience</li>
            <li>Monitor usage patterns and diagnose technical issues</li>
            <li>Send service-related communications when necessary</li>
          </ul>
        </Section>

        <Section title="4. Google OAuth">
          <p>
            We use Google Sign-In (OAuth 2.0) for authentication. When you authenticate with Google, we receive
            limited profile data as described in Section 2. We do not access your Google Drive, Gmail, or any
            other Google services. Your use of Google Sign-In is also governed by{" "}
            <a
              href="https://policies.google.com/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#d4a574] hover:underline"
            >
              Google's Privacy Policy
            </a>
            .
          </p>
        </Section>

        <Section title="5. Data Sharing &amp; Third Parties">
          <p>
            We do not sell, trade, or rent your personal information. We may share data with:
          </p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>
              <span className="text-zinc-300">Service Providers:</span> Hosting, database, and caching
              providers (e.g., Render, Neon, Redis) who help us deliver the Service under strict
              confidentiality obligations.
            </li>
            <li>
              <span className="text-zinc-300">Legal Obligations:</span> If required by law or to protect our
              rights and the safety of users.
            </li>
          </ul>
        </Section>

        <Section title="6. Data Retention">
          <p>
            We retain your account information for as long as your account is active or as needed to provide
            the Service. You may request deletion of your account and associated data at any time by contacting
            us at the address below.
          </p>
        </Section>

        <Section title="7. Security">
          <p>
            We implement industry-standard security measures including HTTPS, hashed credentials, and
            HTTP-only session cookies. However, no method of transmission over the Internet is 100% secure, and
            we cannot guarantee absolute security.
          </p>
        </Section>

        <Section title="8. Children's Privacy">
          <p>
            The Service is not directed at children under the age of 13. We do not knowingly collect personal
            information from children. If you believe a child has provided us with personal data, please contact
            us and we will delete it.
          </p>
        </Section>

        <Section title="9. Your Rights">
          <p>Depending on your location, you may have the right to:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Access the personal data we hold about you</li>
            <li>Request correction of inaccurate data</li>
            <li>Request deletion of your data</li>
            <li>Withdraw consent at any time</li>
          </ul>
          <p>To exercise these rights, contact us at the address below.</p>
        </Section>

        <Section title="10. Changes to This Policy">
          <p>
            We may update this Privacy Policy from time to time. We will notify you of significant changes by
            updating the "Last updated" date at the top of this page. Continued use of the Service after
            changes constitutes your acceptance of the revised policy.
          </p>
        </Section>

        <Section title="11. Contact Us">
          <p>
            If you have any questions or concerns about this Privacy Policy, please contact us at:{" "}
            <a href="mailto:privacy@auramusic.app" className="text-[#d4a574] hover:underline">
              privacy@auramusic.app
            </a>
          </p>
        </Section>

        {/* Footer nav */}
        <div
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 32, marginTop: 16 }}
          className="flex gap-6 text-sm text-zinc-500"
        >
          <Link to="/privacy-policy" className="hover:text-[#d4a574] transition-colors text-[#d4a574]">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-[#d4a574] transition-colors">
            Terms &amp; Conditions
          </Link>
          <Link to="/" className="hover:text-[#d4a574] transition-colors">
            Home
          </Link>
        </div>
      </div>
    </div>
  );
}
