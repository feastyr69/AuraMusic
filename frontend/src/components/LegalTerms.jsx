import React from "react";
import { Link } from "react-router-dom";

const LAST_UPDATED = "April 17, 2026";

const Section = ({ title, children }) => (
  <section className="mb-10">
    <h2 className="text-lg font-semibold text-white mb-3 font-display">{title}</h2>
    <div className="text-zinc-400 leading-relaxed space-y-3 text-sm">{children}</div>
  </section>
);

export default function Terms() {
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
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 font-display">Terms &amp; Conditions</h1>
          <p className="text-zinc-500 text-sm">Last updated: {LAST_UPDATED}</p>
        </div>

        {/* Divider */}
        <div style={{ height: 1, background: "rgba(255,255,255,0.07)", marginBottom: 40 }} />

        <Section title="1. Acceptance of Terms">
          <p>
            By accessing or using Aura Music (the "Service") available at{" "}
            <a href="https://auramusic.app" className="text-[#d4a574] hover:underline">
              auramusic.app
            </a>
            , you agree to be bound by these Terms &amp; Conditions. If you do not agree to these terms, please
            do not use the Service.
          </p>
        </Section>

        <Section title="2. Description of Service">
          <p>
            Aura Music is a collaborative music jam session platform that allows users to create or join shared
            listening rooms, queue music, and chat in real time. The Service streams music via third-party
            providers (e.g., YouTube) and does not host any audio content directly.
          </p>
        </Section>

        <Section title="3. Eligibility">
          <p>
            You must be at least 13 years of age to use the Service. By using the Service, you represent that
            you meet this requirement. If you are under 18, you represent that you have parental or guardian
            consent.
          </p>
        </Section>

        <Section title="4. User Accounts">
          <p>
            You may create an account using email/password or by signing in with Google. You are responsible for
            maintaining the confidentiality of your credentials and for all activity that occurs under your
            account. You agree to notify us immediately of any unauthorized use of your account.
          </p>
          <p>
            We reserve the right to suspend or terminate accounts that violate these Terms.
          </p>
        </Section>

        <Section title="5. Acceptable Use">
          <p>You agree not to use the Service to:</p>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Upload, share, or transmit any unlawful, harmful, or offensive content</li>
            <li>Infringe any intellectual property or proprietary rights</li>
            <li>Harass, bully, or harm other users</li>
            <li>Attempt to gain unauthorized access to the Service or its systems</li>
            <li>Interfere with or disrupt the integrity or performance of the Service</li>
            <li>Use automated scripts, bots, or scrapers against the Service</li>
            <li>Circumvent any geographic or access restrictions</li>
          </ul>
        </Section>

        <Section title="6. Third-Party Content &amp; Services">
          <p>
            The Service may display, link to, or integrate with third-party content or services such as YouTube.
            We are not responsible for the availability, accuracy, or legality of such third-party content.
            Your use of third-party services is governed by their respective terms and privacy policies.
          </p>
          <p>
            Aura Music does not claim ownership of any music or content streamed through third-party providers.
            All rights remain with the respective content owners.
          </p>
        </Section>

        <Section title="7. Intellectual Property">
          <p>
            All original content, features, and functionality of the Service — including but not limited to the
            interface design, logo, and source code — are the exclusive property of Aura Music and are
            protected by applicable intellectual property laws. You may not copy, reproduce, or distribute any
            part of the Service without our prior written consent.
          </p>
        </Section>

        <Section title="8. Disclaimer of Warranties">
          <p>
            The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind,
            either express or implied, including but not limited to implied warranties of merchantability,
            fitness for a particular purpose, or non-infringement. We do not warrant that the Service will be
            uninterrupted, error-free, or free of harmful components.
          </p>
        </Section>

        <Section title="9. Limitation of Liability">
          <p>
            To the maximum extent permitted by applicable law, Aura Music and its operators shall not be liable
            for any indirect, incidental, special, consequential, or punitive damages — including loss of data,
            profits, or goodwill — arising out of or in connection with your use of the Service, even if we
            have been advised of the possibility of such damages.
          </p>
        </Section>

        <Section title="10. Termination">
          <p>
            We reserve the right to suspend or terminate your access to the Service at any time, with or
            without cause or notice. Upon termination, your right to use the Service will immediately cease.
            Provisions that by their nature should survive termination (including Sections 7, 8, 9, and 11)
            shall survive.
          </p>
        </Section>

        <Section title="11. Governing Law">
          <p>
            These Terms shall be governed by and construed in accordance with applicable laws, without regard to
            conflict of law principles. Any disputes arising under these Terms shall be subject to the exclusive
            jurisdiction of the competent courts.
          </p>
        </Section>

        <Section title="12. Changes to These Terms">
          <p>
            We reserve the right to modify these Terms at any time. We will indicate changes by updating the
            "Last updated" date. Your continued use of the Service after changes are posted constitutes your
            acceptance of the revised Terms.
          </p>
        </Section>

        <Section title="13. Contact Us">
          <p>
            If you have any questions about these Terms, please contact us at:{" "}
            <a href="mailto:legal@auramusic.app" className="text-[#d4a574] hover:underline">
              legal@auramusic.app
            </a>
          </p>
        </Section>

        {/* Footer nav */}
        <div
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: 32, marginTop: 16 }}
          className="flex gap-6 text-sm text-zinc-500"
        >
          <Link to="/privacy-policy" className="hover:text-[#d4a574] transition-colors">
            Privacy Policy
          </Link>
          <Link to="/terms" className="hover:text-[#d4a574] transition-colors text-[#d4a574]">
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
