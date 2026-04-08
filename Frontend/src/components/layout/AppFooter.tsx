import {
  Facebook,
  Instagram,
  Linkedin,
  Music2,
  Youtube,
} from "lucide-react";
import type { ComponentType } from "react";

interface FooterLink {
  label: string;
  href: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterSocialLink extends FooterLink {
  shortLabel?: string;
  icon?: ComponentType<{ className?: string }>;
}

interface AppFooterProps {
  sections?: FooterSection[];
  socialLinks?: FooterSocialLink[];
  legalLinks?: FooterLink[];
  copyrightName?: string;
  copyrightYear?: number;
}

const defaultSections: FooterSection[] = [
  {
    title: "Popular links",
    links: [
      { label: "Blackboard", href: "#" },
      { label: "Contact the Service Desk", href: "#" },
      { label: "Jobs", href: "#" },
      { label: "Library services", href: "#" },
      { label: "Outlook email online", href: "#" },
    ],
  },
  {
    title: "Directories",
    links: [
      { label: "Admin and support services", href: "#" },
      { label: "Networks and Centres", href: "#" },
      { label: "Research groups", href: "#" },
      { label: "Search all staff", href: "#" },
    ],
  },
  {
    title: "Partners",
    links: [
      { label: "Academic Health Science Centre", href: "#" },
      { label: "Health Partners", href: "#" },
      { label: "Healthcare NHS Trust", href: "#" },
      { label: "Consultants", href: "#" },
    ],
  },
];

const defaultSocialLinks: FooterSocialLink[] = [
  { label: "Facebook", href: "#", icon: Facebook },
  { label: "X", href: "#", shortLabel: "X" },
  { label: "YouTube", href: "#", icon: Youtube },
  { label: "LinkedIn", href: "#", icon: Linkedin },
  { label: "Instagram", href: "#", icon: Instagram },
  { label: "TikTok", href: "#", icon: Music2 },
  { label: "Bluesky", href: "#", shortLabel: "B" },
];

const defaultLegalLinks: FooterLink[] = [
  { label: "Sitemap", href: "#" },
  { label: "Accessibility", href: "#" },
  { label: "Modern slavery statement", href: "#" },
  { label: "Privacy notice", href: "#" },
  { label: "Use of cookies", href: "#" },
  { label: "Report incorrect content", href: "#" },
];

export const AppFooter = ({
  sections = defaultSections,
  socialLinks = defaultSocialLinks,
  legalLinks = defaultLegalLinks,
  copyrightName = "Echo Press University",
  copyrightYear = new Date().getFullYear(),
}: AppFooterProps) => {
  return (
    <footer className="border-t border-[var(--burgundy-light)] bg-[var(--parchment)] text-primary">
      <div className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map((section) => (
            <section key={section.title} aria-label={section.title}>
              <h2 className="text-base font-semibold">{section.title}</h2>
              <ul className="mt-4 space-y-2 text-sm sm:text-base">
                {section.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className="underline-offset-4 hover:underline">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <div className="mt-10 border-t border-[var(--burgundy-light)]" />

        <div className="grid gap-8 py-8 lg:grid-cols-[minmax(0,24rem)_1fr]">
          <section className="space-y-4 lg:border-r lg:border-[var(--burgundy-light)] lg:pr-8">
            <p className="font-display text-4xl font-semibold tracking-[0.3em]">ECHO PRESS</p>
            <address className="not-italic text-sm leading-7 sm:text-base">
              Echo Press University
              <br />
              South Kensington Campus
              <br />
              London SW7 2AZ, UK
              <br />
              Tel: +44 (0)20 7589 5111
            </address>
          </section>

          <section className="space-y-6">
            <ul className="flex flex-wrap gap-3">
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <li key={social.label}>
                    <a
                      href={social.href}
                      aria-label={social.label}
                      className="flex h-9 w-9 items-center justify-center rounded-full border border-primary/45 text-primary transition-colors hover:bg-primary/10"
                    >
                      {Icon ? (
                        <Icon className="h-4 w-4" />
                      ) : (
                        <span className="text-sm font-semibold">{social.shortLabel ?? social.label[0]}</span>
                      )}
                    </a>
                  </li>
                );
              })}
            </ul>

            <ul className="flex flex-wrap gap-x-8 gap-y-3 text-sm sm:text-base">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="underline-offset-4 hover:underline">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            <p className="text-sm text-primary/80 sm:text-base">
              &copy; {copyrightYear} {copyrightName}
            </p>
          </section>
        </div>
      </div>
    </footer>
  );
};
