import React from 'react';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';

import styles from './index.module.css';

function HeroSection() {
  return (
    <section className={styles.hero}>
      <div className="container">
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Version control, finally simplified.
          </h1>
          <p className={styles.heroSubtitle}>
            Rune brings history, branches, and teams into a tool anyone can use. No complex commands, no confusion - just powerful version control that works.
          </p>
          <div className={styles.heroButtons}>
            <Link
              className={`button button--primary button--lg ${styles.downloadButton}`}
              to="/docs/installation/quick-start">
              Download Rune
            </Link>
            <Link
              className={`button button--secondary button--lg ${styles.docsButton}`}
              to="/docs/overview">
              View Docs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function FeaturesSection() {
  const features = [
    {
      title: 'Unified Explorer',
      description: 'All files, local & remote in one place.',
      icon: '', // No icon for clean look
    },
    {
      title: 'Project History',
      description: 'See your project\'s timeline at a glance.',
      icon: '', // No icon for clean look
    },
    {
      title: 'Branches & Streams',
      description: 'Workflows that make sense for teams.',
      icon: '', // No icon for clean look
    },
    {
      title: 'Simplified Remote',
      description: 'Remote that looks like local.',
      icon: '', // No icon for clean look
    },
  ];

  return (
    <section className={styles.features}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          Built for modern development
        </h2>
        <div className={styles.featuresGrid}>
          {features.map((feature, idx) => (
            <div key={idx} className={styles.featureCard}>
              <div className={styles.featureIcon}>{feature.icon}</div>
              <h3 className={styles.featureTitle}>
                {feature.title}
              </h3>
              <p className={styles.featureDescription}>
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function WhyRuneSection() {
  return (
    <section className={styles.whyRune}>
      <div className="container">
        <div className={styles.whyRuneContent}>
          <h2 className={styles.whyRuneTitle}>
            Why Rune beats Git & P4V
          </h2>
          <p className={styles.whyRuneText}>
            <strong>Better than Git:</strong> No cryptic commands, visual branching, intelligent merging, and built-in collaboration tools.
            <br/><br/>
            <strong>Better than Perforce P4V:</strong> No complex server setup, free for teams, modern UI, and lightning-fast operations.
            <br/><br/>
            <strong>What makes Rune special:</strong> Visual workflows, AI-powered conflict resolution, seamless remote sync, and a learning curve measured in minutes, not months.
          </p>
        </div>
      </div>
    </section>
  );
}

function CommunitySection() {
  const userTypes = [
    { name: 'Game Studios', description: 'Managing large assets and team workflows' },
    { name: 'Indie Developers', description: 'Simple version control without the complexity' },
    { name: 'Small Teams', description: 'Collaborative development made easy' },
  ];

  return (
    <section className={styles.community}>
      <div className="container">
        <h2 className={styles.sectionTitle}>
          Built for teams of all sizes
        </h2>
        <div className={styles.userTypesGrid}>
          {userTypes.map((userType, idx) => (
            <div key={idx} className={styles.userTypeCard}>
              <h3 className={styles.userTypeName}>
                {userType.name}
              </h3>
              <p className={styles.userTypeDescription}>
                {userType.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DocsCTASection() {
  return (
    <section className={styles.docsCTA}>
      <div className="container">
        <div className={styles.docsCTAContent}>
          <h2 className={styles.docsCTATitle}>
            Ready to dive in?
          </h2>
          <Link
            className={`button button--primary button--lg ${styles.docsCTAButton}`}
            to="/docs/overview">
            See the Docs →
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <Layout
      title="Rune"
      description="Version control, finally simplified. Rune brings history, branches, and teams into a tool anyone can use.">
      <HeroSection />
      <FeaturesSection />
      <WhyRuneSection />
      <CommunitySection />
      <DocsCTASection />
    </Layout>
  );
}
