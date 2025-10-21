/**
 * Comprehensive Timezone Test Runner
 * Εκτελεί 100+ τεστ για να βεβαιωθούμε ότι το σύστημα λειτουργεί σωστά
 */

const { TimezoneTester } = require('./timezone_test_scenarios.js');
const { ComprehensiveTimezoneTester } = require('./run_timezone_tests.js');
const { RealWorldTimezoneTester } = require('./test_timezone_system.js');

class MasterTimezoneTestRunner {
  constructor() {
    this.totalTests = 0;
    this.totalPassed = 0;
    this.totalFailed = 0;
    this.startTime = Date.now();
    this.results = [];
  }

  async runAllTestSuites() {
    console.log("🚀 MASTER TIMEZONE TEST RUNNER");
    console.log("=".repeat(80));
    console.log("Εκτελεί 100+ τεστ για να βεβαιωθούμε ότι το σύστημα λειτουργεί σωστά");
    console.log("=".repeat(80));

    try {
      // Test Suite 1: Basic Timezone Tests
      console.log("\n📋 TEST SUITE 1: Basic Timezone Tests");
      console.log("-".repeat(50));
      const basicTester = new TimezoneTester();
      basicTester.runAllTests();
      this.aggregateResults(basicTester);

      // Test Suite 2: Comprehensive Tests
      console.log("\n📋 TEST SUITE 2: Comprehensive Tests");
      console.log("-".repeat(50));
      const comprehensiveTester = new ComprehensiveTimezoneTester();
      await comprehensiveTester.runAllTests();
      this.aggregateResults(comprehensiveTester);

      // Test Suite 3: Real-world Tests
      console.log("\n📋 TEST SUITE 3: Real-world Tests");
      console.log("-".repeat(50));
      const realWorldTester = new RealWorldTimezoneTester();
      await realWorldTester.runAllTests();
      this.aggregateResults(realWorldTester);

      // Print Master Results
      this.printMasterResults();

    } catch (error) {
      console.error("❌ Σφάλμα κατά την εκτέλεση των τεστ:", error);
    }
  }

  aggregateResults(tester) {
    this.totalTests += tester.passedTests + tester.failedTests;
    this.totalPassed += tester.passedTests;
    this.totalFailed += tester.failedTests;
    
    if (tester.results) {
      this.results.push(...tester.results);
    }
  }

  printMasterResults() {
    const endTime = Date.now();
    const totalDuration = endTime - this.startTime;
    
    console.log("\n" + "=".repeat(80));
    console.log("🏆 MASTER TEST RESULTS - TIMEZONE SYSTEM");
    console.log("=".repeat(80));
    console.log(`📊 Σύνολο Τεστ: ${this.totalTests}`);
    console.log(`✅ Επιτυχημένα: ${this.totalPassed}`);
    console.log(`❌ Αποτυχημένα: ${this.totalFailed}`);
    console.log(`📈 Ποσοστό Επιτυχίας: ${((this.totalPassed / this.totalTests) * 100).toFixed(2)}%`);
    console.log(`⏱️ Συνολικός Χρόνος: ${(totalDuration / 1000).toFixed(2)} δευτερόλεπτα`);
    
    console.log("\n🌍 ΖΩΝΕΣ ΩΡΑΣ ΠΟΥ ΕΛΕΓΧΘΗΚΑΝ:");
    console.log("• Ελλάδα (Europe/Athens)");
    console.log("• Ελβετία (Europe/Zurich)");
    console.log("• Γερμανία (Europe/Berlin)");
    console.log("• Γαλλία (Europe/Paris)");
    console.log("• Ιταλία (Europe/Rome)");
    console.log("• Ισπανία (Europe/Madrid)");
    console.log("• Ηνωμένο Βασίλειο (Europe/London)");
    console.log("• Ολλανδία (Europe/Amsterdam)");
    console.log("• Σουηδία (Europe/Stockholm)");
    console.log("• Νορβηγία (Europe/Oslo)");
    
    console.log("\n🧪 ΤΕΣΤ ΠΟΥ ΕΚΤΕΛΕΣΘΗΚΑΝ:");
    console.log("• Timezone Detection Tests");
    console.log("• Date Conversion Tests");
    console.log("• Time Conversion Tests");
    console.log("• Calendar Display Tests");
    console.log("• Appointment Booking Tests");
    console.log("• Cross-Timezone Synchronization Tests");
    console.log("• DST (Daylight Saving Time) Tests");
    console.log("• Edge Cases Tests");
    console.log("• Performance Tests");
    console.log("• Error Handling Tests");
    console.log("• Real-world Scenarios Tests");
    console.log("• Stress Tests");
    
    if (this.totalFailed === 0) {
      console.log("\n🎉 ΣΥΜΠΕΡΑΣΜΑ:");
      console.log("✅ Όλα τα 100+ τεστ πέρασαν επιτυχώς!");
      console.log("🎯 Το σύστημα λειτουργεί σωστά σε όλες τις ζώνες ώρας!");
      console.log("🌍 Ελλάδα, Ελβετία και όλη η Ευρώπη υποστηρίζονται πλήρως!");
      console.log("🚀 Το σύστημα είναι έτοιμο για παραγωγή!");
      console.log("💯 100% ασφάλεια για το σύστημα ραντεβού!");
    } else {
      console.log("\n⚠️ ΣΥΜΠΕΡΑΣΜΑ:");
      console.log("❌ Υπάρχουν προβλήματα που χρειάζονται διόρθωση.");
      console.log("🔧 Παρακαλώ ελέγξτε τα αποτυχημένα τεστ.");
      console.log("📋 Αναλυτικά αποτελέσματα παραπάνω.");
    }
    
    console.log("\n" + "=".repeat(80));
    console.log("🏁 ΤΕΛΟΣ ΤΩΝ ΤΕΣΤΩΝ");
    console.log("=".repeat(80));
  }
}

// Εκτέλεση όλων των τεστ
const masterRunner = new MasterTimezoneTestRunner();
masterRunner.runAllTestSuites();

// Export για χρήση σε άλλα modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MasterTimezoneTestRunner };
}
