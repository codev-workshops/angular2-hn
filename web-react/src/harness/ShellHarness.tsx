import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

// TEMPORARY shell harness — removed in the final routing wave.
export function ShellHarness() {
  return (
    <>
      <Header />
      <div className="main-content">
        <p>shell harness placeholder</p>
      </div>
      <Footer />
    </>
  );
}
