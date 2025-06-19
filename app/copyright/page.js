// pages/copyright.js
export default function CopyrightPolicy() {
  return (
    <div className="max-w-4xl mx-auto py-12 px-4 font-sans">
      <h1 className="text-3xl font-bold mb-8">Copyright Policy</h1>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">User Responsibilities</h2>
        <ul className="list-disc pl-6 space-y-2 mb-4">
          <li>You must own or have licenses for all uploaded content</li>
          <li>Editing copyrighted material (movies, TV shows, music videos) is prohibited</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Content Scanning</h2>
        <p>Our system automatically checks for:</p>
        <ul className="list-disc pl-6 space-y-2 mb-4 mt-2">
          <li>Known copyrighted audio fingerprints</li>
          <li>Visual matches to protected content</li>
          <li>Suspicious filenames (e.g., &quot;movie_clip.mp4&quot;)</li>
        </ul>
        <p>Detected violations may result in automatic content removal.</p>
      </section>



      <section>
        <h2 className="text-xl font-semibold mb-4">Our Content</h2>
        <p>All interface elements, logos, and documentation of CSS Video Editor are the property of CSS Video Editor. Unauthorized use is strictly prohibited.</p>
      </section>
    </div>
  );
}





