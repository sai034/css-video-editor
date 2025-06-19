// pages/terms.js
export default function TermsOfService() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-sans">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Acceptable Use</h2>
        <p className="mb-4">By using CSS Video Editor, you agree:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4 font-sans">
          <li>To only upload content you own or have rights to use</li>
          <li>Not to process illegal or harmful material</li>
          <li>Not to reverse engineer or overload our systems</li>
          <li>That processed videos exceeding 100MB may be automatically compressed</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. Copyright Policy</h2>
        <p className="mb-4">You must:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4 font-sans">
          <li>Obtain proper licenses for all uploaded content</li>
          <li>Not edit/distribute copyrighted material without permission</li>
        </ul>
      </section>




    </div>
  );
}