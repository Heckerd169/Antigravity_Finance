import { OnboardingForm } from "./onboarding-form";
import styles from "./onboarding.module.css";

export default function OnboardingPage() {
  return (
    <main className={styles.main}>
      <OnboardingForm />
    </main>
  );
}
