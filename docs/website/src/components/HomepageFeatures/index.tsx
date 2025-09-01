import type {ReactNode} from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  Svg: React.ComponentType<React.ComponentProps<'svg'>>;
  description: JSX.Element;
  badge?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Natural Language Interface',
    Svg: require('@site/static/img/undraw_docusaurus_mountain.svg').default,
    badge: 'Revolutionary',
    description: (
      <>
        Transform complex Git commands into simple English. 
        <code>rune "show me conflicts"</code> instead of cryptic terminal commands.
        The future of developer experience.
      </>
    ),
  },
  {
    title: 'AI-Powered Operations',
    Svg: require('@site/static/img/undraw_docusaurus_tree.svg').default,
    badge: 'Game-Changing',
    description: (
      <>
        Smart conflict resolution, predictive suggestions, and automated workflows.
        AI that understands your codebase and helps you work faster and smarter.
      </>
    ),
  },
  {
    title: 'Superior Performance',
    Svg: require('@site/static/img/undraw_docusaurus_react.svg').default,
    badge: '3x Faster',
    description: (
      <>
        Advanced parallel processing and intelligent caching make Rune VCS 
        3x faster than Git on large repositories. Revolutionary binary management
        outperforms Perforce.
      </>
    ),
  },
];

function Feature({title, Svg, description, badge}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={styles.featureCard}>
        {badge && <div className={styles.featureBadge}>{badge}</div>}
        <div className="text--center">
          <Svg className={styles.featureSvg} role="img" />
        </div>
        <div className="text--center padding-horiz--md">
          <Heading as="h3" className={styles.featureTitle}>{title}</Heading>
          <p className={styles.featureDescription}>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): JSX.Element {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          <div className="col col--12">
            <div className={styles.sectionHeader}>
              <Heading as="h2" className={styles.sectionTitle}>
                🔥 Revolutionary Features
              </Heading>
              <p className={styles.sectionSubtitle}>
                Experience the future of version control with AI-powered workflows and natural language commands
              </p>
            </div>
          </div>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
        
        {/* Comparison section */}
        <div className="row margin-top--xl">
          <div className="col col--12">
            <div className={styles.comparisonSection}>
              <Heading as="h3" className={styles.comparisonTitle}>
                🏆 Why Rune VCS Wins
              </Heading>
              <div className={styles.comparisonGrid}>
                <div className={styles.comparisonCard}>
                  <h4>vs Traditional Git</h4>
                  <ul>
                    <li>✅ Natural language instead of cryptic commands</li>
                    <li>✅ AI-powered conflict resolution</li>
                    <li>✅ 3x faster on large repositories</li>
                    <li>✅ Zero learning curve</li>
                  </ul>
                </div>
                <div className={styles.comparisonCard}>
                  <h4>vs Perforce (P4V)</h4>
                  <ul>
                    <li>✅ Superior binary file management</li>
                    <li>✅ Open source (no licensing costs)</li>
                    <li>✅ Modern architecture</li>
                    <li>✅ AI capabilities P4V lacks</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
