
export default function PrivacyPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-sans b">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">1. Information We Collect</h2>
        <p className="mb-4">When you use CSS Video Editor, we may collect:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li><strong>Uploaded Content:</strong> Videos, images, and audio files you process (stored temporarily during editing)</li>
          <li><strong>Usage Data:</strong> Features used, session duration, device information</li>
          <li><strong>Cookies:</strong> For functionality and analytics (manage via browser settings)</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">2. How We Use Data</h2>
        <p>We use collected information to:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>Provide and improve the editing service</li>
          <li>Analyze usage patterns for optimization</li>
          <li>Prevent abuse and comply with legal requirements</li>
          <li>Communicate service updates (if you opt-in)</li>
        </ul>
        <p><strong>Note:</strong> We never sell your data or use uploaded content beyond providing the editing service.</p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">3. Data Retention</h2>
        <div className="list-disc pl-6 space-y-2">
          <p><strong>Processed Videos:</strong> Automatically deleted from our servers after use</p>

        </div>
      </section>

      
    </div>
  );
}