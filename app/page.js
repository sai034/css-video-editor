

'use client'
import { useState } from 'react';
import { FaPlay, FaEdit, FaImages, FaMusic, FaPalette, FaFont, FaDownload, FaCheck } from 'react-icons/fa';
import { IoMdPhotos } from "react-icons/io";
import { AiFillAudio } from "react-icons/ai";
import { MdSubtitles, MdHighQuality } from 'react-icons/md';
import { RiVideoUploadFill } from 'react-icons/ri';
import { IoMdTime } from 'react-icons/io';
import { useRouter } from 'next/navigation'
export default function LandingPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('features');
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const handleVideoEditor = () => {
    // router.push('/editor')
    window.open('/editor', '_blank')
  }
  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the email to your backend
    console.log('Subscribed with:', email);
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white ">
      {/* Hero Section */}
      <header className="relative bg-gradient-to-br  to-blue-900 py-20 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-4xl font-bold mb-6 font-sans">
            The Ultimate <span className="text-blue-400">CSS Video Editor</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-3xl mx-auto font-sans">
            Transform your videos with powerful editing tools - no complex software required!
          </p>
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <div
              onClick={handleVideoEditor}
              target="_blank"
              className="text-center text-lg md:text-xl cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold w-[270px] h-[60px] rounded-lg  transition duration-300 flex items-center justify-center gap-2 font-sans"
            >
              <FaPlay /> Try Editor Now
            </div>

          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-gray-900 to-transparent"></div>
      </header>

      {/* Features Section */}
      <section id="features" className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-16 font-sans">
            Powerful Features for <span className="text-blue-400">Seamless Editing</span>
          </h2>



          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 font-sans">
            {/* Feature 1 */}
            <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition duration-300 hover:shadow-lg">
              <div className="text-blue-400 mb-4">
                <RiVideoUploadFill className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Video Upload</h3>
              <p className="text-gray-400">
                Simply drag and drop your video files to start editing. Supports all major video formats.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition duration-300 hover:shadow-lg">
              <div className="text-blue-400 mb-4">
                <AiFillAudio className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Enable/Disable Original Audio</h3>
              <p className="text-gray-400">
                Choose whether to include the video&apos;s original audio or not based on your preference.
              </p>

            </div>

            <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition duration-300 hover:shadow-lg">
              <div className="text-blue-400 mb-4">
                <IoMdTime className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Precise Trimming</h3>
              <p className="text-gray-400">
                Cut your videos with frame-perfect accuracy. Set exact start and end times in seconds.
              </p>
            </div>
            {/* Feature 3 */}
            <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition duration-300 hover:shadow-lg">
              <div className="text-blue-400 mb-4">
                <MdSubtitles className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Professional Subtitles</h3>
              <p className="text-gray-400">
                Add, edit, and customize subtitles. Import SRT files or create them directly in the editor, and choose your preferred font size and style.              </p>
            </div>

            <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition duration-300 hover:shadow-lg">
              <div className="text-blue-400 mb-4">
                <IoMdPhotos className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Cover Photo</h3>
              <p className="text-gray-400">
                Add a custom cover photo to your video to make it more appealing and attract attention                  </p>
            </div>
            {/* Feature 4 */}
            <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition duration-300 hover:shadow-lg">
              <div className="text-blue-400 mb-4">
                <FaImages className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Image Overlays</h3>
              <p className="text-gray-400">
                Add logos, watermarks, or any images to your videos with precise positioning and timing.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition duration-300 hover:shadow-lg">
              <div className="text-blue-400 mb-4">
                <FaMusic className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Background Music</h3>
              <p className="text-gray-400">
                Choose from our royalty-free music library or upload your own tracks with volume control.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition duration-300 hover:shadow-lg">
              <div className="text-blue-400 mb-4">
                <FaPalette className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Background Colors</h3>
              <p className="text-gray-400">
                Change video backgrounds with solid colors or gradients at specific time intervals.
              </p>
            </div>

            {/* Feature 7 */}
            <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition duration-300 hover:shadow-lg">
              <div className="text-blue-400 mb-4">
                <FaFont className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Text & Shapes</h3>
              <p className="text-gray-400">
                Add stylish text elements with various shapes or without shapes, colors, and animations to your videos.
              </p>
            </div>

            {/* Feature 8 */}
            <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition duration-300 hover:shadow-lg">
              <div className="text-blue-400 mb-4">
                <MdHighQuality className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">High Quality Output</h3>
              <p className="text-gray-400">
                Export your videos in multiple formats (MP4, WebM, MOV) without quality loss.
              </p>
            </div>

            {/* Feature 9 */}
            <div className="bg-gray-800 p-6 rounded-xl hover:bg-gray-750 transition duration-300 hover:shadow-lg">
              <div className="text-blue-400 mb-4">
                <FaDownload className="text-4xl" />
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Download</h3>
              <p className="text-gray-400">
                One-click download of your edited videos or subtitles in various formats.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-xl md:text-3xl font-bold text-center mb-16 font-sans">
            How To Use Our <span className="text-blue-400">Video Editor</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="bg-blue-600  w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                1
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 font-sans">Upload Your Video</h3>
              <p className="text-gray-400 font-sans">
                Drag and drop your video file or click to browse. Our editor supports most video formats.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                2
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 font-sans">Edit & Enhance</h3>
              <p className="text-gray-400 font-sans">
                Trim, add subtitles, overlay images, insert music, and apply other effects as needed.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="bg-blue-600 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-6 text-2xl font-bold">
                3
              </div>
              <h3 className="text-lg md:text-xl font-bold mb-3 font-sans">Download & Share</h3>
              <p className="text-gray-400 font-sans">
                Export your final video in your preferred format and share it with the world!
              </p>
            </div>
          </div>
        </div>
      </section>




      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br  to-blue-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl md:text-3xl font-sans font-bold mb-6 ">
            Ready to Create <span className="text-blue-300">Amazing Videos</span>?
          </h2>
          <a
            onClick={handleVideoEditor}
            className="bg-white cursor-pointer hover:bg-gray-100 font-sans text-blue-900 font-bold py-4 px-8 rounded-lg text-md sm:text-lg transition duration-300 inline-block"
          >
            Start Editing Now - It&apos;s Free!
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-gray-800">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-1 gap-8">
          {/* Company Info */}
          <div>
            <h3 className="text-xl font-bold mb-4 text-white font-sans">CSS Video Editor</h3>
            <p className="text-gray-400 font-sans">
              The most powerful browser-based video editor with advanced features for creators.Empowering creators worldwide with intuitive, browser-based editing tools. Start crafting stunning videos today - no downloads required
            </p>
          </div>

          {/* Features Section */}
          <div>
            <h4 className="font-bold mb-4 text-white font-sans">Features</h4>
            <ul className="space-y-2 flex flex-col lg:flex-row gap-4 font-sans">
              <li><a href="#" className="text-gray-400 hover:text-white transition">Video Trimming</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Enable/Disable Original Audio </a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Subtitles</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Cover Photo</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Image Overlays</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Background Music</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Background Color</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Best Video Quality</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Text Positioning</a></li>

            </ul>
          </div>
          <div className=" pt-8 text-sm  border-t border-gray-700  font-sans ">

            <div className="flex flex-nowrap justify-center gap-4 text-xs sm:text-[13.5px]">
              <a href="/privacy" target='_blank' className="text-gray-400 hover:text-white ">Privacy</a>
              <a href="/terms-conditions" target='_blank' className="text-gray-400 hover:text-white">Terms & Conditions</a>
              <a href="/copyright" target='_blank' className="text-gray-400 hover:text-white">Copyright</a>
            </div>

          </div>
        </div>


      </footer>

    </div>
  );
}